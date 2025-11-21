"use client";

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  Eye,
  EyeOff,
  Utensils,
  ClockFading,
  SendHorizontal,
  Bookmark,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { RecipeResponse } from "@/types/recipe";
import { timeAgo } from "@/lib/utils/timeAgo";
import { VideoJsPlayer } from "@/components/VideoJsPlayer";
import { toggleRecipeLike, getRecipeShareLinks, toggleSaveRecipe, toggleHideRecipe, type RecipeShareLinksResponse } from "@/lib/api/recipe";

interface RecipeCardProps {
  recipe: RecipeResponse;
  token?: string;
  onRecipeUpdated?: (updatedRecipe: RecipeResponse) => void;
  onRecipeHidden?: (recipeId: number, isHidden: boolean) => void;
}

export function RecipeCard({ recipe, token, onRecipeUpdated, onRecipeHidden }: RecipeCardProps) {
  const router = useRouter();
  const shareModalRef = useRef<HTMLDivElement>(null);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [isLiked, setIsLiked] = useState(recipe.is_liked_by_me);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isSaved, setIsSaved] = useState(recipe.is_saved_by_me || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHidden, setIsHidden] = useState(recipe.is_hidden_by_me || false);
  const [isTogglingHide, setIsTogglingHide] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoadingShareLinks, setIsLoadingShareLinks] = useState(false);
  const [shareLinks, setShareLinks] = useState<RecipeShareLinksResponse["share_links"] | null>(null);
  const [currentUserReferralCode, setCurrentUserReferralCode] = useState<string | null>(null);

  // Get current user's referral code
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        setCurrentUserReferralCode(data.referral_code || null);
      } catch (error) {
        console.error("[RecipeCard] Error fetching user data:", error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Check if recipe belongs to current user
  const isOwnRecipe = currentUserReferralCode && recipe.user_referral_code === currentUserReferralCode;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const hasImages = recipe.images && recipe.images.length > 0;
  const hasVideos = recipe.videos && recipe.videos.length > 0;
  const displayImage = hasImages ? recipe.images[0] : null;
  const displayVideo = hasVideos ? recipe.videos[0] : null;
  const userName = recipe.user_referral_code || "User";
  const timeAgoText = recipe.time || timeAgo(recipe.created_at);

  const handleCardClick = () => {
    // Use recipe_alias if available, otherwise use ID
    const identifier = recipe.alias || recipe.recipe_alias || recipe.id.toString();
    router.push(`/recipe/${identifier}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to like recipes");
      return;
    }

    if (isTogglingLike) return;

    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    setIsTogglingLike(true);
    const previousLikesCount = likesCount;
    const previousIsLiked = isLiked;

    // Optimistic update
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);

    try {
      const response = await toggleRecipeLike(recipeAlias, token);
      if (response.success && response.data) {
        setLikesCount(response.data.likes_count);
        setIsLiked(response.data.is_liked_by_me);
        
        // Update parent component if callback provided
        if (onRecipeUpdated) {
          onRecipeUpdated({
            ...recipe,
            likes_count: response.data.likes_count,
            is_liked_by_me: response.data.is_liked_by_me,
          });
        }
      } else {
        // Revert optimistic update on error
        setLikesCount(previousLikesCount);
        setIsLiked(previousIsLiked);
        toast.error(response.message || "Failed to toggle like");
      }
    } catch (error) {
      // Revert optimistic update on error
      setLikesCount(previousLikesCount);
      setIsLiked(previousIsLiked);
      console.error("[RecipeCard] Error toggling like:", error);
      toast.error("An error occurred while toggling like");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to share recipes");
      return;
    }

    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    setIsLoadingShareLinks(true);
    setShowShareModal(true);
    
    try {
      const response = await getRecipeShareLinks(recipeAlias, token);
      if (response.success && response.data?.share_links) {
        setShareLinks(response.data.share_links);
        
        // Update share count if callback provided
        if (onRecipeUpdated && response.data.share_count !== undefined) {
          onRecipeUpdated({
            ...recipe,
            share_count: response.data.share_count,
          });
        }
      } else {
        toast.error(response.message || "Failed to get share links");
        setShowShareModal(false);
      }
    } catch (error) {
      console.error("[RecipeCard] Error fetching share links:", error);
      toast.error("An error occurred while fetching share links");
      setShowShareModal(false);
    } finally {
      setIsLoadingShareLinks(false);
    }
  };

  const handleSharePlatform = (platform: 'facebook' | 'whatsapp' | 'twitter' | 'linkedin') => {
    if (!shareLinks) return;
    
    const url = shareLinks[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = async () => {
    if (!shareLinks?.copy_link) return;
    
    try {
      await navigator.clipboard.writeText(shareLinks.copy_link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("[RecipeCard] Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to save recipes");
      return;
    }

    if (isSaving) return;

    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    setIsSaving(true);
    const previousSaved = isSaved;

    // Optimistic update
    setIsSaved(!isSaved);

    try {
      const response = await toggleSaveRecipe(recipeAlias, token);
      if (response.success && response.data) {
        setIsSaved(response.data.saved);
        
        // Update parent component if callback provided
        if (onRecipeUpdated) {
          onRecipeUpdated({
            ...recipe,
            is_saved_by_me: response.data.saved,
          });
        }
        
        toast.success(response.data.message || (response.data.saved ? "Recipe saved successfully" : "Recipe removed from saved list"));
      } else {
        // Revert optimistic update on error
        setIsSaved(previousSaved);
        toast.error(response.message || "Failed to toggle save");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(previousSaved);
      console.error("[RecipeCard] Error toggling save:", error);
      toast.error("An error occurred while saving recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHideUnhide = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to hide/unhide recipes");
      return;
    }

    if (isTogglingHide) return;

    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    setIsTogglingHide(true);
    const previousHidden = isHidden;

    // Optimistic update
    setIsHidden(!isHidden);

    try {
      const response = await toggleHideRecipe(recipeAlias, token);
      if (response.success && response.data) {
        setIsHidden(response.data.hidden);
        
        // Update parent component if callback provided
        if (onRecipeUpdated) {
          onRecipeUpdated({
            ...recipe,
            is_hidden_by_me: response.data.hidden,
          });
        }

        // Call parent callback to handle hide/unhide
        if (onRecipeHidden) {
          onRecipeHidden(recipe.id, response.data.hidden);
        }

        toast.success(response.data.message || (response.data.hidden ? "Recipe hidden successfully" : "Recipe unhidden successfully"));
      } else {
        // Revert optimistic update on error
        setIsHidden(previousHidden);
        toast.error(response.message || "Failed to toggle hide");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsHidden(previousHidden);
      console.error("[RecipeCard] Error toggling hide:", error);
      toast.error("An error occurred while hiding/unhiding recipe");
    } finally {
      setIsTogglingHide(false);
    }
  };

  return (
    <div 
      className="w-full bg-white rounded-3xl ring-1 ring-brand space-y-[20px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* Image or Video */}
      <div className="relative">
        {displayVideo ? (
          <div className="w-full h-[170px] rounded-t-3xl overflow-hidden">
            <VideoJsPlayer 
              src={displayVideo.url} 
              className="w-full h-full"
              maxHeight="170px"
              autoPlay={true}
            />
          </div>
        ) : displayImage ? (
          <img
            src={displayImage.url}
            alt={recipe.name}
            className="w-full h-[170px] object-cover rounded-t-3xl"
          />
        ) : (
          <div className="w-full h-[170px] bg-gray-200 rounded-t-3xl flex items-center justify-center">
            <Utensils size={32} className="text-gray-400" />
          </div>
        )}
        <button
          onClick={handleSave}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={isSaving || !token}
          className={`absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md transition z-10 ${
            isSaved
              ? "text-orange-500"
              : "text-gray-600 hover:text-orange-500"
          } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-[20px] space-y-[19px]">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <img
              src={`https://placehold.co/48x48/8b5cf6/ffffff?text=${getInitials(userName)}`}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800 truncate max-w-[100px]">
              {userName}
            </span>
          </div>
          <button 
            onClick={handleShare}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="text-green-600 hover:text-green-700 z-10"
          >
            <Share2 size={18} />
          </button>
        </div>

        <div 
          className="flex items-center justify-between text-sm text-gray-600 mt-1"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row gap-2 items-center">
            <Utensils size={16} className="text-brand" />
            <span className="font-bold truncate max-w-[120px]">{recipe.name}</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ClockFading size={16} className="text-brand" />
            <span className="text-xs">{timeAgoText}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-3 text-sm text-gray-700">
          <button
            onClick={handleLikeClick}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            disabled={isTogglingLike || !token}
            className={`flex items-center gap-1 transition-colors ${
              isLiked
                ? "text-orange-500 hover:text-orange-600"
                : "text-gray-700 hover:text-orange-500"
            } ${isTogglingLike ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
            <span>{likesCount}</span>
          </button>
          <div 
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Eye size={16} />
            <span>{recipe.view_count}</span>
          </div>
          <div 
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <SendHorizontal size={16} />
            <span>{recipe.share_count}</span>
          </div>
          {isOwnRecipe && (
            <button
              onClick={handleHideUnhide}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              disabled={!token || isTogglingHide}
              className={`flex items-center gap-1 transition-colors ${
                !token || isTogglingHide
                  ? "opacity-50 cursor-not-allowed" 
                  : isHidden
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-700 hover:text-red-500"
              } ${!token || isTogglingHide ? "" : "cursor-pointer"}`}
              title={isHidden ? "Unhide recipe" : "Hide recipe"}
            >
              {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div ref={shareModalRef} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Share Recipe</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareLinks(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                disabled={isLoadingShareLinks}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {isLoadingShareLinks ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-orange-500"
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
              </div>
            ) : shareLinks ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleSharePlatform('facebook')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium">Share on Facebook</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="font-medium">Share on WhatsApp</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="font-medium">Share on Twitter</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('linkedin')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-medium">Share on LinkedIn</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Copy Link</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load share links
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
