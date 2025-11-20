"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, MapPin, Image as ImageIcon, Video, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateRecipe, getCuisines, getFoodCategories, getFoodTypes, type Cuisine, type FoodCategory, type FoodType } from "@/lib/api/recipe";
import { getPrivacyOptions } from "@/lib/api/post";
import type { PrivacyOption } from "@/types/post";
import type { Ingredient, Step, CreateRecipeData, RecipeResponse } from "@/types/recipe";
import type { ApiResponse } from "@/types/auth";

interface RecipeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onRecipeCreated?: (recipe: RecipeResponse) => void;
  initialRecipe?: RecipeResponse | null;
}

type StepType = "select" | "review" | "post";

export function RecipeUploadModal({ isOpen, onClose, token, onRecipeCreated, initialRecipe }: RecipeUploadModalProps) {
  const [currentStep, setCurrentStep] = useState<StepType>("select");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([]);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>("");
  const [selectedFoodType, setSelectedFoodType] = useState<string>("");
  const [isLoadingFoodTypes, setIsLoadingFoodTypes] = useState<boolean>(false);
  
  // Recipe form fields
  const [name, setName] = useState<string>("");
  const [categoryAlias, setCategoryAlias] = useState<string>("");
  const [recipeCategoryAlias, setRecipeCategoryAlias] = useState<string>("");
  const [foodTypeAlias, setFoodTypeAlias] = useState<string>("");
  const [cuisineTypeAlias, setCuisineTypeAlias] = useState<string>("");
  const [noOfServings, setNoOfServings] = useState<string>("");
  const [preparationTime, setPreparationTime] = useState<string>("");
  const [cookTime, setCookTime] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ heading: "", name: "", quantity: "" }]);
  const [steps, setSteps] = useState<Step[]>([{ heading: "", step: "" }]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch privacy options, cuisines, and food categories when modal opens
  useEffect(() => {
    if (isOpen) {
      if (privacyOptions.length === 0) {
        fetchPrivacyOptions();
      }
      if (cuisines.length === 0) {
        fetchCuisines();
      }
      if (foodCategories.length === 0) {
        fetchFoodCategories();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load initial recipe data when modal opens with initialRecipe
  useEffect(() => {
    if (isOpen && initialRecipe && foodCategories.length > 0 && cuisines.length > 0) {
      // API response uses "alias" field, fallback to "recipe_alias" for compatibility
      const recipeAlias = initialRecipe.alias || initialRecipe.recipe_alias;
      console.log("[RecipeUploadModal] Loading recipe for editing. Recipe alias:", recipeAlias);
      // Load basic fields
      setName(initialRecipe.name || "");
      setNoOfServings(initialRecipe.no_of_servings?.toString() || "");
      setPreparationTime(initialRecipe.preparation_time || "");
      setCookTime(initialRecipe.cook_time || "");
      setSpecialNotes(initialRecipe.special_notes || "");
      setSelectedPrivacy(initialRecipe.privacy_alias || "");

      // Load ingredients
      if (initialRecipe.ingredients && initialRecipe.ingredients.length > 0) {
        setIngredients(initialRecipe.ingredients.map(ing => ({
          heading: ing.heading || "",
          name: ing.name || "",
          quantity: ing.quantity || ""
        })));
      }

      // Load steps
      if (initialRecipe.steps && initialRecipe.steps.length > 0) {
        setSteps(initialRecipe.steps.map(step => ({
          heading: step.heading || "",
          step: step.step || ""
        })));
      }

      // Load existing images as previews
      if (initialRecipe.images && initialRecipe.images.length > 0) {
        const imageUrls = initialRecipe.images.map(img => img.url);
        setImagePreviews(imageUrls);
      }

      // Load existing videos as previews
      if (initialRecipe.videos && initialRecipe.videos.length > 0) {
        const videoUrls = initialRecipe.videos.map(vid => vid.url);
        setVideoPreviews(videoUrls);
      }

      // Load category - find matching category by name to get alias
      if (initialRecipe.category) {
        const category = foodCategories.find(cat => cat.category === initialRecipe.category?.name);
        if (category) {
          setCategoryAlias(category.alias);
          setSelectedFoodCategory(initialRecipe.category.name);
          // Fetch food types for this category
          getFoodTypes(token, category.alias).then(response => {
            if (response.success && response.data) {
              setFoodTypes(response.data);
              // Set food type if it exists
              if (initialRecipe.food_type) {
                const foodType = response.data.find(ft => ft.name === initialRecipe.food_type?.name);
                if (foodType) {
                  setFoodTypeAlias(foodType.alias);
                  setSelectedFoodType(initialRecipe.food_type.name);
                }
              }
            }
          });
        }
      }

      // Load recipe category - need to find alias (assuming it's the same as category for now)
      if (initialRecipe.recipe_category) {
        setRecipeCategoryAlias(initialRecipe.recipe_category.name || "");
      }

      // Load cuisine - find matching cuisine by name to get alias
      if (initialRecipe.cuisine_type) {
        const cuisine = cuisines.find(c => c.cuisine === initialRecipe.cuisine_type?.name);
        if (cuisine) {
          setCuisineTypeAlias(cuisine.alias);
          setSelectedCuisine(initialRecipe.cuisine_type.name);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialRecipe, foodCategories, cuisines]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("select");
      setSelectedImages([]);
      setSelectedVideos([]);
      setImagePreviews([]);
      setVideoPreviews([]);
      setName("");
      setCategoryAlias("");
      setRecipeCategoryAlias("");
      setFoodTypeAlias("");
      setCuisineTypeAlias("");
      setNoOfServings("");
      setPreparationTime("");
      setCookTime("");
      setSpecialNotes("");
      setIngredients([{ heading: "", name: "", quantity: "" }]);
      setSteps([{ heading: "", step: "" }]);
      setLocation("");
      setShowLocationInput(false);
      setSelectedPrivacy("");
      setUploadProgress(0);
      setIsUploading(false);
      setIsFetchingLocation(false);
      setSelectedCuisine("");
      setSelectedFoodCategory("");
      setSelectedFoodType("");
      setFoodTypes([]);
    }
  }, [isOpen]);

  // Automatically fetch location when entering review step
  useEffect(() => {
    if (currentStep === "review" && !showLocationInput) {
      setShowLocationInput(true);
      if (!location) {
        handleGetLocation(false);
      }
    }
  }, [currentStep]);

  const fetchPrivacyOptions = async () => {
    try {
      const response = await getPrivacyOptions(token);
      if (response.success && response.data) {
        setPrivacyOptions(response.data);
        const publicOption = response.data.find((opt) => opt.alias === "public");
        if (publicOption) {
          setSelectedPrivacy(publicOption.alias);
        }
      } else {
        toast.error(response.message || "Failed to load privacy options");
      }
    } catch (error) {
      console.error("[RecipeUploadModal] Error fetching privacy options:", error);
      toast.error("Failed to load privacy options");
    }
  };

  const fetchCuisines = async () => {
    try {
      const response = await getCuisines(token);
      if (response.success && response.data) {
        setCuisines(response.data);
      } else {
        toast.error(response.message || "Failed to load cuisines");
      }
    } catch (error) {
      console.error("[RecipeUploadModal] Error fetching cuisines:", error);
      toast.error("Failed to load cuisines");
    }
  };

  const fetchFoodCategories = async () => {
    try {
      const response = await getFoodCategories(token);
      if (response.success && response.data) {
        setFoodCategories(response.data);
      } else {
        toast.error(response.message || "Failed to load food categories");
      }
    } catch (error) {
      console.error("[RecipeUploadModal] Error fetching food categories:", error);
      toast.error("Failed to load food categories");
    }
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCuisineName = e.target.value;
    setSelectedCuisine(selectedCuisineName);
    
    // Find the selected cuisine and set its alias
    const cuisine = cuisines.find((c) => c.cuisine === selectedCuisineName);
    if (cuisine) {
      setCuisineTypeAlias(cuisine.alias);
    } else {
      setCuisineTypeAlias("");
    }
  };

  const handleFoodCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryName = e.target.value;
    setSelectedFoodCategory(selectedCategoryName);
    
    // Find the selected category and set its alias
    const category = foodCategories.find((c) => c.category === selectedCategoryName);
    if (category) {
      setCategoryAlias(category.alias);
      
      // Fetch food types based on selected food category alias
      setIsLoadingFoodTypes(true);
      setFoodTypes([]);
      setSelectedFoodType("");
      setFoodTypeAlias("");
      
      try {
        const response = await getFoodTypes(token, category.alias);
        if (response.success && response.data) {
          setFoodTypes(response.data);
          console.log("[RecipeUploadModal] Food types loaded:", response.data);
        } else {
          toast.error(response.message || "Failed to load food types");
        }
      } catch (error) {
        console.error("[RecipeUploadModal] Error fetching food types:", error);
        toast.error("Failed to load food types");
      } finally {
        setIsLoadingFoodTypes(false);
      }
    } else {
      setCategoryAlias("");
      setFoodTypes([]);
      setSelectedFoodType("");
      setFoodTypeAlias("");
    }
  };

  const handleFoodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFoodTypeName = e.target.value;
    setSelectedFoodType(selectedFoodTypeName);
    
    // Find the selected food type and set its alias
    const foodType = foodTypes.find((ft) => ft.name === selectedFoodTypeName);
    if (foodType) {
      setFoodTypeAlias(foodType.alias);
      console.log("[RecipeUploadModal] Selected food type:", foodType.name, "alias:", foodType.alias);
    } else {
      setFoodTypeAlias("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        setSelectedImages((prev) => [...prev, file]);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        setSelectedVideos((prev) => [...prev, file]);
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select valid image or video files");
      }
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = (isManual: boolean = true) => {
    setIsFetchingLocation(true);
    
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const locationName = data.display_name || `${latitude}, ${longitude}`;
            setLocation(locationName);
            setShowLocationInput(true);
            setIsFetchingLocation(false);
            if (isManual) {
              toast.success("Location fetched successfully");
            }
          } catch (error) {
            const locationName = `${latitude}, ${longitude}`;
            setLocation(locationName);
            setShowLocationInput(true);
            setIsFetchingLocation(false);
            if (isManual) {
              toast.success("Location fetched (coordinates only)");
            }
          }
        },
        (error) => {
          console.error("[RecipeUploadModal] Geolocation error:", error);
          setIsFetchingLocation(false);
          setShowLocationInput(true);
          if (isManual) {
            toast.error("Failed to get location. You can enter it manually.");
          }
        },
        options
      );
    } else {
      setIsFetchingLocation(false);
      setShowLocationInput(true);
      if (isManual) {
        toast.error("Geolocation is not supported by your browser");
      }
    }
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { heading: "", name: "", quantity: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { heading: "", step: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const handleNext = () => {
    if (currentStep === "select") {
      if (!name.trim()) {
        toast.error("Please enter a recipe name");
        return;
      }
      setCurrentStep("review");
    } else if (currentStep === "review") {
      if (!selectedPrivacy) {
        toast.error("Please select a privacy option");
        return;
      }
      if (!location || !location.trim()) {
        toast.error("Please add a location");
        return;
      }
      setCurrentStep("post");
    }
  };

  const generateRecipeAlias = (recipeName: string): string => {
    if (recipeName && recipeName.trim()) {
      const slug = recipeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `${slug}-${randomStr}`;
    }
    return `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const handleSubmit = async () => {
    if (!selectedPrivacy) {
      toast.error("Please select a privacy option");
      return;
    }
    if (!location || !location.trim()) {
      toast.error("Please add a location");
      return;
    }

    // Filter out empty ingredients and steps
    const validIngredients = ingredients.filter(
      (ing) => ing.heading.trim() || ing.name.trim() || ing.quantity.trim()
    );
    const validSteps = steps.filter(
      (step) => step.heading.trim() || step.step.trim()
    );

    if (validIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    if (validSteps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    // Determine if this is an UPDATE or CREATE operation
    // UPDATE: recipe_alias is included ONLY when editing (initialRecipe provided)
    // CREATE: recipe_alias is NOT included when creating new recipe
    // Note: API response uses "alias" field, but API request expects "recipe_alias"
    const isUpdate = !!initialRecipe;
    // Get alias from recipe (API uses "alias" field, fallback to "recipe_alias" for compatibility)
    const recipeAlias = initialRecipe?.alias || initialRecipe?.recipe_alias;
    
    if (isUpdate && !recipeAlias) {
      console.error("[RecipeUploadModal] WARNING: Editing recipe but alias is missing!");
      console.error("[RecipeUploadModal] Recipe data:", initialRecipe);
      toast.error("Cannot update recipe: Recipe alias not found");
      return;
    }

    const recipeData: CreateRecipeData = {
      name: name.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      videos: selectedVideos.length > 0 ? selectedVideos : undefined,
      category_alias: categoryAlias.trim() || undefined,
      recipe_category_alias: recipeCategoryAlias.trim() || undefined,
      food_type_alias: foodTypeAlias.trim() || undefined,
      cuisine_type_alias: cuisineTypeAlias.trim() || undefined,
      no_of_servings: noOfServings.trim() || undefined,
      preparation_time: preparationTime.trim() || undefined,
      cook_time: cookTime.trim() || undefined,
      special_notes: specialNotes.trim() || undefined,
      ingredients: validIngredients,
      steps: validSteps,
      privacy_alias: selectedPrivacy,
      // CRITICAL: Include recipe_alias ONLY for UPDATE, NOT for CREATE
      recipe_alias: isUpdate ? recipeAlias : undefined,
    };

    // Log whether this is an update or create
    if (isUpdate && recipeAlias) {
      console.log("[RecipeUploadModal] ===== UPDATING EXISTING RECIPE =====");
      console.log("[RecipeUploadModal] Recipe alias:", recipeAlias);
      console.log("[RecipeUploadModal] recipe_alias WILL BE INCLUDED in request");
      console.log("[RecipeUploadModal] This will perform UPDATE operation, NOT CREATE");
    } else {
      console.log("[RecipeUploadModal] ===== CREATING NEW RECIPE =====");
      console.log("[RecipeUploadModal] No initialRecipe provided");
      console.log("[RecipeUploadModal] recipe_alias WILL NOT BE INCLUDED in request");
      console.log("[RecipeUploadModal] This will CREATE a new recipe");
    }

    console.log("========================================");
    console.log("[RecipeUploadModal] ===== PROCESSING RECIPE DATA =====");
    console.log("========================================");
    console.log("[RecipeUploadModal] Processed recipe data:", {
      name: recipeData.name,
      recipe_alias: recipeData.recipe_alias,
      category_alias: recipeData.category_alias,
      recipe_category_alias: recipeData.recipe_category_alias,
      food_type_alias: recipeData.food_type_alias,
      cuisine_type_alias: recipeData.cuisine_type_alias,
      no_of_servings: recipeData.no_of_servings,
      preparation_time: recipeData.preparation_time,
      cook_time: recipeData.cook_time,
      special_notes: recipeData.special_notes,
      privacy_alias: recipeData.privacy_alias,
      ingredientsCount: recipeData.ingredients?.length || 0,
      stepsCount: recipeData.steps?.length || 0,
      imagesCount: recipeData.images?.length || 0,
      videosCount: recipeData.videos?.length || 0,
    });
    console.log("[RecipeUploadModal] Ingredients:", recipeData.ingredients);
    console.log("[RecipeUploadModal] Steps:", recipeData.steps);
    if (recipeData.images && recipeData.images.length > 0) {
      console.log("[RecipeUploadModal] Images:", recipeData.images.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      })));
    }
    if (recipeData.videos && recipeData.videos.length > 0) {
      console.log("[RecipeUploadModal] Videos:", recipeData.videos.map(vid => ({
        name: vid.name,
        size: vid.size,
        type: vid.type
      })));
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log("[RecipeUploadModal] Calling createOrUpdateRecipe API...");
      const response = await createOrUpdateRecipe(recipeData, token);

      console.log("========================================");
      console.log("[RecipeUploadModal] ===== RECIPE API RESPONSE =====");
      console.log("========================================");
      console.log("[RecipeUploadModal] Response received:", {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
      });
      console.log("[RecipeUploadModal] Full response:", JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        console.log("[RecipeUploadModal] Recipe creation successful!");
        console.log("[RecipeUploadModal] Recipe data:", response.data);
        setIsUploading(false);
        setUploadProgress(100);
        toast.success(response.message || (initialRecipe ? "Recipe updated successfully!" : "Recipe created successfully!"));
        
        if (onRecipeCreated) {
          onRecipeCreated(response.data);
        }
        
        onClose();
      } else {
        console.warn("[RecipeUploadModal] Recipe creation failed:", response.message);
        setIsUploading(false);
        toast.error(response.message || "Failed to create recipe");
      }
    } catch (error) {
      console.error("[RecipeUploadModal] Error creating recipe:", error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("An error occurred while creating the recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 h-[100dvh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {currentStep !== "select" && (
              <button
                onClick={() => {
                  if (currentStep === "review") {
                    setCurrentStep("select");
                  } else if (currentStep === "post") {
                    setCurrentStep("review");
                  }
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
            )}
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Upload Recipe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === "select" && (
            <div className="p-3 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Recipe Name */}
                <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:border-orange-300 transition">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <FileText className="text-orange-500" size={18} />
                    <label className="block text-gray-800 text-sm sm:text-base font-semibold">
                      Recipe Name <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Paneer Butter Masala"
                    className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                {/* Images/Videos Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
                  <div className="flex justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <ImageIcon className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8 sm:w-12 sm:h-12" />
                    <Video className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                  <p className="text-gray-700 mb-2 sm:mb-3 font-semibold text-base sm:text-lg">
                    Upload Photos or Videos
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-orange-500 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition shadow-sm hover:shadow-md"
                  >
                    Select from computer
                  </button>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                    Supports multiple images and videos
                  </p>
                </div>

                {/* Selected Files Preview */}
                {(imagePreviews.length > 0 || videoPreviews.length > 0) && (
                  <div className="space-y-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {selectedImages[idx] ? selectedImages[idx].name : `Existing Image ${idx + 1}`}
                          </p>
                          {selectedImages[idx] && (
                            <p className="text-xs text-gray-500">{(selectedImages[idx].size / (1024 * 1024)).toFixed(2)} MB</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeImage(idx)}
                          className="p-2 hover:bg-red-100 rounded-full transition"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                    {videoPreviews.map((preview, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Video className="w-16 h-16 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {selectedVideos[idx] ? selectedVideos[idx].name : `Existing Video ${idx + 1}`}
                          </p>
                          {selectedVideos[idx] && (
                            <p className="text-xs text-gray-500">{(selectedVideos[idx].size / (1024 * 1024)).toFixed(2)} MB</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeVideo(idx)}
                          className="p-2 hover:bg-red-100 rounded-full transition"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Basic Info Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Food Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedFoodCategory}
                      onChange={handleFoodCategoryChange}
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
                    >
                      <option value="">Select food category</option>
                      {foodCategories.map((category) => (
                        <option key={category.alias} value={category.category}>
                          {category.category}
                        </option>
                      ))}
                    </select>
                    {categoryAlias && (
                      <p className="mt-1 text-xs text-gray-500">Alias: {categoryAlias}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Recipe Category Alias
                    </label>
                    <input
                      type="text"
                      value={recipeCategoryAlias}
                      onChange={(e) => setRecipeCategoryAlias(e.target.value)}
                      placeholder="e.g., proteins"
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Food Type
                    </label>
                    <select
                      value={selectedFoodType}
                      onChange={handleFoodTypeChange}
                      disabled={!selectedFoodCategory || isLoadingFoodTypes}
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingFoodTypes 
                          ? "Loading food types..." 
                          : !selectedFoodCategory 
                            ? "Select food category first" 
                            : "Select food type"}
                      </option>
                      {foodTypes.map((foodType) => (
                        <option key={foodType.id} value={foodType.name}>
                          {foodType.name}
                        </option>
                      ))}
                    </select>
                    {foodTypeAlias && (
                      <p className="mt-1 text-xs text-gray-500">Alias: {foodTypeAlias}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Cuisine <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCuisine}
                      onChange={handleCuisineChange}
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
                    >
                      <option value="">Select cuisine</option>
                      {cuisines.map((cuisine) => (
                        <option key={cuisine.alias} value={cuisine.cuisine}>
                          {cuisine.cuisine}
                        </option>
                      ))}
                    </select>
                    {cuisineTypeAlias && (
                      <p className="mt-1 text-xs text-gray-500">Alias: {cuisineTypeAlias}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      No. of Servings
                    </label>
                    <input
                      type="text"
                      value={noOfServings}
                      onChange={(e) => setNoOfServings(e.target.value)}
                      placeholder="e.g., 4"
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="text"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value)}
                      placeholder="e.g., 15"
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Cook Time (minutes)
                    </label>
                    <input
                      type="text"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="e.g., 25"
                      className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Special Notes */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g., Rich creamy gravy"
                    rows={3}
                    className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="flex flex-col">
              {/* Preview Section */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="p-3 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">{name || "Recipe Name"}</h3>
                  
                  {/* Media Preview */}
                  {(imagePreviews.length > 0 || videoPreviews.length > 0) && (
                    <div className="mb-4 space-y-2">
                      {imagePreviews.map((preview, idx) => (
                        <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-auto max-h-64 object-contain rounded-lg" />
                      ))}
                      {videoPreviews.map((preview, idx) => (
                        <video key={idx} src={preview} controls className="w-full h-auto max-h-64 rounded-lg" />
                      ))}
                    </div>
                  )}

                  {/* Recipe Info */}
                  <div className="space-y-2 text-sm">
                    {categoryAlias && <p><span className="font-semibold">Category:</span> {categoryAlias}</p>}
                    {recipeCategoryAlias && <p><span className="font-semibold">Recipe Category:</span> {recipeCategoryAlias}</p>}
                    {selectedFoodType && (
                      <p>
                        <span className="font-semibold">Food Type:</span> {selectedFoodType}
                        {foodTypeAlias && <span className="text-gray-500 ml-1">({foodTypeAlias})</span>}
                      </p>
                    )}
                    {cuisineTypeAlias && <p><span className="font-semibold">Cuisine:</span> {cuisineTypeAlias}</p>}
                    {noOfServings && <p><span className="font-semibold">Servings:</span> {noOfServings}</p>}
                    {preparationTime && <p><span className="font-semibold">Prep Time:</span> {preparationTime} min</p>}
                    {cookTime && <p><span className="font-semibold">Cook Time:</span> {cookTime} min</p>}
                    {specialNotes && <p><span className="font-semibold">Notes:</span> {specialNotes}</p>}
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="p-3 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">Ingredients</h4>
                  <button
                    onClick={addIngredient}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="p-3 border-2 border-gray-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Ingredient {index + 1}</span>
                        {ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredient(index)}
                            className="p-1 hover:bg-red-100 rounded transition"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={ingredient.heading}
                        onChange={(e) => updateIngredient(index, "heading", e.target.value)}
                        placeholder="Heading (e.g., Main)"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        placeholder="Name (e.g., Paneer)"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        placeholder="Quantity (e.g., 200g)"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps Section */}
              <div className="p-3 sm:p-6 space-y-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">Steps</h4>
                  <button
                    onClick={addStep}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="p-3 border-2 border-gray-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                        {steps.length > 1 && (
                          <button
                            onClick={() => removeStep(index)}
                            className="p-1 hover:bg-red-100 rounded transition"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={step.heading}
                        onChange={(e) => updateStep(index, "heading", e.target.value)}
                        placeholder="Heading (e.g., Preparation)"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                      <textarea
                        value={step.step}
                        onChange={(e) => updateStep(index, "step", e.target.value)}
                        placeholder="Step description (e.g., Cut paneer into cubes)"
                        rows={2}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="p-3 sm:p-6 space-y-2 border-t border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {!showLocationInput && (
                    <button
                      onClick={() => handleGetLocation(true)}
                      disabled={isFetchingLocation}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-orange-400 hover:bg-orange-50 transition w-full text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin size={16} className="text-orange-500" />
                      <span className="font-medium">
                        {isFetchingLocation ? "Fetching location..." : "Get Current Location"}
                      </span>
                    </button>
                  )}
                  {showLocationInput && (
                    <>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location"
                        required
                        className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleGetLocation(true)}
                        disabled={isFetchingLocation}
                        className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MapPin size={12} />
                        {isFetchingLocation ? "Fetching..." : "Update Location"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Privacy Selection */}
              <div className="p-3 sm:p-6 space-y-2 border-t border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Privacy
                </label>
                <select
                  value={selectedPrivacy}
                  onChange={(e) => setSelectedPrivacy(e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
                >
                  <option value="">Select privacy</option>
                  {privacyOptions.map((option) => (
                    <option key={option.alias} value={option.alias}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === "post" && (
            <div className="p-4 sm:p-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-semibold">Ready to upload recipe?</h3>
                
                <div className="space-y-3 sm:space-y-4 max-w-md mx-auto text-left">
                  <div className="border rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700">
                      <span className="font-medium">Recipe:</span> {name}
                    </p>
                    {location && (
                      <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 mt-2">
                        <MapPin size={14} />
                        <span className="truncate">{location}</span>
                      </p>
                    )}
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                      <span className="font-medium">Privacy:</span>{" "}
                      {privacyOptions.find((opt) => opt.alias === selectedPrivacy)?.name}
                    </p>
                  </div>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Uploading recipe...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          {currentStep === "post" ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-orange-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
              ) : (
                "Upload Recipe"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-orange-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition shadow-sm hover:shadow-md"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

