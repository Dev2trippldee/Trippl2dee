/**
 * Post-related types
 */

export interface PrivacyOption {
  name: string;
  alias: string;
}

export interface PostResponse {
  id: number;
  alias: string | null;
  user_referral_code: string;
  privacy_alias: string;
  privacy: {
    id: number;
    name: string;
  };
  content: string | null;
  location: string | null;
  likes_count: number;
  is_liked_by_me: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  videos: PostVideo[];
}

export interface Post {
  id: number;
  alias: string | null;
  user_referral_code: string;
  user_name: string;
  user_location: string | null;
  privacy_alias: string;
  privacy: {
    id: number;
    name: string;
  };
  content: string | null;
  likes_count: number;
  is_liked_by_me: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  videos: PostVideo[];
}

export interface PostImage {
  id?: number;
  url: string;
  thumbnail?: string;
}

export interface PostVideo {
  id?: number;
  url: string;
  thumbnail?: string;
}

export interface PostsResponse {
  data: PostResponse[];
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
}

export interface CreatePostData {
  content?: string;
  images?: File[];
  videos?: File[];
  privacy_alias: string;
  location?: string;
  post_alias?: string;
}

export interface CommentUser {
  referral_code: string | null;
  name: string | null;
}

export interface CommentResponse {
  id: number;
  alias: string;
  commentable_alias: string;
  commentable_type: string;
  parent_alias: string | null;
  user: CommentUser;
  content: string;
  replies: CommentResponse[];
  created_at: string;
  updated_at: string;
}

export interface CreateCommentResponse {
  status: boolean;
  message: string;
  data: CommentResponse;
  statusCode: number;
}

export interface GetCommentsResponse {
  status: boolean;
  data: CommentResponse[];
  totalComments: number;
  topLevelComments: number;
  statusCode: number;
}

export interface DeleteCommentResponse {
  status: boolean;
  message: string;
  statusCode: number;
}

