import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as authApi from '../api/authApi';

interface VerifyEmailForm {
  email: string;
  otp: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultEmail = useMemo(() => (searchParams.get('email') || '').trim().toLowerCase(), [searchParams]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailForm>({
    defaultValues: {
      email: defaultEmail,
      otp: '',
    },
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail);
    }
  }, [defaultEmail, setValue]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  const onVerify = async (data: VerifyEmailForm) => {
    setIsVerifying(true);
    try {
      const response = await authApi.verifyEmailOtp(data.email, data.otp);
      toast.success(response.message || 'Email verified successfully. Please login.');
      navigate('/login', { replace: true, state: { email: data.email } });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    if (!emailValue) {
      toast.error('Please enter your email.');
      return;
    }
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await authApi.requestEmailOtp(emailValue);
      toast.success(response.message || 'OTP sent.');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-scale">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
              <MailCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-gray-600 mt-2">Enter the 6-digit OTP sent to your email address.</p>
          </div>

          <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address',
                  },
                  setValueAs: (v: string) => (v || '').trim().toLowerCase(),
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP code
              </label>
              <input
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits',
                  },
                  setValueAs: (v: string) => (v || '').replace(/\D/g, '').slice(0, 6),
                })}
                type="text"
                inputMode="numeric"
                id="otp"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all tracking-[0.35em] text-center text-lg"
                placeholder="••••••"
                autoComplete="one-time-code"
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onResend}
              disabled={isResending || resendCooldown > 0}
              className="text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              {isResending ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
              <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
            </button>

            <Link to="/login" className="text-gray-600 hover:text-gray-800 font-medium">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

