import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Upload, X, MapPin, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as issueApi from '../api/issueApi';
import * as aiApi from '../api/aiApi';
import { ISSUE_CATEGORIES, IssueCategory } from '../types';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReportForm {
  category: IssueCategory;
  description: string;
  address: string;
}

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

const LocationMarker = ({ position, setPosition }: LocationMarkerProps) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportForm>();

  useEffect(() => {
    // Try to get user's location
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        () => {
          // Default to a central location if geolocation fails
          setPosition([12.9716, 77.5946]); // Bangalore
          setIsLocating(false);
          toast.error('Could not get your location. Please select manually on the map.');
        }
      );
    } else {
      setPosition([12.9716, 77.5946]);
      setIsLocating(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // AI: Auto-categorize issue based on description
  const handleAutoCategorize = async () => {
    const description = watch('description');
    if (!description || description.length < 10) {
      toast.error('Please enter a longer description for AI to categorize');
      return;
    }

    setIsCategorizing(true);
    try {
      const response = await aiApi.categorizeIssue(description);
      const category = response.data.category as IssueCategory;
      setValue('category', category);
      toast.success(`AI categorized as: ${category.replace('_', ' ')}`);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to categorize');
    } finally {
      setIsCategorizing(false);
    }
  };

  // AI: Enhance description
  const handleEnhanceDescription = async () => {
    const description = watch('description');
    const category = watch('category');
    if (!description || description.length < 10) {
      toast.error('Please enter a longer description to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await aiApi.enhanceDescription(description, category);
      setValue('description', response.data.enhanced);
      toast.success('Description enhanced!');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to enhance description');
    } finally {
      setIsEnhancing(false);
    }
  };

  const onSubmit = async (data: ReportForm) => {
    if (!position) {
      toast.error('Please select a location on the map');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    try {
      await issueApi.createIssue({
        category: data.category,
        description: data.description,
        latitude: position[0],
        longitude: position[1],
        address: data.address,
        images,
      });
      toast.success('Issue reported successfully! You\'ll earn 10 points once verified.');
      navigate('/citizen');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/citizen')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 animate-pop-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Issue Category
                </label>
                <button
                  type="button"
                  onClick={handleAutoCategorize}
                  disabled={isCategorizing}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isCategorizing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Auto-categorize with AI
                    </>
                  )}
                </button>
              </div>
              <select
                {...register('category', { required: 'Please select a category' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleEnhanceDescription}
                  disabled={isEnhancing}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isEnhancing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 mr-1" />
                      Enhance with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                {...register('description', {
                  required: 'Please describe the issue',
                  maxLength: { value: 1000, message: 'Max 1000 characters' },
                })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Describe the issue in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300 mb-2">
                {isLocating ? (
                  <div className="h-full flex items-center justify-center bg-primary-50">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600">Getting your location...</span>
                  </div>
                ) : position ? (
                  <MapContainer
                    center={position}
                    zoom={15}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-primary-50">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      Get Current Location
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Click on the map to adjust the location
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (Optional)
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the address or landmark"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Max 5)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Submit Report'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;
