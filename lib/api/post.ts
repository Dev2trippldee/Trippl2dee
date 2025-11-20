/**
 * Post API service functions
 */

import axios from "axios";
import { env } from "../config/env";
import { API_ENDPOINTS } from "../constants/api";
import { handleApiError } from "./client";
import type { ApiResponse } from "@/types/auth";
import type {
  PrivacyOption,
  PostResponse,
  CreatePostData,
  PostsResponse,
  CreateCommentResponse,
  GetCommentsResponse,
  DeleteCommentResponse,
} from "@/types/post";

/**
 * Get privacy options
 */
export async function getPrivacyOptions(
  token: string
): Promise<ApiResponse<PrivacyOption[]>> {
  try {
    const response = await axios.get<ApiResponse<PrivacyOption[]>>(
      API_ENDPOINTS.PRIVACY.LIST,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    const errorResponse = handleApiError<PrivacyOption[]>(err);
    return errorResponse;
  }
}

/**
 * Create or update a post
 */
export async function createOrUpdatePost(
  data: CreatePostData,
  token: string
): Promise<ApiResponse<PostResponse>> {
  try {
    const formData = new FormData();

    // Add content if provided
    if (data.content) {
      formData.append("content", data.content);
    }

    // Add images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    // Add videos if provided
    if (data.videos && data.videos.length > 0) {
      data.videos.forEach((video) => {
        formData.append("videos[]", video);
      });
    }

    // Add privacy alias (required)
    formData.append("privacy_alias", data.privacy_alias);

    // Add location if provided (trim to remove any whitespace)
    if (data.location && data.location.trim()) {
      formData.append("location", data.location.trim());
    }

    // Add post_alias if provided (required by backend)
    if (data.post_alias) {
      formData.append("post_alias", data.post_alias);
    }

    // Note: Don't set Content-Type header manually for FormData
    // Let the browser set it automatically with the correct boundary
    const response = await axios.post<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POST.CREATE_OR_UPDATE,
      formData,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // Content-Type will be set automatically by axios/browser with boundary
        },
      }
    );
    
    return response.data;
  } catch (err) {
    const errorResponse = handleApiError<PostResponse>(err);
    return errorResponse;
  }
}

/**
 * Helper function to get first two words from location string
 */
function getFirstTwoWords(location: string | null | undefined): string | null {
  if (!location || typeof location !== "string" || location.trim().length === 0) {
    return null;
  }
  const words = location.trim().split(/\s+/);
  return words.slice(0, 2).join(" ") || null;
}

/**
 * Get all posts
 */
export async function getAllPosts(
  token: string,
  page: number = 1
): Promise<ApiResponse<PostsResponse>> {
  try {
    const response = await axios.get<PostsResponse>(
      `${API_ENDPOINTS.POST.GET_ALL}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Process location to show only first two words
    if (response.data?.data) {
      response.data.data = response.data.data.map((post) => ({
        ...post,
        location: getFirstTwoWords(post.location),
      }));
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    const errorResponse = handleApiError<PostsResponse>(err);
    return errorResponse;
  }
}

/**
 * Get all saved posts
 */
export async function getSavedPosts(
  token: string,
  page: number = 1
): Promise<ApiResponse<PostsResponse>> {
  try {
    const response = await axios.get<PostsResponse>(
      `${API_ENDPOINTS.POST.GET_SAVED_POSTS}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Process location to show only first two words
    if (response.data?.data) {
      response.data.data = response.data.data.map((post) => ({
        ...post,
        location: getFirstTwoWords(post.location),
      }));
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    const errorResponse = handleApiError<PostsResponse>(err);
    return errorResponse;
  }
}

/**
 * Delete a post
 */
export async function deletePost(
  postAlias: string,
  token: string
): Promise<ApiResponse<{ status: boolean; message: string; statusCode: number }>> {
  try {
    const response = await axios.delete<{ status: boolean; message: string; statusCode: number }>(
      API_ENDPOINTS.POST.DELETE,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          post_alias: postAlias,
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
 * Toggle like on a post
 */
export async function toggleLike(
  postAlias: string,
  token: string
): Promise<ApiResponse<{ message: string; likes_count: number; is_liked_by_me: boolean }>> {
  try {
    const response = await axios.post<{ message: string; likes_count: number; is_liked_by_me: boolean }>(
      API_ENDPOINTS.POST.TOGGLE_LIKE,
      {
        post_alias: postAlias,
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
    const errorResponse = handleApiError<{ message: string; likes_count: number; is_liked_by_me: boolean }>(err);
    return errorResponse;
  }
}

/**
 * Get likes count for a post
 */
export async function getLikesCount(
  postAlias: string,
  token: string
): Promise<ApiResponse<{ status: boolean; likes_count: number; liked_by: Array<{ id: number; name: string }> }>> {
  try {
    const response = await axios.get<{ status: boolean; likes_count: number; liked_by: Array<{ id: number; name: string }> }>(
      `${API_ENDPOINTS.POST.GET_LIKES_COUNT}?post_alias=${encodeURIComponent(postAlias)}`,
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
    const errorResponse = handleApiError<{ status: boolean; likes_count: number; liked_by: Array<{ id: number; name: string }> }>(err);
    return errorResponse;
  }
}

/**
 * Get share links for a post
 */
export interface ShareLinksResponse {
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

export async function getShareLinks(
  postAlias: string,
  token: string
): Promise<ApiResponse<ShareLinksResponse>> {
  try {
    // Using query params for GET request (standard approach)
    // If API requires body, we may need to change to POST
    const response = await axios.get<ShareLinksResponse>(
      `${API_ENDPOINTS.POST.SHARE}?post_alias=${encodeURIComponent(postAlias)}`,
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
    const errorResponse = handleApiError<ShareLinksResponse>(err);
    return errorResponse;
  }
}

/**
 * Toggle save on a post
 */
export async function toggleSave(
  postAlias: string,
  token: string
): Promise<ApiResponse<{ status: boolean; message: string; saved: boolean }>> {
  try {
    const response = await axios.post<{ status: boolean; message: string; saved: boolean }>(
      API_ENDPOINTS.POST.TOGGLE_SAVE,
      {
        post_alias: postAlias,
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
 * Report a post
 */
export interface ReportResponse {
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

export async function reportPost(
  postAlias: string,
  reason: string,
  token: string
): Promise<ApiResponse<ReportResponse>> {
  try {
    const response = await axios.post<ReportResponse>(
      API_ENDPOINTS.POST.REPORT,
      {
        post_alias: postAlias,
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
    const errorResponse = handleApiError<ReportResponse>(err);
    return errorResponse;
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(
  postAlias: string,
  content: string,
  token: string
): Promise<ApiResponse<CreateCommentResponse>> {
  try {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("post_alias", postAlias);

    const response = await axios.post<CreateCommentResponse>(
      API_ENDPOINTS.POST.CREATE_COMMENT,
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
    const errorResponse = handleApiError<CreateCommentResponse>(err);
    return errorResponse;
  }
}

/**
 * Get comments for a post
 */
export async function getComments(
  postAlias: string,
  token: string
): Promise<ApiResponse<GetCommentsResponse>> {
  try {
    // Using GET with query parameters, following the same pattern as getAllPosts
    const response = await axios.get<GetCommentsResponse>(
      `${API_ENDPOINTS.POST.GET_COMMENTS}?post_alias=${encodeURIComponent(postAlias)}`,
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
    const errorResponse = handleApiError<GetCommentsResponse>(err);
    return errorResponse;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentAlias: string,
  token: string
): Promise<ApiResponse<DeleteCommentResponse>> {
  try {
    const response = await axios.delete<DeleteCommentResponse>(
      API_ENDPOINTS.POST.DELETE_COMMENT,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          comment_alias: commentAlias,
        },
      }
    );

    return {
      success: response.data.status,
      data: response.data,
      message: response.data.message,
    };
  } catch (err) {
    const errorResponse = handleApiError<DeleteCommentResponse>(err);
    return errorResponse;
  }
}

/**
 * Toggle hide on a post
 */
export interface ToggleHidePostResponse {
  status: boolean;
  message: string;
  hidden: boolean;
  statusCode: number;
}

export async function toggleHidePost(
  postAlias: string,
  token: string
): Promise<ApiResponse<ToggleHidePostResponse>> {
  try {
    const response = await axios.post<ToggleHidePostResponse>(
      API_ENDPOINTS.POST.TOGGLE_HIDE,
      {
        post_alias: postAlias,
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
    console.error("[API:toggleHidePost] Error occurred:", err);
    if (axios.isAxiosError(err)) {
      console.error("[API:toggleHidePost] Error response:", err.response?.data);
      console.error("[API:toggleHidePost] Error status:", err.response?.status);
    }
    const errorResponse = handleApiError<ToggleHidePostResponse>(err);
    return errorResponse;
  }
}

