"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllRecipes, deleteRecipe } from "@/lib/api/recipe";
import type { RecipeResponse } from "@/types/recipe";
import toast from "react-hot-toast";
import { ArrowLeft, MoreHorizontal, Edit, Trash2, X, UserPlus, Flag, Bookmark, Heart, Eye, Share2, Play, EyeOff } from "lucide-react";
import { Navbar } from "@/app/home/components/navbar";
import { RecipeUploadModal } from "@/app/home/components/recipeUploadModal";
import { VideoJsPlayer } from "@/components/VideoJsPlayer";
import { reportRecipe, toggleSaveRecipe, toggleRecipeLike, getRecipeShareLinks, toggleHideRecipe, type RecipeShareLinksResponse } from "@/lib/api/recipe";
import { ReviewSection } from "@/features/home/components/reviewSection";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alias = params.alias as string;
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          toast.error("Please login to view recipe");
          router.push("/home");
        }
      } catch (error) {
        console.error("Failed to fetch token:", error);
        toast.error("Failed to authenticate");
        router.push("/home");
      }
    };

    fetchToken();
  }, [router]);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!token || !alias) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all recipes and find the one with matching alias or ID
        const response = await getAllRecipes(token, 1);
        if (response.success && response.data) {
          const allRecipes = response.data.data;
          
          // Try to find by alias first, then by ID
          // API response uses "alias" field (e.g., "protein-shagee-3")
          const foundRecipe = allRecipes.find(
            (r) => r.alias === alias || r.recipe_alias === alias || r.id.toString() === alias
          );
          
          if (foundRecipe) {
            setRecipe(foundRecipe);
          } else {
            toast.error("Recipe not found");
            router.push("/home");
          }
        } else {
          toast.error("Failed to load recipe");
          router.push("/home");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("An error occurred while loading the recipe");
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchRecipe();
    }
  }, [token, alias, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-66px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-66px)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Recipe not found</p>
            <button
              onClick={() => router.push("/home")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      <div className="py-6">
        <div className="max-w-[75rem] mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Recipe Detail */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand p-6 mb-6">
            <RecipeDetailContent recipe={recipe} token={token} />
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand p-6">
            <ReviewSection 
              recipeAlias={recipe.alias || recipe.recipe_alias || ""} 
              token={token} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Recipe Detail Content Component
function RecipeDetailContent({ recipe, token }: { recipe: RecipeResponse; token: string }) {
  const router = useRouter();
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isLiked, setIsLiked] = useState(recipe.is_liked_by_me);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isHidden, setIsHidden] = useState(recipe.is_hidden_by_me || false);
  const [isTogglingHide, setIsTogglingHide] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoadingShareLinks, setIsLoadingShareLinks] = useState(false);
  const [shareLinks, setShareLinks] = useState<RecipeShareLinksResponse["share_links"] | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);
  const shareModalRef = useRef<HTMLDivElement>(null);

  // Initialize state from recipe
  useEffect(() => {
    setIsSaved(recipe.is_saved_by_me || false);
    setSavedCount(recipe.saved_count || 0);
    setIsLiked(recipe.is_liked_by_me);
    setLikesCount(recipe.likes_count);
    setIsHidden(recipe.is_hidden_by_me || false);
  }, [recipe.is_saved_by_me, recipe.saved_count, recipe.is_liked_by_me, recipe.likes_count, recipe.is_hidden_by_me]);

  // Get user referral code from cookies
  useEffect(() => {
    const fetchUserReferralCode = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        setUserReferralCode(data.referral_code || null);
      } catch (error) {
        console.error("Error fetching user referral code:", error);
      }
    };
    fetchUserReferralCode();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (reportModalRef.current && !reportModalRef.current.contains(event.target as Node)) {
        setShowReportModal(false);
      }
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
    };

    if (showMenu || showReportModal || showShareModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showReportModal, showShareModal]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const userName = recipe.user_referral_code || "User";
  const hasImages = recipe.images && recipe.images.length > 0;
  const hasVideos = recipe.videos && recipe.videos.length > 0;
  const displayImage = hasImages ? recipe.images[0] : null;
  const displayVideo = hasVideos ? recipe.videos[0] : null;
  const isMyRecipe = userReferralCode && recipe.user_referral_code && userReferralCode === recipe.user_referral_code;
  // API response uses "alias" field, fallback to "recipe_alias" for compatibility
  const recipeAlias = recipe.alias || recipe.recipe_alias;
  const canDelete = isMyRecipe && recipeAlias;

  const handleDelete = async () => {
    // API response uses "alias" field (e.g., "protein-shagee-3")
    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Cannot delete recipe: Recipe alias not found");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteRecipe(recipeAlias, token);
      if (response.success) {
        toast.success(response.data?.message || response.message || "Recipe deleted successfully");
        setShowDeleteConfirm(false);
        setShowMenu(false);
        // Redirect to home page after successful deletion
        router.push("/home");
      } else {
        toast.error(response.message || "Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("An error occurred while deleting the recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleRecipeUpdated = () => {
    // Reload the page to show updated recipe
    window.location.reload();
  };

  const handleReport = async () => {
    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Cannot report recipe: Recipe alias not found");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    if (isReporting) {
      return; // Prevent multiple simultaneous requests
    }

    setIsReporting(true);

    try {
      const response = await reportRecipe(recipeAlias, reportReason.trim(), token);
      
      if (response.success) {
        toast.success(response.message || "Recipe reported successfully");
        setReportReason("");
        setShowReportModal(false);
        setShowMenu(false);
      } else {
        toast.error(response.message || "Failed to report recipe");
      }
    } catch (error) {
      console.error("Error reporting recipe:", error);
      toast.error("An error occurred while reporting the recipe");
    } finally {
      setIsReporting(false);
    }
  };

  const handleLike = async () => {
    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    if (isTogglingLike) return;

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
      console.error("Error toggling like:", error);
      toast.error("An error occurred while toggling like");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleShare = async () => {
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
      } else {
        toast.error(response.message || "Failed to get share links");
        setShowShareModal(false);
      }
    } catch (error) {
      console.error("Error fetching share links:", error);
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
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleSave = async () => {
    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Cannot save recipe: Recipe alias not found");
      return;
    }

    if (isSaving) {
      return; // Prevent multiple simultaneous requests
    }

    setIsSaving(true);
    
    // Optimistic update
    const previousSaved = isSaved;
    const previousSavedCount = savedCount;
    setIsSaved(!isSaved);
    setSavedCount(isSaved ? savedCount - 1 : savedCount + 1);

    try {
      const response = await toggleSaveRecipe(recipeAlias, token);
      
      if (response.success && response.data) {
        // Update with actual API response
        setIsSaved(response.data.saved);
        toast.success(response.data.message || (response.data.saved ? "Recipe saved successfully" : "Recipe removed from saved list"));
      } else {
        // Revert optimistic update on error
        setIsSaved(previousSaved);
        setSavedCount(previousSavedCount);
        toast.error(response.message || "Failed to save recipe");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      // Revert optimistic update on error
      setIsSaved(previousSaved);
      setSavedCount(previousSavedCount);
      toast.error("An error occurred while saving the recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHideUnhide = async () => {
    const recipeAlias = recipe.alias || recipe.recipe_alias;
    if (!recipeAlias) {
      toast.error("Recipe alias not found");
      return;
    }

    if (isTogglingHide) return;

    setIsTogglingHide(true);
    const previousHidden = isHidden;

    // Optimistic update
    setIsHidden(!isHidden);

    try {
      const response = await toggleHideRecipe(recipeAlias, token);
      if (response.success && response.data) {
        setIsHidden(response.data.hidden);
        toast.success(response.data.message || (response.data.hidden ? "Recipe hidden successfully" : "Recipe unhidden successfully"));
      } else {
        // Revert optimistic update on error
        setIsHidden(previousHidden);
        toast.error(response.message || "Failed to toggle hide");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsHidden(previousHidden);
      console.error("Error toggling hide:", error);
      toast.error("An error occurred while hiding/unhiding recipe");
    } finally {
      setIsTogglingHide(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://placehold.co/48x48/8b5cf6/ffffff?text=${getInitials(userName)}`}
            alt={userName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{userName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition">
            <UserPlus className="w-4 h-4" />
            Follow
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {isMyRecipe && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                {!isMyRecipe && (
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 h-[100dvh] bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Recipe</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Image/Video */}
      {displayVideo ? (
        <div className="relative w-full mb-6">
          <VideoJsPlayer 
            src={displayVideo.url} 
            className="w-full rounded-lg"
            maxHeight="600px"
            autoPlay={true}
          />
        </div>
      ) : displayImage ? (
        <div className="relative w-full mb-6">
          <img
            src={displayImage.url}
            alt={recipe.name}
            className="w-full h-auto max-h-[600px] object-cover rounded-lg"
          />
        </div>
      ) : null}

      {/* Recipe Title with Stats */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-orange-500">{recipe.name}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isTogglingLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked
                ? "text-orange-500 hover:text-orange-600"
                : "text-gray-600 hover:text-orange-500"
            } ${isTogglingLike ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{likesCount}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-600">
            <Eye className="w-5 h-5" />
            <span className="font-medium">{recipe.view_count}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Play className="w-5 h-5" />
            <span className="font-medium">{savedCount}</span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {isMyRecipe && (
            <button
              onClick={handleHideUnhide}
              disabled={isTogglingHide}
              className={`flex items-center gap-1 transition-colors ${
                !isTogglingHide
                  ? isHidden
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-600 hover:text-red-500"
                  : "opacity-50 cursor-not-allowed"
              } ${!isTogglingHide ? "cursor-pointer" : ""}`}
              title={isHidden ? "Unhide recipe" : "Hide recipe"}
            >
              {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-orange-500 mb-4">Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Row 1 */}
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">No of persons</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.no_of_servings}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">Cooking time</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.cook_time}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">Preparation time</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.preparation_time}</p>
          </div>
          
          {/* Row 2 */}
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">Recipe category</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.recipe_category?.name || recipe.category.name}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">Recipe type</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.recipe_category?.name || recipe.category.name}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-900 mb-1">Cuisine</p>
            <p className="text-lg font-semibold text-orange-500">{recipe.cuisine_type?.name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (() => {
        // Group ingredients by heading
        const groupedIngredients = recipe.ingredients.reduce((acc, ingredient) => {
          const heading = ingredient.heading || recipe.name || "Ingredients";
          if (!acc[heading]) {
            acc[heading] = [];
          }
          acc[heading].push(ingredient);
          return acc;
        }, {} as Record<string, typeof recipe.ingredients>);

        const groups = Object.entries(groupedIngredients);
        const hasMultipleGroups = groups.length > 1;

        return (
          <div className={`mb-8 ${hasMultipleGroups ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}`}>
            {groups.map(([heading, ingredients], groupIndex) => (
              <div key={heading}>
                <h2 className="text-xl font-semibold text-orange-500 mb-4">{heading}</h2>
                <div className="bg-gray-100 border-2 border-orange-500 rounded-lg p-4 md:p-6">
                  {/* Table Header */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="font-semibold text-orange-500">Ingredients</div>
                    <div className="font-semibold text-orange-500">Qty</div>
                  </div>
                  
                  {/* Ingredients List - Each row has two separate boxes */}
                  <div className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-100 border border-orange-500 rounded-lg p-3">
                          <div className="text-sm text-gray-900">
                            {ingredient.name}
                          </div>
                        </div>
                        <div className="bg-gray-100 border border-orange-500 rounded-lg p-3">
                          <div className="text-sm text-gray-900">
                            {ingredient.quantity || "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* How to Make / Instructions */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-orange-500 mb-4">How to Make</h2>
          <div className="bg-gray-100 border-2 border-orange-500 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">Steps</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {step.heading && (
                      <p className="font-medium text-gray-900 mb-1">{step.heading}</p>
                    )}
                    <p className="text-gray-800 leading-relaxed">{step.step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea
          placeholder="Write your notes..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        />
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 h-[100dvh] bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div ref={reportModalRef} className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Recipe</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
                disabled={isReporting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide a reason for reporting this recipe..."
                  rows={4}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none"
                  disabled={isReporting}
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  disabled={isReporting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={isReporting || !reportReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isReporting ? (
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
                      Reporting...
                    </>
                  ) : (
                    "Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Edit Modal */}
      <RecipeUploadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        token={token}
        initialRecipe={recipe}
        onRecipeCreated={handleRecipeUpdated}
      />
    </div>
  );
}

