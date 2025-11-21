"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Send, User, Trash2, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateReview, getReviews, deleteReview } from "@/lib/api/recipe";
import type { ReviewResponse } from "@/types/recipe";
import { StarRating } from "@/components/StarRating";

interface ReviewSectionProps {
  recipeAlias: string;
  token: string;
}

export function ReviewSection({ recipeAlias, token }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [newReview, setNewReview] = useState("");
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ alias: string; id: number } | null>(null);

  // Fetch reviews on component mount
  useEffect(() => {
    if (recipeAlias && token) {
      fetchReviews();
    }
  }, [recipeAlias, token]);

  const fetchReviews = async () => {
    if (!recipeAlias || !token) return;

    setIsLoading(true);
    try {
      const response = await getReviews(recipeAlias, token);
      if (response.success && response.data) {
        setReviews(response.data.data || []);
      } else {
        console.error("Failed to fetch reviews:", response.message);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average rating and rating breakdown
  const calculateRatingStats = () => {
    // Note: API doesn't currently return ratings, so we'll use placeholder data
    // In a real implementation, reviews would have a rating field
    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // For now, assume all reviews are 5 stars (placeholder)
    // When API supports ratings, update this logic
    ratingCounts[5] = totalReviews;
    
    const totalRating = totalReviews * 5;
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    return {
      averageRating: averageRating.toFixed(1),
      totalReviews,
      ratingCounts,
    };
  };

  const ratingStats = calculateRatingStats();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.trim()) {
      toast.error("Please enter a review");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    if (!token) {
      toast.error("Please login to review");
      return;
    }

    setIsSubmitting(true);

    try {
      // Note: API currently only accepts content, not rating
      // When backend supports ratings, include rating in the request
      const response = await createOrUpdateReview(recipeAlias, newReview.trim(), token);
      
      if (response.success && response.data?.data) {
        // Refresh reviews to get the latest list
        await fetchReviews();
        setNewReview("");
        setUserRating(0);
        toast.success(response.data.message || "Review added successfully!");
      } else {
        toast.error(response.message || "Failed to add review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while adding review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewAlias: string, reviewId: number) => {
    setReviewToDelete({ alias: reviewAlias, id: reviewId });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete || !reviewToDelete.alias || !token) {
      toast.error("Cannot delete review");
      return;
    }

    setDeletingReviewId(reviewToDelete.id);
    try {
      const response = await deleteReview(reviewToDelete.alias, token);
      
      if (response.success) {
        // Remove the review from the list
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        toast.success(response.data?.message || "Review deleted successfully");
        setShowDeleteConfirm(false);
        setReviewToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setReviewToDelete(null);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = (user: { referral_code: string | null; name: string | null }) => {
    if (user.name) return user.name;
    if (user.referral_code) return user.referral_code;
    return "Anonymous";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getRatingPercentage = (count: number) => {
    if (ratingStats.totalReviews === 0) return 0;
    return (count / ratingStats.totalReviews) * 100;
  };

  return (
    <div className="w-full space-y-6">
      {/* Reviews & Ratings Section */}
      <div className="bg-gray-100 border-2 border-orange-500 rounded-lg p-4 md:p-6">
        <h2 className="text-xl font-semibold text-orange-500 mb-6">Reviews & Ratings</h2>
        
        {/* Your Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Your Rating</label>
          <StarRating
            rating={userRating}
            interactive={true}
            onRatingChange={setUserRating}
            size={24}
            color="#9ca3af"
            className="[&_button]:border-2 [&_button]:border-gray-300 [&_button]:rounded [&_button]:bg-transparent [&_button:hover]:border-orange-500"
          />
        </div>

        {/* Your Comment */}
        <form onSubmit={handleSubmitReview}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">Your Comment</label>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share your experience with this recipe....."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 placeholder:text-gray-400"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Submit Review Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !newReview.trim() || userRating === 0}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Customer Reviews Section */}
      <div>
        <h2 className="text-xl font-semibold text-orange-500 mb-6">Customer Reviews</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => {
              const displayName = getUserDisplayName(review.user);
              const isDeleting = deletingReviewId === review.id;
              // Note: When API supports ratings, use review.rating instead of 5
              const reviewRating = 5; // Placeholder
              
              return (
                <div key={review.id} className="bg-gray-100 border-2 border-orange-500 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(review.created_at)}
                        </span>
                      </div>
                      <StarRating rating={reviewRating} size={16} />
                    </div>
                    {review.alias && (
                      <button
                        onClick={() => handleDeleteClick(review.alias, review.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-900 leading-relaxed text-sm">
                    {review.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 h-[100dvh] bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600 transition"
                disabled={deletingReviewId !== null}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={deletingReviewId !== null}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingReviewId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingReviewId !== null ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
