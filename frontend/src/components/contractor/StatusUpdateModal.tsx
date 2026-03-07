import { useState, useRef } from 'react';
import { X, Upload, PlayCircle, CheckCircle } from 'lucide-react';
import { Issue } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface StatusUpdateModalProps {
  issue: Issue;
  onClose: () => void;
  onSubmit: (
    status: 'in_progress' | 'completed',
    description?: string,
    images?: File[]
  ) => Promise<void>;
}

const StatusUpdateModal = ({ issue, onClose, onSubmit }: StatusUpdateModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const isStarting = issue.status === 'assigned';
  const nextStatus = isStarting ? 'in_progress' : 'completed';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isStarting && images.length === 0) {
      alert('Please upload at least one photo of the completed work');
      return;
    }

    setIsLoading(true);
    await onSubmit(nextStatus, description, images.length > 0 ? images : undefined);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-pop-in">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isStarting ? 'Start Work' : 'Complete Work'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Issue Summary */}
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Work Order</p>
            <p className="text-gray-900 font-medium line-clamp-2">{issue.description}</p>
            <p className="text-sm text-gray-500 mt-2 capitalize">
              Category: {issue.category.replace('_', ' ')}
            </p>
          </div>

          {/* Description (for completion) */}
          {!isStarting && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the work done..."
              />
            </div>
          )}

          {/* Image Upload (for completion) */}
          {!isStarting && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Photos (Required)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="grid grid-cols-4 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              isStarting
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : isStarting ? (
              <>
                <PlayCircle className="w-5 h-5" />
                Start Working
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
