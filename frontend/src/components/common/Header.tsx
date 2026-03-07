import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, User, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';
import * as notificationApi from '../../api/notificationApi';
import type { Notification } from '../../types';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'citizen':
        return '/citizen';
      case 'municipality':
        return '/municipality';
      case 'contractor':
        return '/contractor';
      default:
        return '/';
    }
  };

  const fetchNotifications = useCallback(async () => {
    setIsNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await notificationApi.getNotifications({ limit: 20 });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch {
      setNotificationsError('Failed to load notifications.');
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getNotifications({ limit: 1 });
      setUnreadCount(response.data.unreadCount);
    } catch {
      // Ignore background refresh errors
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetchNotifications();
  }, [fetchNotifications, user?._id]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    void fetchNotifications();
  }, [fetchNotifications, isNotificationsOpen]);

  useEffect(() => {
    if (!user) return;
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [refreshUnreadCount, user?._id]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideDesktop = notificationsRef.current?.contains(target) ?? false;
      const clickedInsideMobile = mobileNotificationsRef.current?.contains(target) ?? false;
      if (!clickedInsideDesktop && !clickedInsideMobile) setIsNotificationsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNotificationsOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isNotificationsOpen]);

  const markNotificationAsRead = async (id: string) => {
    let shouldDecrement = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n._id !== id) return n;
        if (n.isRead) return n;
        shouldDecrement = true;
        return { ...n, isRead: true };
      })
    );
    if (shouldDecrement) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationApi.markNotificationAsRead(id);
    } catch {
      void fetchNotifications();
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationApi.markAllNotificationsAsRead();
    } catch {
      void fetchNotifications();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="flex items-center space-x-2">
              <img
              src="/logo.png"
              alt="NagarSetu Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-900">NagarSetu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'citizen' && (
              <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <span>{user.citizen?.totalPoints || 0} points</span>
              </div>
            )}

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-primary-50 rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  isLoading={isNotificationsLoading}
                  error={notificationsError}
                  onRefresh={() => void fetchNotifications()}
                  onMarkAllAsRead={() => void markAllNotificationsAsRead()}
                  onMarkAsRead={(id) => void markNotificationAsRead(id)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center space-x-3 pl-3 border-l border-gray-200 pr-2 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.profile?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  {user?.role === 'citizen' && (
                    <>
                      <Link
                        to="/citizen/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-primary-50"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <hr className="my-1" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
              style={{ display: 'none' }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsUserMenuOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.profile?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>

              {user?.role === 'citizen' && (
                <div className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                  {user.citizen?.totalPoints || 0} points earned
                </div>
              )}

              <div className="relative" ref={mobileNotificationsRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-lg"
                >
                  <span className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </span>
                  {unreadCount > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-red-600 text-white text-xs leading-6 text-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <NotificationsDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    isLoading={isNotificationsLoading}
                    error={notificationsError}
                    onRefresh={() => void fetchNotifications()}
                    onMarkAllAsRead={() => void markAllNotificationsAsRead()}
                    onMarkAsRead={(id) => void markNotificationAsRead(id)}
                  />
                )}
              </div>

              {user?.role === 'citizen' && (
                <Link
                  to="/citizen/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
