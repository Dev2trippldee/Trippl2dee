/**
 * Recipe-related types
 */

export interface Ingredient {
  heading: string;
  name: string;
  quantity: string;
}

export interface Step {
  heading: string;
  step: string;
}

export interface RecipeResponse {
  id: number;
  alias?: string; // The alias field from API response (e.g., "protein-shagee-3")
  recipe_alias?: string; // Legacy field, use alias instead
  user_referral_code: string;
  privacy_alias: string;
  privacy: {
    id: number;
    name: string;
  };
  name: string;
  images: RecipeImage[];
  videos: RecipeVideo[];
  category: {
    id: number;
    name: string;
  };
  recipe_category: {
    id: number;
    name: string;
  };
  food_type: {
    id: number;
    name: string;
  };
  cuisine_type: {
    id: number;
    name: string;
  };
  no_of_servings: number;
  preparation_time: string;
  cook_time: string;
  special_notes: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  likes_count: number;
  is_liked_by_me: boolean;
  view_count: number;
  share_count: number;
  saved_count?: number;
  is_saved_by_me?: boolean;
  is_hidden_by_me?: boolean;
  time: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  user_referral_code: string;
  user_name: string;
  privacy_alias: string;
  privacy: {
    id: number;
    name: string;
  };
  name: string;
  images: RecipeImage[];
  videos: RecipeVideo[];
  category: {
    id: number;
    name: string;
  };
  recipe_category: {
    id: number;
    name: string;
  };
  food_type: {
    id: number;
    name: string;
  };
  cuisine_type: {
    id: number;
    name: string;
  };
  no_of_servings: number;
  preparation_time: string;
  cook_time: string;
  special_notes: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  likes_count: number;
  is_liked_by_me: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeImage {
  id?: number;
  url: string;
  thumbnail?: string;
}

export interface RecipeVideo {
  id?: number;
  url: string;
  thumbnail?: string;
}

export interface RecipeIngredient {
  id?: number;
  heading: string;
  name: string;
  quantity: string;
}

export interface RecipeStep {
  id?: number;
  heading: string;
  step: string;
}

/**
 * Food Type interface
 */
export interface FoodType {
  id: number;
  name: string;
  alias: string;
  food_category_alias: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateRecipeData {
  name: string;
  images?: File[];
  videos?: File[];
  category_alias?: string;
  recipe_category_alias?: string;
  food_type_alias?: string;
  cuisine_type_alias?: string;
  no_of_servings?: string;
  preparation_time?: string;
  cook_time?: string;
  special_notes?: string;
  ingredients: Ingredient[];
  steps: Step[];
  privacy_alias?: string;
  recipe_alias?: string;
}

/**
 * Recipe Review types
 */
export interface ReviewUser {
  referral_code: string | null;
  name: string | null;
}

export interface ReviewResponse {
  id: number;
  alias: string;
  commentable_alias: string;
  commentable_type: string;
  parent_alias: string | null;
  user: ReviewUser;
  content: string;
  replies: ReviewResponse[];
  created_at: string;
  updated_at: string;
}

export interface CreateReviewResponse {
  status: boolean;
  message: string;
  data: ReviewResponse;
  statusCode: number;
}

export interface GetReviewsResponse {
  status: boolean;
  data: ReviewResponse[];
  totalComments: number;
  topLevelcomments: number;
  statusCode: number;
}

export interface DeleteReviewResponse {
  status: boolean;
  message: string;
  statusCode: number;
}

