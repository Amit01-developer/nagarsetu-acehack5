const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { sendEmail } = require('../services/emailService');
const { getEmailOtpConfig, generateNumericOtp, hashOtp } = require('../services/otpService');

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

const sendEmailVerificationOtp = async (user) => {
  const cfg = getEmailOtpConfig();

  const now = new Date();
  const cooldownMs = cfg.resendCooldownSeconds * 1000;
  if (user.emailOtpLastSentAt && now.getTime() - user.emailOtpLastSentAt.getTime() < cooldownMs) {
    return { sent: false };
  }

  const otp = generateNumericOtp();
  user.emailOtpHash = hashOtp(otp, user.email, cfg.hashSecret);
  user.emailOtpExpiresAt = new Date(Date.now() + cfg.ttlMinutes * 60 * 1000);
  user.emailOtpLastSentAt = now;
  user.emailOtpAttempts = 0;
  await user.save();

  const subject = 'Your NagarSetu verification code';
  const text = `Your verification code is ${otp}. It expires in ${cfg.ttlMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px 0;">Verify your email</h2>
      <p style="margin: 0 0 12px 0;">Use this code to verify your email address:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 12px 0;">${otp}</div>
      <p style="margin: 0;">This code expires in ${cfg.ttlMinutes} minutes.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });

  return { sent: true };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, role, profile, municipality, contractor } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // Create user object based on role
    const userData = {
      email: normalizedEmail,
      passwordHash: password,
      role,
      profile,
    };

    // Add role-specific fields
    if (role === 'citizen') {
      userData.citizen = { totalPoints: 0 };
    } else if (role === 'municipality') {
      userData.municipality = municipality || {};
    } else if (role === 'contractor') {
      userData.contractor = contractor || {};
    }

    const user = await User.create(userData);

    try {
      await sendEmailVerificationOtp(user);
    } catch (err) {
      await user.deleteOne();
      throw err;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your email for verification.',
      data: {
        email: user.email,
        verificationRequired: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Find user and include password for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +emailOtpHash +emailOtpAttempts');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isEmailVerified) {
      try {
        await sendEmailVerificationOtp(user);
      } catch {
        // If email sending fails, still block login with a clear message.
      }

      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email not verified. Please verify your email with the OTP sent to you.',
        data: { email: user.email },
      });
    }

    const token = generateToken(user._id, user.email, user.role);

    // Remove password from response
    user.passwordHash = undefined;

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request/resend email OTP (for unverified accounts)
// @route   POST /api/auth/request-email-otp
// @access  Public
exports.requestEmailOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+emailOtpHash +emailOtpAttempts');

    if (user && !user.isEmailVerified && user.isActive) {
      try {
        await sendEmailVerificationOtp(user);
      } catch {
        // Ignore email sending errors here to avoid leaking config/state.
      }
    }

    res.json({
      success: true,
      message: 'If your account exists and is not verified, an OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
exports.verifyEmailOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+emailOtpHash +emailOtpAttempts');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'Email already verified. Please login.',
      });
    }

    const cfg = getEmailOtpConfig();
    const now = Date.now();

    if (!user.emailOtpHash || !user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < now) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    if ((user.emailOtpAttempts || 0) >= cfg.maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.',
      });
    }

    const expectedHash = hashOtp(otp, user.email, cfg.hashSecret);
    if (expectedHash !== user.emailOtpHash) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    user.emailOtpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully. Please login.',
      data: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (remove device token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const { deviceToken } = req.body;

    if (deviceToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { deviceTokens: deviceToken },
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
exports.refreshToken = async (req, res, next) => {
  try {
    const token = generateToken(req.user._id, req.user.email, req.user.role);

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};
