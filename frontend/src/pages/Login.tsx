import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const locationState = (location.state || {}) as { from?: { pathname?: string }; email?: string };
  const prefillEmail = locationState.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: prefillEmail,
      password: '',
    },
  });

  const from = locationState.from?.pathname || getDashboardPath(user?.role);

  function getDashboardPath(role?: string) {
    switch (role) {
      case 'citizen':
        return '/citizen';
      case 'municipality':
        return '/municipality';
      case 'contractor':
        return '/contractor';
      default:
        return '/';
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate(from, { replace: true });
  }, [from, isAuthenticated, navigate, user]);

  const onSubmit = async (data: LoginForm) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; code?: string; data?: { email?: string } } } };
      const code = err.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        const email = err.response?.data?.data?.email || data.email;
        toast.error(err.response?.data?.message || 'Email not verified. Please verify your email.');
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
        return;
      }
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center p-4 smooth-transition">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 animate-fade-in-scale border border-transparent dark:border-dark-border">
          <div className="text-center mb-8">
            <div className="rounded-lg flex items-center justify-center mx-auto mb-1">
              <img
                src="/logo.png"
                alt="NagarSetu Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Welcome back</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mt-2">Sign in to your NagarSetu account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-accent-blue focus:border-transparent smooth-transition bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-dark-accent-red">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-accent-blue focus:border-transparent smooth-transition pr-12 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-dark-accent-red">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 dark:bg-dark-accent-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-dark-accent-blue/80 focus:ring-4 focus:ring-primary-200 dark:focus:ring-dark-accent-blue/30 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-dark-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-dark-accent-blue font-medium hover:text-primary-700 dark:hover:text-dark-accent-blue/80">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
