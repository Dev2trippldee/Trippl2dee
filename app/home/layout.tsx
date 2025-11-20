"use client";

import { useState, useEffect } from "react";
import { BMI } from "@/features/home/components/bmi";
import { MealPlan } from "@/features/home/components/mealPlan";
import { Navbar } from "@/features/home/components/navbar";
import { ProfileAnalytics } from "@/features/home/components/profileAnalytics";
import { SidebarProfile } from "@/features/home/components/sidebarProfile";
import { Diet } from "@/features/home/components/diet";
import { RecipeCard } from "@/app/home/components/recipeCard";
import { RecipeCardSkeleton } from "@/app/home/components/recipeCardSkeleton";
import { RecipeUploadModal } from "@/app/home/components/recipeUploadModal";
import { DiscountRestaurant } from "@/app/home/components/discountRestaurant";
import { getAllRecipes } from "@/lib/api/recipe";
import { Upload, X, Menu, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecipeResponse } from "@/types/recipe";
import toast from "react-hot-toast";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [userType, setUserType] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeResponse[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  useEffect(() => {
    // Get token and user type from cookies API
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          // No token available, stop loading
          setIsLoadingRecipes(false);
        }
        // Set user type
        if (data.type) {
          setUserType(data.type);
        }
      } catch (error) {
        console.error("[HomeLayout] Failed to fetch token:", error);
        // Error fetching token, stop loading
        setIsLoadingRecipes(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    // Fetch recipes when token is available
    if (token) {
      fetchRecipes();
    }
  }, [token]);

  const fetchRecipes = async () => {
    if (!token) return;

    setIsLoadingRecipes(true);
    try {
      const response = await getAllRecipes(token, 1);
      if (response.success && response.data) {
        setRecipes(response.data.data || []);
      } else {
        console.error("[HomeLayout] Failed to load recipes:", response.message);
        toast.error(response.message || "Failed to load recipes");
      }
    } catch (error) {
      console.error("[HomeLayout] Error loading recipes:", error);
      toast.error("An error occurred while loading recipes");
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  return (
    <div className="bg-brand-white w-full h-[100dvh] flex flex-col px-4 md:pl-[60px] md:pr-4 pb-16 md:pb-0 overflow-hidden">
      {/* Fixed Navbar - not scrollable */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      
      {/* Main scrollable container - includes discount and grid, can scroll to hide discount */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-orange min-h-0">
        {/* Discount Restaurant - Part of main scroll, can scroll up and hide */}
        {userType === "User" && (
          <div className="mt-[20px]">
            <DiscountRestaurant />
          </div>
        )}

        {/* Grid container with independent column scrollbars - Fixed height for independent scrolling */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[22px] mt-[20px] px-0" style={{ height: 'calc(100vh - 90px)' }}>
          {/* Left Sidebar - Hidden on mobile, shown on md+ */}
          <aside className="hidden md:block space-y-[20px] p-[1px] overflow-y-auto overflow-x-hidden scrollbar-orange" style={{ maxHeight: '100%' }}>
            <SidebarProfile />
            <ProfileAnalytics />
            <MealPlan />
            <BMI />
            <Diet />
          </aside>

          {/* Mobile Left Drawer */}
          {isLeftDrawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div 
                className="absolute inset-0 bg-black/50 transition-opacity duration-300" 
                onClick={() => setIsLeftDrawerOpen(false)} 
              />
              <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-brand-white overflow-y-auto p-4 space-y-[20px] transform transition-transform duration-300 ease-out">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-brand">Profile & Analytics</h2>
                  <button
                    onClick={() => setIsLeftDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <SidebarProfile />
                <ProfileAnalytics />
                <MealPlan />
                <BMI />
                <Diet />
              </div>
            </div>
          )}

          {/* Main Feed - Full width on mobile, col-span-2 on md+ */}
          <main className="col-span-1 md:col-span-2 p-[1px] md:p-[1px] pb-20 md:pb-[1px] overflow-y-auto overflow-x-hidden scrollbar-orange" style={{ maxHeight: '100%' }}>
            {children}
          </main>

          {/* Right Sidebar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:block w-full overflow-y-auto overflow-x-hidden scrollbar-orange" style={{ maxHeight: '100%' }}>
            <aside className="w-full border-1 border-brand bg-brand-white p-[40px] pr-[20px] rounded-3xl space-y-[20px]">
              <div className="w-full font-fira space-y-[16px]">
                <div className="text-brand flex justify-between items-center">
                  <span className="text-[18px]">Recipes</span>
                  <span className="font-inter text-[10px]">View all</span>
                </div>
                <button
                  onClick={() => router.push("/upload-recipe")}
                  className="bg-brand rounded-3xl cursor-pointer w-full h-[30px] flex justify-center items-center p-5 text-brand-white gap-2 hover:bg-orange-600 transition"
                >
                  <Upload size={16} />
                  Upload recipes
                </button>
              </div>
              {isLoadingRecipes ? (
                <div className="space-y-[20px]">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <RecipeCardSkeleton key={`skeleton-${idx}`} />
                  ))}
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recipes yet</div>
              ) : (
                recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    token={token}
                    onRecipeUpdated={(updatedRecipe) => {
                      setRecipes((prev) =>
                        prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
                      );
                    }}
                    onRecipeHidden={(recipeId, isHidden) => {
                      if (isHidden) {
                        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
                      }
                    }}
                  />
                ))
              )}
            </aside>
          </div>

          {/* Mobile Right Drawer */}
          {isRightDrawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div 
                className="absolute inset-0 bg-black/50 transition-opacity duration-300" 
                onClick={() => setIsRightDrawerOpen(false)} 
              />
              <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-brand-white overflow-y-auto p-4 space-y-[20px] transform transition-transform duration-300 ease-out">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-brand">Recipes</h2>
                  <button
                    onClick={() => setIsRightDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="w-full font-fira space-y-[16px]">
                  <button
                    onClick={() => {
                      router.push("/upload-recipe");
                      setIsRightDrawerOpen(false);
                    }}
                    className="bg-brand rounded-3xl cursor-pointer w-full h-[30px] flex justify-center items-center p-5 text-brand-white gap-2 hover:bg-orange-600 transition"
                  >
                    <Upload size={16} />
                    Upload recipes
                  </button>
                </div>
                {isLoadingRecipes ? (
                  <div className="space-y-[20px]">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <RecipeCardSkeleton key={`skeleton-${idx}`} />
                    ))}
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No recipes yet</div>
                ) : (
                  recipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      token={token}
                      onRecipeUpdated={(updatedRecipe) => {
                        setRecipes((prev) =>
                          prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
                        );
                      }}
                      onRecipeHidden={(recipeId, isHidden) => {
                        if (isHidden) {
                          setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-white border-t-2 border-orange-200 flex justify-around items-center h-16 z-40">
        <button
          onClick={() => setIsLeftDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-brand hover:bg-orange-50 rounded-lg transition-colors"
          aria-label="Open profile menu"
        >
          <Menu size={20} />
          <span className="text-xs">Profile</span>
        </button>
        <button
          onClick={() => setIsRightDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-brand hover:bg-orange-50 rounded-lg transition-colors"
          aria-label="Open recipes menu"
        >
          <BookOpen size={20} />
          <span className="text-xs">Recipes</span>
        </button>
      </div>

      {/* Recipe Upload Modal */}
      {token && (
        <RecipeUploadModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          token={token}
          onRecipeCreated={(recipe) => {
            console.log("[HomeLayout] Recipe created:", recipe);
            setRecipes((prev) => [recipe, ...prev]);
            setIsRecipeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}