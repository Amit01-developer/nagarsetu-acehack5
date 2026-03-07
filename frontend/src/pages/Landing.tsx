import { Link } from 'react-router-dom';
import { MapPin, Shield, Wrench, Award, ArrowRight } from 'lucide-react';
import Footer from '../components/common/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-primary-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="NagarSetu Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900">NagarSetu</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Report Civic Issues. Track Progress. Earn Rewards.
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              NagarSetu connects citizens, municipalities, and contractors to resolve
              civic issues like potholes, garbage, and water leaks efficiently.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
              >
                <span>Start Reporting</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple and transparent process to report and resolve civic issues in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-up">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Report Issues</h3>
              <p className="text-gray-600">
                Citizens can report civic issues with photos and GPS location. Track status in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-up" style={{ ['--anim-delay' as any]: '80ms' }}>
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verify & Assign</h3>
              <p className="text-gray-600">
                Municipality officials verify reports and assign them to qualified contractors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-up" style={{ ['--anim-delay' as any]: '160ms' }}>
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Wrench className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Resolve & Update</h3>
              <p className="text-gray-600">
                Contractors receive work orders, update progress, and submit completion reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 md:p-12 animate-pop-in">
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
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors whitespace-nowrap"
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
