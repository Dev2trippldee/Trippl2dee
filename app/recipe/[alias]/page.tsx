"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllRecipes, deleteRecipe } from "@/lib/api/recipe";
import type { RecipeResponse } from "@/types/recipe";
import toast from "react-hot-toast";
import { ArrowLeft, MoreHorizontal, Edit, Trash2, X, UserPlus, Flag, Bookmark } from "lucide-react";
import { Navbar } from "@/app/home/components/navbar";
import { RecipeUploadModal } from "@/app/home/components/recipeUploadModal";
import { VideoJsPlayer } from "@/components/VideoJsPlayer";
import { reportRecipe, toggleSaveRecipe } from "@/lib/api/recipe";

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
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Recipe Detail */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand p-6">
            <RecipeDetailContent recipe={recipe} token={token} />
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
  const menuRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);

  // Initialize saved state from recipe
  useEffect(() => {
    setIsSaved(recipe.is_saved_by_me || false);
    setSavedCount(recipe.saved_count || 0);
  }, [recipe.is_saved_by_me, recipe.saved_count]);

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
    };

    if (showMenu || showReportModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showReportModal]);

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
        // Note: API might not return saved_count, so we keep optimistic update
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`https://placehold.co/48x48/8b5cf6/ffffff?text=${getInitials(userName)}`}
            alt={userName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{userName}</h3>
            <p className="text-sm text-gray-500">{recipe.name}</p>
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

      {/* Video or Image */}
      {displayVideo ? (
        <div className="relative w-full">
          <VideoJsPlayer 
            src={displayVideo.url} 
            className="w-full"
            maxHeight="500px"
            autoPlay={true}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg transition z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSaved
                ? "text-orange-500"
                : "text-gray-600 hover:text-orange-500"
            }`}
          >
            <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>
      ) : displayImage ? (
        <div className="relative w-full">
          <img
            src={displayImage.url}
            alt={recipe.name}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg transition z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSaved
                ? "text-orange-500"
                : "text-gray-600 hover:text-orange-500"
            }`}
          >
            <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>
      ) : null}

      {/* Recipe Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Servings</p>
          <p className="font-semibold">{recipe.no_of_servings}</p>
        </div>
        <div>
          <p className="text-gray-500">Prep Time</p>
          <p className="font-semibold">{recipe.preparation_time}</p>
        </div>
        <div>
          <p className="text-gray-500">Cook Time</p>
          <p className="font-semibold">{recipe.cook_time}</p>
        </div>
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-semibold">{recipe.category.name}</p>
        </div>
      </div>

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Ingredients</h4>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <div>
                  {ingredient.heading && (
                    <p className="font-medium text-gray-900">{ingredient.heading}</p>
                  )}
                  <p className="text-gray-700">
                    {ingredient.name} - {ingredient.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Instructions</h4>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  {step.heading && (
                    <p className="font-medium text-gray-900 mb-1">{step.heading}</p>
                  )}
                  <p className="text-gray-700">{step.step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Notes */}
      {recipe.special_notes && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Special Notes</h4>
          <p className="text-gray-700">{recipe.special_notes}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">❤️</span>
          <span>{recipe.likes_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👁</span>
          <span>{recipe.view_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📤</span>
          <span>{recipe.share_count}</span>
        </div>
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

