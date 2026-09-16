import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import { createReview, checkReviewEligibility } from '../services/api';

interface ReviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [eligibilityChecked, setEligibilityChecked] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && order) {
      setRating(5);
      setComment('');
      setErrorMessage('');
      const checkEligibility = async () => {
        const orderIdStr = order.id || order._id || order.orderId;
        const res = await checkReviewEligibility(orderIdStr);
        setIsEligible(res.isEligible);
        if (!res.isEligible) {
          setErrorMessage(res.reason || 'This order is not eligible for review.');
        }
        setEligibilityChecked(true);
      };
      checkEligibility();
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderIdStr = order.id || order._id || order.orderId;
      const res = await createReview({
        orderId: orderIdStr,
        customerId: order.customerId,
        tailorId: order.tailorId,
        rating,
        comment,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        onReviewSubmitted();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⭐</span> Review Your Tailored Garment
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Order #{order.orderId} • {order.productSnapshot?.name || 'Custom Garment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {!eligibilityChecked ? (
            <div className="py-6 text-center text-slate-400 text-sm">Verifying order eligibility...</div>
          ) : !isEligible ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-4xl">🔒</div>
              <p className="text-xs text-slate-300">
                Only completed & delivered orders can be reviewed. Duplicate reviews per order are strictly prevented.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Star Rating Selector */}
              <div className="text-center py-2 space-y-2">
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-700'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-amber-400">
                  {rating === 5 && 'Outstanding Bespoke Craftsmanship! 🌟'}
                  {rating === 4 && 'Great Quality & Fit! 👍'}
                  {rating === 3 && 'Satisfactory Garment'}
                  {rating === 2 && 'Needs Improvement'}
                  {rating === 1 && 'Unsatisfactory Fit'}
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Share your experience with tailor craftsmanship & fit (Optional):
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe fabric quality, fitting precision, embroidery, or customer service..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Review...' : 'Publish Customer Review ★'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
