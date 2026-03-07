import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as userApi from '../api/userApi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await userApi.getProfileFull();
      setProfileData(response.data);
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-primary-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Failed to load profile data</p>
        </main>
      </div>
    );
  }

  const { user: profileUser, recentTransactions } = profileData;
  const totalPoints = profileUser.citizen?.totalPoints || 0;

  // Determine tier based on points
  const getTier = (points: number) => {
    if (points >= 500) return { name: 'Legendary', color: 'text-yellow-600' };
    if (points >= 300) return { name: 'Elite', color: 'text-purple-600' };
    if (points >= 200) return { name: 'Expert', color: 'text-blue-600' };
    if (points >= 100) return { name: 'Master', color: 'text-green-600' };
    return { name: 'Novice', color: 'text-gray-600' };
  };

  const tier = getTier(totalPoints);

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:items-start">
              {profileUser.profile?.avatar ? (
                <img
                  src={profileUser.profile.avatar}
                  alt={profileUser.profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                  {profileUser.profile?.name
                    ?.split(" ")
                    .map((word: string) => word.charAt(0).toUpperCase())
                    .join("")}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileUser.profile?.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tier.color} bg-gray-100`}>
                  {tier.name} Tier
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profileUser.email}</span>
                </div>
                {profileUser.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{profileUser.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-gray-500">
                    Member since {new Date(profileUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 min-w-max">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Points</p>
                <p className="text-4xl font-bold text-primary-600 mb-3">{totalPoints}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-700">
                    {tier.name} Tier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 animate-fade-up" style={{ ['--anim-delay' as any]: '240ms' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction: any) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-primary-600">+{transaction.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
