import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Upload, X, MapPin, ArrowLeft, Sparkles, Wand2, Camera, Mic, MicOff } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    return () => {
      stopCameraStream();
      recognitionRef.current?.stop?.();
      recognitionRef.current?.abort?.();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Ensure stream attaches once the modal renders
  useEffect(() => {
    const attachStream = async () => {
      if (isCameraOpen && streamRef.current && videoRef.current) {
        const video = videoRef.current;
        video.srcObject = streamRef.current;
        // Muting helps some browsers allow autoplay after user gesture
        video.muted = true;
        try {
          await video.play();
        } catch (err) {
          console.error('Video play error', err);
          setCameraError('Unable to start camera preview. Please try again.');
        }
      }
    };
    attachStream();
  }, [isCameraOpen]);

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

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const openCamera = async () => {
    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported on this device');
      return;
    }

    setIsCameraLoading(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Camera error', error);
      setCameraError('Could not access camera. Please allow permission or use Upload.');
      toast.error('Camera permission denied or unavailable');
      stopCameraStream();
    } finally {
      setIsCameraLoading(false);
    }
  };

  const closeCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError('Camera not ready yet.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Unable to capture photo.');
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Failed to capture image');
          return;
        }

        if (images.length >= 5) {
          toast.error('Maximum 5 images allowed');
          closeCamera();
          return;
        }

        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

        if (file.size > 5 * 1024 * 1024) {
          toast.error('Captured image is too large (max 5MB)');
          return;
        }

        const preview = canvas.toDataURL('image/jpeg', 0.9);

        setImages((prev) => [...prev, file]);
        setImagesPreviews((prev) => [...prev, preview]);

        toast.success('Photo captured');
        closeCamera();
      },
      'image/jpeg',
      0.9
    );
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

  // Voice to text for description
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice input not available');
    };
    recognition.onresult = (event: any) => {
      let finalText = '';
      Array.from(event.results).forEach((result: any) => {
        const text = result[0].transcript.trim();
        if (result.isFinal) {
          finalText += `${text} `;
        }
      });
      if (finalText.trim()) {
        const current = watch('description') || '';
        const next = `${current ? `${current} ` : ''}${finalText.trim()}`;
        setValue('description', next);
        toast.success('Voice captured');
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 1500);
    };

    recognitionRef.current = recognition;
  }, [setValue, watch]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch {
      toast.error('Unable to start voice input');
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
                  Description of Issue
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
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border ${
                    isListening
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Listening...' : 'Voice complaint'}</span>
                </button>
                <p className="text-xs text-gray-500">Speak and we’ll fill the description for you.</p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Current Location
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
                Landmark (Optional)
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the landmark"
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

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={openCamera}
                    disabled={isCameraLoading}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    {isCameraLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500 mt-1">Camera</span>
                  </button>
                )}
              </div>
            </div>

            {isCameraOpen && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-4 sm:p-6 animate-pop-in relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Camera className="w-5 h-5 text-primary-600 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">Live Camera</h2>
                    </div>
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <p className="text-sm text-white text-center px-4">{cameraError}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-gray-500">Align the issue in frame and tap capture.</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                      >
                        Capture Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
