"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Image as ImageIcon, Video, Upload as UploadIcon, Plus, Minus, Trash2, Loader2, ArrowUp } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateRecipe, getCuisines, getFoodCategories, getFoodTypes, type Cuisine, type FoodCategory, type FoodType } from "@/lib/api/recipe";
import { getPrivacyOptions } from "@/lib/api/post";
import type { PrivacyOption } from "@/types/post";
import type { Ingredient, Step, CreateRecipeData, RecipeResponse } from "@/types/recipe";
import { Navbar } from "@/features/home/components/navbar";

interface RecipeUploadFormProps {
  token: string;
}

interface IngredientSection {
  id: string;
  heading: string;
  ingredients: Ingredient[];
}

interface StepSection {
  id: string;
  heading: string;
  steps: Step[];
}

export function RecipeUploadForm({ token }: RecipeUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic form fields
  const [name, setName] = useState<string>("");
  const [categoryAlias, setCategoryAlias] = useState<string>("");
  const [recipeCategoryAlias, setRecipeCategoryAlias] = useState<string>("");
  const [foodTypeAlias, setFoodTypeAlias] = useState<string>("");
  const [cuisineTypeAlias, setCuisineTypeAlias] = useState<string>("");
  const [noOfServings, setNoOfServings] = useState<number>(1);
  const [preparationTime, setPreparationTime] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 15 });
  const [cookTime, setCookTime] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 15 });
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // Media
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  // Dropdowns
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>("");
  const [selectedFoodType, setSelectedFoodType] = useState<string>("");
  const [isLoadingFoodTypes, setIsLoadingFoodTypes] = useState<boolean>(false);

  // Privacy and location
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([]);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Ingredients and steps with sections
  const [ingredientSections, setIngredientSections] = useState<IngredientSection[]>([
    { id: "1", heading: "", ingredients: [{ heading: "", name: "", quantity: "" }] }
  ]);
  const [stepSections, setStepSections] = useState<StepSection[]>([
    { id: "1", heading: "", steps: [{ heading: "", step: "" }] }
  ]);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch initial data
  useEffect(() => {
    fetchPrivacyOptions();
    fetchCuisines();
    fetchFoodCategories();
    handleGetLocation(false);
  }, []);

  const fetchPrivacyOptions = async () => {
    try {
      const response = await getPrivacyOptions(token);
      if (response.success && response.data) {
        setPrivacyOptions(response.data);
        const publicOption = response.data.find((opt) => opt.alias === "public");
        if (publicOption) {
          setSelectedPrivacy(publicOption.alias);
        }
      }
    } catch (error) {
      console.error("[RecipeUploadForm] Error fetching privacy options:", error);
    }
  };

  const fetchCuisines = async () => {
    try {
      const response = await getCuisines(token);
      if (response.success && response.data) {
        setCuisines(response.data);
      }
    } catch (error) {
      console.error("[RecipeUploadForm] Error fetching cuisines:", error);
    }
  };

  const fetchFoodCategories = async () => {
    try {
      const response = await getFoodCategories(token);
      if (response.success && response.data) {
        setFoodCategories(response.data);
      }
    } catch (error) {
      console.error("[RecipeUploadForm] Error fetching food categories:", error);
    }
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCuisineName = e.target.value;
    setSelectedCuisine(selectedCuisineName);
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
    const category = foodCategories.find((c) => c.category === selectedCategoryName);
    if (category) {
      setCategoryAlias(category.alias);
      setIsLoadingFoodTypes(true);
      setFoodTypes([]);
      setSelectedFoodType("");
      setFoodTypeAlias("");
      try {
        const response = await getFoodTypes(token, category.alias);
        if (response.success && response.data) {
          setFoodTypes(response.data);
        }
      } catch (error) {
        console.error("[RecipeUploadForm] Error fetching food types:", error);
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
    const foodType = foodTypes.find((ft) => ft.name === selectedFoodTypeName);
    if (foodType) {
      setFoodTypeAlias(foodType.alias);
    } else {
      setFoodTypeAlias("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 20MB`);
        return;
      }

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
          console.error("[RecipeUploadForm] Geolocation error:", error);
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

  // Time manipulation functions
  const formatTime = (hours: number, minutes: number): string => {
    return `${hours} hr ${minutes.toString().padStart(2, "0")} min`;
  };

  const adjustTime = (time: { hours: number; minutes: number }, delta: number, isHours: boolean) => {
    if (isHours) {
      const newHours = Math.max(0, time.hours + delta);
      return { hours: newHours, minutes: time.minutes };
    } else {
      let newMinutes = time.minutes + delta;
      let newHours = time.hours;
      if (newMinutes < 0) {
        if (newHours > 0) {
          newHours -= 1;
          newMinutes = 59;
        } else {
          newMinutes = 0;
        }
      } else if (newMinutes > 59) {
        newHours += 1;
        newMinutes = 0;
      }
      return { hours: newHours, minutes: newMinutes };
    }
  };

  // Ingredients section management
  const addIngredientSection = () => {
    const newSection: IngredientSection = {
      id: Date.now().toString(),
      heading: "",
      ingredients: [{ heading: "", name: "", quantity: "" }]
    };
    setIngredientSections((prev) => [...prev, newSection]);
  };

  const removeIngredientSection = (sectionId: string) => {
    if (ingredientSections.length > 1) {
      setIngredientSections((prev) => prev.filter((s) => s.id !== sectionId));
    }
  };

  const updateIngredientSectionHeading = (sectionId: string, heading: string) => {
    setIngredientSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, heading } : s))
    );
  };

  const addIngredient = (sectionId: string) => {
    setIngredientSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, ingredients: [...s.ingredients, { heading: "", name: "", quantity: "" }] }
          : s
      )
    );
  };

  const removeIngredient = (sectionId: string, index: number) => {
    setIngredientSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              ingredients: s.ingredients.filter((_, i) => i !== index)
            }
          : s
      )
    );
  };

  const updateIngredient = (sectionId: string, index: number, field: keyof Ingredient, value: string) => {
    setIngredientSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              ingredients: s.ingredients.map((ing, i) =>
                i === index ? { ...ing, [field]: value } : ing
              )
            }
          : s
      )
    );
  };

  // Steps section management
  const addStepSection = () => {
    const newSection: StepSection = {
      id: Date.now().toString(),
      heading: "",
      steps: [{ heading: "", step: "" }]
    };
    setStepSections((prev) => [...prev, newSection]);
  };

  const removeStepSection = (sectionId: string) => {
    if (stepSections.length > 1) {
      setStepSections((prev) => prev.filter((s) => s.id !== sectionId));
    }
  };

  const updateStepSectionHeading = (sectionId: string, heading: string) => {
    setStepSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, heading } : s))
    );
  };

  const addStep = (sectionId: string) => {
    setStepSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, steps: [...s.steps, { heading: "", step: "" }] }
          : s
      )
    );
  };

  const removeStep = (sectionId: string, index: number) => {
    setStepSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              steps: s.steps.filter((_, i) => i !== index)
            }
          : s
      )
    );
  };

  const updateStep = (sectionId: string, index: number, field: keyof Step, value: string) => {
    setStepSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              steps: s.steps.map((step, i) =>
                i === index ? { ...step, [field]: value } : step
              )
            }
          : s
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Recipe Title
    if (!name.trim()) {
      newErrors.name = "Recipe title is required";
    }

    // Food Category
    if (!selectedFoodCategory || !categoryAlias) {
      newErrors.foodCategory = "Food category is required";
    }

    // Recipe Category Alias
    if (!recipeCategoryAlias.trim()) {
      newErrors.recipeCategoryAlias = "Recipe category alias is required";
    }

    // Food Type
    if (!selectedFoodType || !foodTypeAlias) {
      newErrors.foodType = "Food type is required";
    }

    // Cuisine
    if (!selectedCuisine || !cuisineTypeAlias) {
      newErrors.cuisine = "Cuisine is required";
    }

    // Images or Videos (at least one required)
    if (selectedImages.length === 0 && selectedVideos.length === 0) {
      newErrors.media = "Please upload at least one image or video";
    }

    // No. of Servings
    if (!noOfServings || noOfServings < 1) {
      newErrors.noOfServings = "Number of servings must be at least 1";
    }

    // Preparation Time
    const preparationTimeMinutes = (preparationTime.hours * 60) + preparationTime.minutes;
    if (preparationTimeMinutes <= 0) {
      newErrors.preparationTime = "Preparation time must be greater than 0";
    }

    // Cook Time
    const cookTimeMinutes = (cookTime.hours * 60) + cookTime.minutes;
    if (cookTimeMinutes <= 0) {
      newErrors.cookTime = "Cook time must be greater than 0";
    }

    // Ingredients validation
    const allIngredients: Ingredient[] = [];
    ingredientSections.forEach((section, sectionIdx) => {
      section.ingredients.forEach((ing, ingIdx) => {
        if (ing.name.trim() || ing.quantity.trim()) {
          if (!ing.name.trim()) {
            newErrors[`ingredient_name_${sectionIdx}_${ingIdx}`] = "Ingredient name is required";
          }
          if (!ing.quantity.trim()) {
            newErrors[`ingredient_quantity_${sectionIdx}_${ingIdx}`] = "Ingredient quantity is required";
          }
          if (ing.name.trim() && ing.quantity.trim()) {
            allIngredients.push({
              heading: section.heading.trim() || ing.heading.trim(),
              name: ing.name.trim(),
              quantity: ing.quantity.trim()
            });
          }
        }
      });
    });

    if (allIngredients.length === 0) {
      newErrors.ingredients = "Please add at least one complete ingredient (name and quantity)";
    }

    // Steps validation
    const allSteps: Step[] = [];
    stepSections.forEach((section, sectionIdx) => {
      section.steps.forEach((step, stepIdx) => {
        if (step.step.trim()) {
          allSteps.push({
            heading: section.heading.trim() || step.heading.trim(),
            step: step.step.trim()
          });
        }
      });
    });

    if (allSteps.length === 0) {
      newErrors.steps = "Please add at least one step";
    }

    // Special Notes
    if (!specialNotes.trim()) {
      newErrors.specialNotes = "Special notes are required";
    }

    // Location
    if (!location || !location.trim()) {
      newErrors.location = "Location is required";
    }

    // Privacy
    if (!selectedPrivacy) {
      newErrors.privacy = "Privacy option is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Flatten ingredients and steps from sections
    const allIngredients: Ingredient[] = [];
    ingredientSections.forEach((section) => {
      section.ingredients.forEach((ing) => {
        if (ing.name.trim() && ing.quantity.trim()) {
          allIngredients.push({
            heading: section.heading.trim() || ing.heading.trim(),
            name: ing.name.trim(),
            quantity: ing.quantity.trim()
          });
        }
      });
    });

    const allSteps: Step[] = [];
    stepSections.forEach((section) => {
      section.steps.forEach((step) => {
        if (step.step.trim()) {
          allSteps.push({
            heading: section.heading.trim() || step.heading.trim(),
            step: step.step.trim()
          });
        }
      });
    });

    // Convert hours and minutes to total minutes (integer)
    const preparationTimeMinutes = (preparationTime.hours * 60) + preparationTime.minutes;
    const cookTimeMinutes = (cookTime.hours * 60) + cookTime.minutes;

    const recipeData: CreateRecipeData = {
      name: name.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      videos: selectedVideos.length > 0 ? selectedVideos : undefined,
      category_alias: categoryAlias.trim() || undefined,
      recipe_category_alias: recipeCategoryAlias.trim() || undefined,
      food_type_alias: foodTypeAlias.trim() || undefined,
      cuisine_type_alias: cuisineTypeAlias.trim() || undefined,
      no_of_servings: noOfServings.toString(),
      preparation_time: preparationTimeMinutes.toString(),
      cook_time: cookTimeMinutes.toString(),
      special_notes: specialNotes.trim() || undefined,
      ingredients: allIngredients,
      steps: allSteps,
      privacy_alias: selectedPrivacy,
      recipe_alias: undefined,
    };

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await createOrUpdateRecipe(recipeData, token);
      if (response.success && response.data) {
        setIsUploading(false);
        setUploadProgress(100);
        toast.success(response.message || "Recipe created successfully!");
        router.push("/home");
      } else {
        setIsUploading(false);
        toast.error(response.message || "Failed to create recipe");
      }
    } catch (error) {
      console.error("[RecipeUploadForm] Error creating recipe:", error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("An error occurred while creating the recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Upload Recipe</h1>
          <p className="text-gray-600">
            Share your favourite dish with the <span className="text-orange-500 font-semibold">Trippldee</span> community
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          {/* Recipe Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipe Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
              placeholder="e.g., Creamy Truffle Pasta"
              className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFoodCategory}
                onChange={(e) => {
                  handleFoodCategoryChange(e);
                  if (errors.foodCategory) setErrors(prev => ({ ...prev, foodCategory: "" }));
                }}
                className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                  errors.foodCategory ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select Food Category</option>
                {foodCategories.map((category) => (
                  <option key={category.alias} value={category.category}>
                    {category.category}
                  </option>
                ))}
              </select>
              {errors.foodCategory && <p className="text-red-500 text-sm mt-1">{errors.foodCategory}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipe Category Alias <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipeCategoryAlias}
                onChange={(e) => {
                  setRecipeCategoryAlias(e.target.value);
                  if (errors.recipeCategoryAlias) setErrors(prev => ({ ...prev, recipeCategoryAlias: "" }));
                }}
                placeholder="e.g., proteins"
                className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                  errors.recipeCategoryAlias ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.recipeCategoryAlias && <p className="text-red-500 text-sm mt-1">{errors.recipeCategoryAlias}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFoodType}
                onChange={(e) => {
                  handleFoodTypeChange(e);
                  if (errors.foodType) setErrors(prev => ({ ...prev, foodType: "" }));
                }}
                disabled={!selectedFoodCategory || isLoadingFoodTypes}
                className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.foodType ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">
                  {isLoadingFoodTypes
                    ? "Loading food types..."
                    : !selectedFoodCategory
                    ? "Select food category first"
                    : "Select Food Type"}
                </option>
                {foodTypes.map((foodType) => (
                  <option key={foodType.id} value={foodType.name}>
                    {foodType.name}
                  </option>
                ))}
              </select>
              {errors.foodType && <p className="text-red-500 text-sm mt-1">{errors.foodType}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cuisine <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCuisine}
                onChange={(e) => {
                  handleCuisineChange(e);
                  if (errors.cuisine) setErrors(prev => ({ ...prev, cuisine: "" }));
                }}
                className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                  errors.cuisine ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select Cuisine Type</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine.alias} value={cuisine.cuisine}>
                    {cuisine.cuisine}
                  </option>
                ))}
              </select>
              {errors.cuisine && <p className="text-red-500 text-sm mt-1">{errors.cuisine}</p>}
            </div>
          </div>

          {/* Recipe Image / Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipe Image / Video <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all bg-[#FFF8F3] ${
                errors.media ? "border-red-500" : "border-gray-300"
              }`}
            >
              <div className="flex justify-center mb-3">
                <ArrowUp className="text-gray-400 w-12 h-12" />
              </div>
              <p className="text-gray-700 mb-2 font-semibold">
                Drop your photo/video here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  handleFileSelect(e);
                  if (errors.media) setErrors(prev => ({ ...prev, media: "" }));
                }}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supports JPG, PNG, MP4 (max 20MB)
              </p>
            </div>
            {errors.media && <p className="text-red-500 text-sm mt-1">{errors.media}</p>}

            {/* Preview selected files */}
            {(selectedImages.length > 0 || selectedVideos.length > 0) && (
              <div className="mt-4 space-y-2">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{img.name}</p>
                      <p className="text-xs text-gray-500">{(img.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-2 hover:bg-red-100 rounded-full transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
                {selectedVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Video className="w-16 h-16 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{vid.name}</p>
                      <p className="text-xs text-gray-500">{(vid.size / (1024 * 1024)).toFixed(2)} MB</p>
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
          </div>

          {/* No. of persons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              No. of persons <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNoOfServings((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={noOfServings}
                onChange={(e) => {
                  setNoOfServings(Math.max(1, parseInt(e.target.value) || 1));
                  if (errors.noOfServings) setErrors(prev => ({ ...prev, noOfServings: "" }));
                }}
                className={`flex-1 p-3 text-center text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                  errors.noOfServings ? "border-red-500" : "border-gray-200"
                }`}
                min="1"
              />
              <button
                onClick={() => setNoOfServings((prev) => prev + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.noOfServings && <p className="text-red-500 text-sm mt-1">{errors.noOfServings}</p>}
          </div>

          {/* Preparation Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preparation Time <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPreparationTime((prev) => adjustTime(prev, -1, false));
                  if (errors.preparationTime) setErrors(prev => ({ ...prev, preparationTime: "" }));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Minus size={20} />
              </button>
              <input
                type="text"
                value={formatTime(preparationTime.hours, preparationTime.minutes)}
                readOnly
                className="flex-1 p-3 text-center text-base border-2 border-gray-200 rounded-xl bg-[#FFF8F3]"
              />
              <button
                onClick={() => {
                  setPreparationTime((prev) => adjustTime(prev, 1, false));
                  if (errors.preparationTime) setErrors(prev => ({ ...prev, preparationTime: "" }));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.preparationTime && <p className="text-red-500 text-sm mt-1">{errors.preparationTime}</p>}
            <p className="text-xs text-gray-500 mt-1">Time taken for prepare food before cook</p>
          </div>

          {/* Cook Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cook Time <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCookTime((prev) => adjustTime(prev, -1, false));
                  if (errors.cookTime) setErrors(prev => ({ ...prev, cookTime: "" }));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Minus size={20} />
              </button>
              <input
                type="text"
                value={formatTime(cookTime.hours, cookTime.minutes)}
                readOnly
                className="flex-1 p-3 text-center text-base border-2 border-gray-200 rounded-xl bg-[#FFF8F3]"
              />
              <button
                onClick={() => {
                  setCookTime((prev) => adjustTime(prev, 1, false));
                  if (errors.cookTime) setErrors(prev => ({ ...prev, cookTime: "" }));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold"
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.cookTime && <p className="text-red-500 text-sm mt-1">{errors.cookTime}</p>}
            <p className="text-xs text-gray-500 mt-1">Time taken for cook your food</p>
          </div>

          {/* Ingredients Sections */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ingredients <span className="text-red-500">*</span>
            </label>
            {errors.ingredients && <p className="text-red-500 text-sm mb-2">{errors.ingredients}</p>}
          </div>
          {ingredientSections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-[#FFF8F3] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">Ingredients</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Save functionality - could be used for auto-save
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  {ingredientSections.length > 1 && (
                    <button
                      onClick={() => removeIngredientSection(section.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={section.heading}
                onChange={(e) => updateIngredientSectionHeading(section.id, e.target.value)}
                placeholder="Section Headline"
                className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
              />

              {section.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => {
                        updateIngredient(section.id, index, "name", e.target.value);
                        const errorKey = `ingredient_name_${sectionIndex}_${index}`;
                        if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: "" }));
                      }}
                      placeholder="Ingredient Name"
                      className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white ${
                        errors[`ingredient_name_${sectionIndex}_${index}`] ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors[`ingredient_name_${sectionIndex}_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`ingredient_name_${sectionIndex}_${index}`]}</p>
                    )}
                  </div>
                  <div className="w-32">
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        updateIngredient(section.id, index, "quantity", e.target.value);
                        const errorKey = `ingredient_quantity_${sectionIndex}_${index}`;
                        if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: "" }));
                      }}
                      placeholder="Quantity"
                      className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white ${
                        errors[`ingredient_quantity_${sectionIndex}_${index}`] ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors[`ingredient_quantity_${sectionIndex}_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`ingredient_quantity_${sectionIndex}_${index}`]}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeIngredient(section.id, index)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition text-white"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addIngredient(section.id)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition text-white ml-auto"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addIngredientSection}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
          >
            Add new section
          </button>

          {/* Steps Sections */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Steps <span className="text-red-500">*</span>
            </label>
            {errors.steps && <p className="text-red-500 text-sm mb-2">{errors.steps}</p>}
          </div>
          {stepSections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-[#FFF8F3] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">How to make</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Save functionality
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  {stepSections.length > 1 && (
                    <button
                      onClick={() => removeStepSection(section.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={section.heading}
                onChange={(e) => updateStepSectionHeading(section.id, e.target.value)}
                placeholder="Section Heading"
                className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
              />

              {section.steps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                    <button
                      onClick={() => removeStep(section.id, index)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition text-white"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                  <textarea
                    value={step.step}
                    onChange={(e) => {
                      updateStep(section.id, index, "step", e.target.value);
                      const errorKey = `step_${sectionIndex}_${index}`;
                      if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: "" }));
                    }}
                    placeholder="Write the step here..."
                    rows={3}
                    className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none bg-white ${
                      errors[`step_${sectionIndex}_${index}`] ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors[`step_${sectionIndex}_${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`step_${sectionIndex}_${index}`]}</p>
                  )}
                </div>
              ))}

              <button
                onClick={() => addStep(section.id)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition text-white ml-auto"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addStepSection}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
          >
            Add new section
          </button>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Special Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => {
                setSpecialNotes(e.target.value);
                if (errors.specialNotes) setErrors(prev => ({ ...prev, specialNotes: "" }));
              }}
              placeholder="Introducing your recipe, add notes serving suggestions, cooking tips...ect"
              rows={4}
              className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none bg-[#FFF8F3] ${
                errors.specialNotes ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.specialNotes && <p className="text-red-500 text-sm mt-1">{errors.specialNotes}</p>}
          </div>

          {/* Location and Privacy */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              {!showLocationInput ? (
                <button
                  onClick={() => handleGetLocation(true)}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-2 px-4 py-2.5 text-base border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition w-full text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-[#FFF8F3]"
                >
                  <MapPin size={16} className="text-orange-500" />
                  <span className="font-medium">
                    {isFetchingLocation ? "Fetching location..." : "Get Current Location"}
                  </span>
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors(prev => ({ ...prev, location: "" }));
                    }}
                    placeholder="Enter location"
                    required
                    className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                      errors.location ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  <button
                    type="button"
                    onClick={() => handleGetLocation(true)}
                    disabled={isFetchingLocation}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MapPin size={12} />
                    {isFetchingLocation ? "Fetching..." : "Update Location"}
                  </button>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Privacy <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPrivacy}
                onChange={(e) => {
                  setSelectedPrivacy(e.target.value);
                  if (errors.privacy) setErrors(prev => ({ ...prev, privacy: "" }));
                }}
                className={`w-full p-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-[#FFF8F3] ${
                  errors.privacy ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select privacy</option>
                {privacyOptions.map((option) => (
                  <option key={option.alias} value={option.alias}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.privacy && <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-orange-500 text-white font-semibold text-lg rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                "Post"
              )}
            </button>
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
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
    </div>
  );
}

