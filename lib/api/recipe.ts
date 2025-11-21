/**
 * Recipe API service functions
 */

import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";
import { handleApiError } from "./client";
import type { ApiResponse } from "@/types/auth";
import type {
  RecipeResponse,
  CreateRecipeData,
  FoodType,
  CreateReviewResponse,
  GetReviewsResponse,
  DeleteReviewResponse,
} from "@/types/recipe";

// Re-export FoodType for convenience
export type { FoodType };

/**
 * Create or update a recipe
 */
export async function createOrUpdateRecipe(
  data: CreateRecipeData,
  token: string
): Promise<ApiResponse<RecipeResponse>> {
  console.log("[API:createOrUpdateRecipe] Starting request...");
  console.log("[API:createOrUpdateRecipe] Endpoint:", API_ENDPOINTS.RECIPE.CREATE_OR_UPDATE);
  console.log("[API:createOrUpdateRecipe] Input data:", {
    name: data.name,
    hasImages: !!data.images,
    hasVideos: !!data.videos,
    category_alias: data.category_alias,
    recipe_category_alias: data.recipe_category_alias,
    food_type_alias: data.food_type_alias,
    cuisine_type_alias: data.cuisine_type_alias,
    no_of_servings: data.no_of_servings,
    preparation_time: data.preparation_time,
    cook_time: data.cook_time,
    special_notes: data.special_notes,
    ingredientsCount: data.ingredients?.length || 0,
    stepsCount: data.steps?.length || 0,
    privacy_alias: data.privacy_alias,
    imageCount: data.images?.length || 0,
    videoCount: data.videos?.length || 0,
  });
  console.log("[API:createOrUpdateRecipe] Token (first 20 chars):", token.substring(0, 20) + "...");
  
  try {
    const formData = new FormData();

    // Add name (required)
    console.log("[API:createOrUpdateRecipe] Adding name to FormData");
    formData.append("name", data.name);

    // Add images if provided
    if (data.images && data.images.length > 0) {
      console.log("[API:createOrUpdateRecipe] Adding images to FormData:", data.images.length);
      data.images.forEach((image, index) => {
        console.log(`[API:createOrUpdateRecipe] Adding image[${index}]:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
        formData.append("images[]", image);
      });
    }

    // Add videos if provided
    if (data.videos && data.videos.length > 0) {
      console.log("[API:createOrUpdateRecipe] Adding videos to FormData:", data.videos.length);
      data.videos.forEach((video, index) => {
        console.log(`[API:createOrUpdateRecipe] Adding video[${index}]:`, {
          name: video.name,
          size: video.size,
          type: video.type
        });
        formData.append("videos[]", video);
      });
    }

    // Add category_alias if provided
    if (data.category_alias) {
      console.log("[API:createOrUpdateRecipe] Adding category_alias:", data.category_alias);
      formData.append("category_alias", data.category_alias);
    }

    // Add recipe_category_alias if provided
    if (data.recipe_category_alias) {
      console.log("[API:createOrUpdateRecipe] Adding recipe_category_alias:", data.recipe_category_alias);
      formData.append("recipe_category_alias", data.recipe_category_alias);
    }

    // Add food_type_alias if provided
    if (data.food_type_alias) {
      console.log("[API:createOrUpdateRecipe] Adding food_type_alias:", data.food_type_alias);
      formData.append("food_type_alias", data.food_type_alias);
    }

    // Add cuisine_type_alias if provided
    if (data.cuisine_type_alias) {
      console.log("[API:createOrUpdateRecipe] Adding cuisine_type_alias:", data.cuisine_type_alias);
      formData.append("cuisine_type_alias", data.cuisine_type_alias);
    }

    // Add no_of_servings if provided
    if (data.no_of_servings) {
      console.log("[API:createOrUpdateRecipe] Adding no_of_servings:", data.no_of_servings);
      formData.append("no_of_servings", data.no_of_servings);
    }

    // Add preparation_time if provided
    if (data.preparation_time) {
      console.log("[API:createOrUpdateRecipe] Adding preparation_time:", data.preparation_time);
      formData.append("preparation_time", data.preparation_time);
    }

    // Add cook_time if provided
    if (data.cook_time) {
      console.log("[API:createOrUpdateRecipe] Adding cook_time:", data.cook_time);
      formData.append("cook_time", data.cook_time);
    }

    // Add special_notes if provided
    if (data.special_notes) {
      console.log("[API:createOrUpdateRecipe] Adding special_notes:", data.special_notes);
      formData.append("special_notes", data.special_notes);
    }

    // Add ingredients array
    if (data.ingredients && data.ingredients.length > 0) {
      console.log("[API:createOrUpdateRecipe] Adding ingredients to FormData:", data.ingredients.length);
      data.ingredients.forEach((ingredient, index) => {
        console.log(`[API:createOrUpdateRecipe] Adding ingredient[${index}]:`, ingredient);
        formData.append(`ingredients[${index}][heading]`, ingredient.heading);
        formData.append(`ingredients[${index}][name]`, ingredient.name);
        formData.append(`ingredients[${index}][quantity]`, ingredient.quantity);
      });
    }

    // Add steps array
    if (data.steps && data.steps.length > 0) {
      console.log("[API:createOrUpdateRecipe] Adding steps to FormData:", data.steps.length);
      data.steps.forEach((step, index) => {
        console.log(`[API:createOrUpdateRecipe] Adding step[${index}]:`, step);
        formData.append(`steps[${index}][heading]`, step.heading);
        formData.append(`steps[${index}][step]`, step.step);
      });
    }

    // Add privacy_alias if provided
    if (data.privacy_alias) {
      console.log("[API:createOrUpdateRecipe] Adding privacy_alias:", data.privacy_alias);
      formData.append("privacy_alias", data.privacy_alias);
    }

    // Add recipe_alias ONLY if provided (this determines if it's an update or create)
    // CRITICAL RULES:
    // - UPDATE: recipe_alias IS included → API performs UPDATE operation
    // - CREATE: recipe_alias IS NOT included → API performs CREATE operation
    if (data.recipe_alias) {
      console.log("========================================");
      console.log("[API:createOrUpdateRecipe] ===== UPDATE OPERATION =====");
      console.log("[API:createOrUpdateRecipe] recipe_alias PROVIDED:", data.recipe_alias);
      console.log("[API:createOrUpdateRecipe] Adding recipe_alias to FormData");
      console.log("[API:createOrUpdateRecipe] This will UPDATE existing recipe, NOT create new one");
      console.log("========================================");
      formData.append("recipe_alias", data.recipe_alias);
    } else {
      console.log("========================================");
      console.log("[API:createOrUpdateRecipe] ===== CREATE OPERATION =====");
      console.log("[API:createOrUpdateRecipe] recipe_alias NOT provided (undefined)");
      console.log("[API:createOrUpdateRecipe] recipe_alias will NOT be added to FormData");
      console.log("[API:createOrUpdateRecipe] This will CREATE a new recipe");
      console.log("========================================");
      // Explicitly NOT adding recipe_alias to FormData for CREATE operation
    }

    // Log FormData contents (for debugging)
    console.log("[API:createOrUpdateRecipe] FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Console log complete request data before sending
    console.log("========================================");
    console.log("[API:createOrUpdateRecipe] ===== REQUEST DATA BEING SENT =====");
    console.log("========================================");
    console.log("[API:createOrUpdateRecipe] Request URL:", API_ENDPOINTS.RECIPE.CREATE_OR_UPDATE);
    console.log("[API:createOrUpdateRecipe] Request Method: POST");
    console.log("[API:createOrUpdateRecipe] Request Headers:", {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token.substring(0, 20)}...`,
    });
    
    // Build a summary object of all FormData entries for easier reading
    const requestDataSummary: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (!requestDataSummary[key]) {
          requestDataSummary[key] = [];
        }
        requestDataSummary[key].push({
          name: value.name,
          size: value.size,
          type: value.type,
        });
      } else {
        requestDataSummary[key] = value;
      }
    }
    console.log("[API:createOrUpdateRecipe] Request Body (FormData summary):", JSON.stringify(requestDataSummary, null, 2));
    
    // Also log the raw FormData entries one more time for clarity
    console.log("[API:createOrUpdateRecipe] All FormData entries being sent:");
    const entriesArray: Array<{ key: string; value: any }> = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        entriesArray.push({
          key,
          value: { 
            type: "File", 
            name: value.name, 
            size: `${(value.size / 1024).toFixed(2)} KB`,
            mimeType: value.type 
          },
        });
      } else {
        entriesArray.push({ key, value });
      }
    }
    console.table(entriesArray);
    
    console.log("[API:createOrUpdateRecipe] Sending POST request...");
    // Use Next.js API route which will log to terminal and proxy to external API
    const response = await axios.post<ApiResponse<RecipeResponse>>(
      "/api/recipe/create-or-update",
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("========================================");
    console.log("[API:createOrUpdateRecipe] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[API:createOrUpdateRecipe] Response status:", response.status);
    console.log("[API:createOrUpdateRecipe] Response headers:", response.headers);
    console.log("[API:createOrUpdateRecipe] Response data:", JSON.stringify(response.data, null, 2));
    if (response.data && response.data.data) {
      console.log("[API:createOrUpdateRecipe] Recipe details:", {
        id: response.data.data.id,
        name: response.data.data.name,
        recipe_alias: response.data.data.recipe_alias,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      });
    }
    console.log("[API:createOrUpdateRecipe] Response message:", response.data?.message);
    console.log("[API:createOrUpdateRecipe] Response success:", response.data?.success);
    
    return response.data;
  } catch (err) {
    console.error("[API:createOrUpdateRecipe] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateRecipe] Error response:", err.response?.data);
      console.error("[API:createOrUpdateRecipe] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<RecipeResponse>(err);
    console.error("[API:createOrUpdateRecipe] Error response:", errorResponse);
    return errorResponse;
  }
}

/**
 * Get all recipes
 */
export interface RecipesResponse {
  data: RecipeResponse[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  status: boolean;
  message: string;
  statusCode: number;
}

export async function getAllRecipes(
  token: string,
  page: number = 1
): Promise<ApiResponse<RecipesResponse>> {
  console.log("[API:getAllRecipes] Starting request...");
  console.log("[API:getAllRecipes] Endpoint:", API_ENDPOINTS.RECIPE.GET_ALL);
  console.log("[API:getAllRecipes] Page:", page);
  console.log("[API:getAllRecipes] Token (first 20 chars):", token.substring(0, 20) + "...");
  
  try {
    const response = await axios.get<RecipesResponse>(
      `${API_ENDPOINTS.RECIPE.GET_ALL}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("[API:getAllRecipes] Response status:", response.status);
    console.log("[API:getAllRecipes] Response data:", response.data);
    console.log("[API:getAllRecipes] Recipes count:", response.data?.data?.length || 0);
    console.log("[API:getAllRecipes] Pagination meta:", response.data?.meta);
    
    return {
      success: response.data.status || true,
      data: response.data,
      message: response.data.message || "Recipes fetched successfully",
    };
  } catch (err) {
    console.error("[API:getAllRecipes] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getAllRecipes] Error response:", err.response?.data);
      console.error("[API:getAllRecipes] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<RecipesResponse>(err);
    console.error("[API:getAllRecipes] Error response:", errorResponse);
    return errorResponse;
  }
}

/**
 * Get set of recipes with pagination
 */
export async function getSetOfRecipes(
  token: string,
  page: number = 1
): Promise<ApiResponse<RecipesResponse>> {
  console.log("[API:getSetOfRecipes] Starting request...");
  console.log("[API:getSetOfRecipes] Endpoint:", API_ENDPOINTS.RECIPE.GET_SET);
  console.log("[API:getSetOfRecipes] Page:", page);
  console.log("[API:getSetOfRecipes] Token (first 20 chars):", token.substring(0, 20) + "...");
  
  try {
    const response = await axios.get<RecipesResponse>(
      `${API_ENDPOINTS.RECIPE.GET_SET}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("[API:getSetOfRecipes] Response status:", response.status);
    console.log("[API:getSetOfRecipes] Response data:", response.data);
    console.log("[API:getSetOfRecipes] Recipes count:", response.data?.data?.length || 0);
    console.log("[API:getSetOfRecipes] Pagination meta:", response.data?.meta);
    
    return {
      success: response.data.status || true,
      data: response.data,
      message: response.data.message || "Set of recipes fetched successfully",
    };
  } catch (err) {
    console.error("[API:getSetOfRecipes] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getSetOfRecipes] Error response:", err.response?.data);
      console.error("[API:getSetOfRecipes] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<RecipesResponse>(err);
    console.error("[API:getSetOfRecipes] Error response:", errorResponse);
    return errorResponse;
  }
}

/**
 * Cuisine interface
 */
export interface Cuisine {
  cuisine: string;
  alias: string;
}

/**
 * Food Category interface
 */
export interface FoodCategory {
  category: string;
  alias: string;
}

/**
 * Recipe Category interface
 */
export interface RecipeCategory {
  id: number;
  name: string;
  alias: string;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Get all cuisines
 */
export async function getCuisines(
  token: string
): Promise<ApiResponse<Cuisine[]>> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: Cuisine[];
      code: number;
    }>(API_ENDPOINTS.RECIPE.GET_CUISINES, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.data.success || true,
      data: response.data.data || [],
      message: response.data.message || "Cuisines fetched successfully",
    };
  } catch (err) {
    console.error("[API:getCuisines] Error occurred:", err);
    const errorResponse = handleApiError<Cuisine[]>(err);
    return errorResponse;
  }
}

/**
 * Get all food categories
 */
export async function getFoodCategories(
  token: string
): Promise<ApiResponse<FoodCategory[]>> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: FoodCategory[];
      code: number;
    }>(API_ENDPOINTS.RECIPE.GET_FOOD_CATEGORIES, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.data.success || true,
      data: response.data.data || [],
      message: response.data.message || "Food categories fetched successfully",
    };
  } catch (err) {
    console.error("[API:getFoodCategories] Error occurred:", err);
    const errorResponse = handleApiError<FoodCategory[]>(err);
    return errorResponse;
  }
}

/**
 * Get all recipe categories
 */
export async function getRecipeCategories(
  token: string
): Promise<ApiResponse<RecipeCategory[]>> {
  try {
    const response = await axios.get<{
      status: boolean;
      message?: string;
      data: RecipeCategory[];
      statusCode: number;
    }>(API_ENDPOINTS.RECIPE.GET_RECIPE_CATEGORIES, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.data.status || true,
      data: response.data.data || [],
      message: response.data.message || "Recipe categories fetched successfully",
    };
  } catch (err) {
    console.error("[API:getRecipeCategories] Error occurred:", err);
    const errorResponse = handleApiError<RecipeCategory[]>(err);
    return errorResponse;
  }
}

/**
 * Get food types by food category alias
 */
export async function getFoodTypes(
  token: string,
  foodCategoryAlias: string
): Promise<ApiResponse<FoodType[]>> {
  console.log("[API:getFoodTypes] Fetching food types for category:", foodCategoryAlias);
  
  try {
    const response = await axios.get<{
      status: boolean;
      data: FoodType[];
      statusCode: number;
      message?: string;
    }>(API_ENDPOINTS.RECIPE.GET_FOOD_TYPES, {
      params: {
        food_category_alias: foodCategoryAlias,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[API:getFoodTypes] Response:", response.data);
    console.log("[API:getFoodTypes] Food types count:", response.data?.data?.length || 0);

    return {
      success: response.data.status || true,
      data: response.data.data || [],
      message: response.data.message || "Food types fetched successfully",
    };
  } catch (err) {
    console.error("[API:getFoodTypes] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getFoodTypes] Error response:", err.response?.data);
      console.error("[API:getFoodTypes] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<FoodType[]>(err);
    return errorResponse;
  }
}

/**
 * Toggle like on a recipe
 */
export interface ToggleRecipeLikeResponse {
  message: string;
  likes_count: number;
  is_liked_by_me: boolean;
}

export async function toggleRecipeLike(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<ToggleRecipeLikeResponse>> {
  try {
    const response = await axios.post<ToggleRecipeLikeResponse>(
      API_ENDPOINTS.RECIPE.TOGGLE_LIKE,
      {
        recipe_alias: recipeAlias,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    console.error("[API:toggleRecipeLike] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:toggleRecipeLike] Error response:", err.response?.data);
      console.error("[API:toggleRecipeLike] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<ToggleRecipeLikeResponse>(err);
    return errorResponse;
  }
}

/**
 * Get likes count for a recipe
 */
export interface GetRecipeLikesCountResponse {
  status: boolean;
  likes_count: number;
  liked_by: Array<{ id: number; name: string }>;
}

export async function getRecipeLikesCount(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<GetRecipeLikesCountResponse>> {
  try {
    const response = await axios.get<GetRecipeLikesCountResponse>(
      API_ENDPOINTS.RECIPE.GET_LIKES_COUNT,
      {
        params: {
          recipe_alias: recipeAlias,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
    };
  } catch (err) {
    console.error("[API:getRecipeLikesCount] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getRecipeLikesCount] Error response:", err.response?.data);
      console.error("[API:getRecipeLikesCount] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<GetRecipeLikesCountResponse>(err);
    return errorResponse;
  }
}

/**
 * Get share links for a recipe
 */
export interface RecipeShareLinksResponse {
  status: boolean;
  message: string;
  share_links: {
    facebook: string;
    whatsapp: string;
    twitter: string;
    linkedin: string;
    copy_link: string;
  };
  share_count: number;
  statusCode: number;
}

export async function getRecipeShareLinks(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<RecipeShareLinksResponse>> {
  try {
    // Using query params for GET request (consistent with post API)
    const response = await axios.get<RecipeShareLinksResponse>(
      `${API_ENDPOINTS.RECIPE.SHARE}?recipe_alias=${encodeURIComponent(recipeAlias)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    console.error("[API:getRecipeShareLinks] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getRecipeShareLinks] Error response:", err.response?.data);
      console.error("[API:getRecipeShareLinks] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<RecipeShareLinksResponse>(err);
    return errorResponse;
  }
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<{ status: boolean; message: string; statusCode: number }>> {
  try {
    const response = await axios.delete<{ status: boolean; message: string; statusCode: number }>(
      API_ENDPOINTS.RECIPE.DELETE,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          recipe_alias: recipeAlias,
        },
      }
    );
    
    // Map the API response (which uses 'status') to ApiResponse format (which uses 'success')
    return {
      success: response.data.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (err) {
    const errorResponse = handleApiError<{ status: boolean; message: string; statusCode: number }>(err);
    return errorResponse;
  }
}

/**
 * Report a recipe
 */
export interface ReportRecipeResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    user_referral_code: string;
    reportable_alias: string;
    reportable_type: string;
    reason: string;
    created_at: string;
    updated_at: string;
  };
  statusCode: number;
}

export async function reportRecipe(
  recipeAlias: string,
  reason: string,
  token: string
): Promise<ApiResponse<ReportRecipeResponse>> {
  try {
    const response = await axios.post<ReportRecipeResponse>(
      API_ENDPOINTS.RECIPE.REPORT,
      {
        recipe_alias: recipeAlias,
        reason: reason,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    const errorResponse = handleApiError<ReportRecipeResponse>(err);
    return errorResponse;
  }
}

/**
 * Toggle save on a recipe
 */
export async function toggleSaveRecipe(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<{ status: boolean; message: string; saved: boolean }>> {
  try {
    const response = await axios.post<{ status: boolean; message: string; saved: boolean }>(
      API_ENDPOINTS.RECIPE.TOGGLE_SAVE,
      {
        recipe_alias: recipeAlias,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    const errorResponse = handleApiError<{ status: boolean; message: string; saved: boolean }>(err);
    return errorResponse;
  }
}

/**
 * Toggle hide on a recipe
 */
export interface ToggleHideRecipeResponse {
  status: boolean;
  message: string;
  hidden: boolean;
  statusCode: number;
}

export async function toggleHideRecipe(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<ToggleHideRecipeResponse>> {
  try {
    const response = await axios.post<ToggleHideRecipeResponse>(
      API_ENDPOINTS.RECIPE.TOGGLE_HIDE,
      {
        recipe_alias: recipeAlias,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    console.error("[API:toggleHideRecipe] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:toggleHideRecipe] Error response:", err.response?.data);
      console.error("[API:toggleHideRecipe] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<ToggleHideRecipeResponse>(err);
    return errorResponse;
  }
}

/**
 * Create or update a review on a recipe
 */
export async function createOrUpdateReview(
  recipeAlias: string,
  content: string,
  token: string
): Promise<ApiResponse<CreateReviewResponse>> {
  try {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("recipe_alias", recipeAlias);

    const response = await axios.post<CreateReviewResponse>(
      API_ENDPOINTS.RECIPE.CREATE_OR_UPDATE_REVIEW,
      formData,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // Content-Type will be set automatically by axios/browser with boundary
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    console.error("[API:createOrUpdateReview] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateReview] Error response:", err.response?.data);
      console.error("[API:createOrUpdateReview] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<CreateReviewResponse>(err);
    return errorResponse;
  }
}

/**
 * Get reviews for a recipe
 */
export async function getReviews(
  recipeAlias: string,
  token: string
): Promise<ApiResponse<GetReviewsResponse>> {
  try {
    // Using GET with query parameters, following the same pattern as getComments
    const response = await axios.get<GetReviewsResponse>(
      `${API_ENDPOINTS.RECIPE.GET_REVIEW}?recipe_alias=${encodeURIComponent(recipeAlias)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
    };
  } catch (err) {
    console.error("[API:getReviews] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:getReviews] Error response:", err.response?.data);
      console.error("[API:getReviews] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<GetReviewsResponse>(err);
    return errorResponse;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewAlias: string,
  token: string
): Promise<ApiResponse<DeleteReviewResponse>> {
  try {
    const response = await axios.delete<DeleteReviewResponse>(
      API_ENDPOINTS.RECIPE.DELETE_REVIEW,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          review_alias: reviewAlias,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    console.error("[API:deleteReview] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:deleteReview] Error response:", err.response?.data);
      console.error("[API:deleteReview] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<DeleteReviewResponse>(err);
    return errorResponse;
  }
}

