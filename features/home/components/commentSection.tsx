"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Send, User, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { createComment, getComments, deleteComment } from "@/lib/api/post";
import type { CommentResponse } from "@/types/post";

interface CommentSectionProps {
  postAlias: string;
  token: string;
}

export function CommentSection({ postAlias, token }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  // Fetch comments on component mount
  useEffect(() => {
    if (postAlias && token) {
      fetchComments();
    }
  }, [postAlias, token]);

  const fetchComments = async () => {
    if (!postAlias || !token) return;

    setIsLoading(true);
    try {
      const response = await getComments(postAlias, token);
      if (response.success && response.data) {
        setComments(response.data.data || []);
      } else {
        console.error("Failed to fetch comments:", response.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!postAlias) {
      toast.error("Post alias not found");
      return;
    }

    if (!token) {
      toast.error("Please login to comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createComment(postAlias, newComment.trim(), token);
      
      if (response.success && response.data?.data) {
        // Refresh comments to get the latest list
        await fetchComments();
        setNewComment("");
        toast.success(response.data.message || "Comment added successfully!");
      } else {
        toast.error(response.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("An error occurred while adding comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentAlias: string, commentId: number) => {
    if (!commentAlias || !token) {
      toast.error("Cannot delete comment");
      return;
    }

    setDeletingCommentId(commentId);
    try {
      const response = await deleteComment(commentAlias, token);
      
      if (response.success) {
        // Remove the comment from the list
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success(response.data?.message || "Comment deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = (user: { referral_code: string | null; name: string | null }) => {
    if (user.name) return user.name;
    if (user.referral_code) return user.referral_code;
    return "Anonymous";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const displayName = getUserDisplayName(comment.user);
            const isDeleting = deletingCommentId === comment.id;
            return (
              <div key={comment.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {getInitials(displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {displayName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    {comment.alias && (
                      <button
                        onClick={() => handleDeleteComment(comment.alias, comment.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete comment"
                      >
                        {isDeleting ? (
                          <svg
                            className="animate-spin h-4 w-4 text-red-600"
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
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

