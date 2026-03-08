import { Link } from 'react-router-dom';
import { MapPin, Shield, Wrench, Award, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/common/Footer';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-primary-50 dark:bg-dark-bg smooth-transition">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-sm smooth-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 dark:bg-dark-accent-blue rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="NagarSetu Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">NagarSetu</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:bg-primary-50 dark:hover:bg-dark-card rounded-lg smooth-transition"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <Link
                to="/login"
                className="text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary font-medium smooth-transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 dark:bg-dark-accent-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-dark-accent-blue/80 smooth-transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-dark-surface dark:to-dark-bg text-white smooth-transition py-20 overflow-hidden">
        {/* Cityscape Background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-64">
            <img 
              src="/cityscape.svg" 
              alt="" 
              className="w-full h-full object-cover object-bottom"
              style={{ 
                filter: 'brightness(0.8) contrast(1.2)',
                transform: 'scaleX(2)',
                objectFit: 'cover',
                objectPosition: 'bottom'
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 50 }}>
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <h1 className="relative text-5xl md:text-7xl font-bold mb-6 hero-title-shadow" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, letterSpacing: '-0.02em', zIndex: 100 }}>
              <span className="text-white dark:text-dark-text-primary" style={{ position: 'relative', zIndex: 100 }}>Welcome to </span>
              <span className="text-white dark:text-dark-text-primary rotating-text" style={{ fontStyle: 'italic', fontSize: '1em', position: 'relative', zIndex: 100, display: 'inline-block' }}>
                <span className="text-item" style={{ position: 'relative', zIndex: 100, color: 'white' }}>नगरसेतु</span>
                <span className="text-item" style={{ position: 'absolute', zIndex: 100, color: 'white' }}>NagarSetu</span>
                <span className="text-item" style={{ position: 'absolute', zIndex: 100, color: 'white' }}>नगरसेतू</span>
                <span className="text-item" style={{ position: 'absolute', zIndex: 100, color: 'white' }}>ਨਗਰਸੇਤੂ</span>
                <span className="text-item" style={{ position: 'absolute', zIndex: 100, color: 'white' }}>নগরসেতু</span>
              </span>
            </h1>
            <p className="text-xl text-primary-100 dark:text-dark-text-secondary mb-8">
              Connecting citizens, municipalities, and contractors to resolve
              civic issues like potholes, garbage, and water leaks efficiently.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-white dark:bg-dark-accent-blue text-primary-600 dark:text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-dark-accent-blue/80 smooth-transition flex items-center space-x-2"
              >
                <span>Start Reporting</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white dark:border-dark-accent-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 dark:hover:bg-dark-accent-blue/20 smooth-transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary-50 dark:bg-dark-bg smooth-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              A simple and transparent process to report and resolve civic issues in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm hover:shadow-md smooth-transition animate-fade-up border border-transparent dark:border-dark-border">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Report Issues</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Citizens can report civic issues with photos and GPS location. Track status in real-time.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm hover:shadow-md smooth-transition animate-fade-up border border-transparent dark:border-dark-border" style={{ ['--anim-delay' as any]: '80ms' }}>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Verify & Assign</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Municipality officials verify reports and assign them to qualified contractors.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm hover:shadow-md smooth-transition animate-fade-up border border-transparent dark:border-dark-border" style={{ ['--anim-delay' as any]: '160ms' }}>
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                <Wrench className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Resolve & Update</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Contractors receive work orders, update progress, and submit completion reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-dark-accent-orange dark:to-orange-600 rounded-2xl p-8 md:p-12 animate-pop-in smooth-transition">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-10 h-10" />
                  <h2 className="text-3xl font-bold">Earn Rewards</h2>
                </div>
                <p className="text-white/90 text-lg max-w-xl">
                  Get rewarded for making your city better! Earn points for reporting valid issues
                  and when they get resolved.
                </p>
                <div className="flex items-center gap-8 mt-6">
                  <div>
                    <span className="text-4xl font-bold">+10</span>
                    <p className="text-white/80">points for verified reports</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">+20</span>
                    <p className="text-white/80">points when resolved</p>
                  </div>
                </div>
              </div>
              <Link
                to="/register"
                className="bg-white dark:bg-dark-bg text-orange-600 dark:text-dark-accent-orange px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-dark-card smooth-transition whitespace-nowrap"
              >
                Start Earning Points
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
