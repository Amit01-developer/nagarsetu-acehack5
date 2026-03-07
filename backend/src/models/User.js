const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    emailOtpHash: {
      type: String,
      select: false,
    },
    emailOtpExpiresAt: {
      type: Date,
    },
    emailOtpLastSentAt: {
      type: Date,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'municipality', 'contractor'],
      required: [true, 'Role is required'],
    },
    profile: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
      },
    },
    // Citizen-specific fields
    citizen: {
      totalPoints: {
        type: Number,
        default: 0,
      },
    },
    // Municipality-specific fields
    municipality: {
      jurisdiction: {
        type: String,
      },
      department: {
        type: String,
      },
    },
    // Contractor-specific fields
    contractor: {
      company: {
        type: String,
      },
      licenseNumber: {
        type: String,
      },
      specialization: [{
        type: String,
        enum: ['pothole', 'garbage', 'water_leak', 'street_light', 'drainage', 'other'],
      }],
    },
    // OneSignal device tokens for push notifications
    deviceTokens: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ 'citizen.totalPoints': -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
