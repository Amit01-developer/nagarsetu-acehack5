import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-dark-bg text-white py-16 border-t border-gray-800 dark:border-dark-border smooth-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.png"
                alt="NagarSetu Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="text-xl font-bold dark:text-dark-text-primary">NagarSetu</span>
            </div>
            <p className="text-gray-400 dark:text-dark-text-secondary text-sm">
              Empowering citizens to build better, cleaner communities through transparent civic engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 dark:text-dark-text-primary">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 dark:text-dark-text-secondary hover:text-primary-400 dark:hover:text-dark-accent-blue smooth-transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 dark:text-dark-text-secondary hover:text-primary-400 dark:hover:text-dark-accent-blue smooth-transition">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 dark:text-dark-text-primary">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-400 dark:text-dark-accent-blue flex-shrink-0 mt-0.5" />
                <a href="mailto:cleanvillage63@gmail.com" className="text-gray-400 dark:text-dark-text-secondary hover:text-primary-400 dark:hover:text-dark-accent-blue smooth-transition text-sm">
                  cleanvillage63@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
