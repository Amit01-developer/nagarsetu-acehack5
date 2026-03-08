import { useEffect, useState } from 'react';
import { X, Star, Timer } from 'lucide-react';
import { Issue, ISSUE_CATEGORIES } from '../../types';

interface FeedbackModalProps {
  issue: Issue;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    qualityRating: number;
    speedRating: number;
    comment: string;
  }) => void;
}

const RatingRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => {
          const active = value >= score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`w-10 h-10 rounded-full border transition transform hover:-translate-y-0.5 ${
                active
                  ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
              aria-label={`${label} ${score} star${score > 1 ? 's' : ''}`}
            >
              <Star className="w-4 h-4" fill={active ? 'currentColor' : 'none'} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FeedbackModal = ({ issue, isSubmitting, onClose, onSubmit }: FeedbackModalProps) => {
  const [qualityRating, setQualityRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const categoryLabel =
    ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label || issue.category;

  const handleSubmit = () => {
    onSubmit({
      qualityRating,
      speedRating,
      comment: comment.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Submit feedback"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Resolved issue</p>
            <p className="text-base font-semibold text-gray-900">
              {categoryLabel} · {issue._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close feedback"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-gray-700">
            Tell us how the contractor performed so the municipality can review their work.
          </p>

          <div className="grid gap-4">
            <RatingRow
              label="Quality of work"
              value={qualityRating}
              onChange={setQualityRating}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Timer className="w-4 h-4 text-primary-600" />
                <span>Speed of resolution</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => {
                  const active = speedRating >= score;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSpeedRating(score)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        active
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                      }`}
                      aria-label={`Speed rating ${score}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800" htmlFor="feedback-comment">
              Comment (optional)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share any details about the service..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400">{comment.length}/500</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
