"use client";

import React, { useState, useEffect, useRef } from "react";
import { FoodieSuggestions } from "@/features/home/components/foodieSugg";
import { FoodPost } from "@/features/home/components/foodPost";
import { PostForm } from "@/features/home/components/postForm";
import { PostSkeleton } from "@/app/home/components/postSkeleton";
import { getAllPosts } from "@/lib/api/post";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [token, setToken] = useState<string>("");
  const [userType, setUserType] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get token and user type from cookies API
    const fetchUserData = async () => {
      console.log("[Home] Fetching token and user data from cookies API...");
      try {
        const response = await fetch("/api/cookies/get-user-data");
        console.log("[Home] Token API response status:", response.status);
        const data = await response.json();
        console.log("[Home] Token API response data:", data);
        if (data.token) {
          console.log("[Home] Token received, setting token");
          setToken(data.token);
        } else {
          console.warn("[Home] No token found in response");
          toast.error("Please login to view posts");
        }
        // Set user type
        if (data.type) {
          console.log("[Home] User type received:", data.type);
          setUserType(data.type);
        }
      } catch (error) {
        console.error("[Home] Failed to fetch token:", error);
        toast.error("Failed to authenticate");
      }
    };

    fetchUserData();
  }, []);

  const fetchPosts = async (page: number = 1, append: boolean = false) => {
    if (!token) {
      console.log("[Home] No token available, skipping fetch");
      setIsLoading(false);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await getAllPosts(token, page);
      console.log("[Home] Posts API response:", response);
      if (response.success && response.data) {
        console.log("[Home] Posts loaded:", response.data.data.length);
        console.log("[Home] Pagination meta:", response.data.meta);
        
        // Map PostResponse to Post format
        const mappedPosts: Post[] = response.data.data.map((postResponse) => {
          // Get user name from referral code or use a default
          const userName = postResponse.user_referral_code || "User";
          
          return {
            id: postResponse.id,
            alias: postResponse.alias,
            user_referral_code: postResponse.user_referral_code,
            user_name: userName,
            user_location: postResponse.location, // Map location to user_location (already processed to first two words)
            privacy_alias: postResponse.privacy_alias,
            privacy: postResponse.privacy,
            content: postResponse.content,
            likes_count: postResponse.likes_count,
            is_liked_by_me: postResponse.is_liked_by_me,
            view_count: postResponse.view_count,
            share_count: postResponse.share_count,
            created_at: postResponse.created_at,
            updated_at: postResponse.updated_at,
            images: postResponse.images,
            videos: postResponse.videos,
          };
        });
        
        if (append) {
          // Append new posts to existing ones
          setPosts((prevPosts) => [...prevPosts, ...mappedPosts]);
        } else {
          // Replace posts for first page
          setPosts(mappedPosts);
        }

        // Update pagination state
        const { current_page, last_page } = response.data.meta;
        setCurrentPage(current_page);
        setHasMorePages(current_page < last_page);
      } else {
        console.error("[Home] Failed to load posts:", response.message);
        toast.error(response.message || "Failed to load posts");
      }
    } catch (error) {
      console.error("[Home] Error loading posts:", error);
      toast.error("An error occurred while loading posts");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget || !hasMorePages || isLoadingMore || isLoading || !token) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMorePages && !isLoadingMore) {
          console.log("[Home] Load more trigger detected, fetching next page");
          const nextPage = currentPage + 1;
          fetchPosts(nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMorePages, isLoadingMore, isLoading, currentPage, token]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePages) {
      fetchPosts(currentPage + 1, true);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    console.log("[Home] New post created, adding to list:", newPost);
    // Add the new post at the beginning of the list
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId: number) => {
    console.log("[Home] Post deleted, removing from list. Post ID:", postId);
    console.log("[Home] Current posts before deletion:", posts.map(p => ({ id: p.id, alias: p.alias })));
    // Remove the deleted post from the list
    setPosts((prevPosts) => {
      const filtered = prevPosts.filter((post) => post.id !== postId);
      console.log("[Home] Posts after filtering:", filtered.map(p => ({ id: p.id, alias: p.alias })));
      return filtered;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-[20px]">
        <PostForm onPostCreated={handlePostCreated} />
        {Array.from({ length: 3 }).map((_, idx) => (
          <PostSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-[20px]">
      <PostForm onPostCreated={handlePostCreated} />
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No posts yet. Be the first to post!</div>
      ) : (
        <>
          {posts.map((post, idx) => {
            // Insert FoodieSuggestions after the 3rd post (index 2)
            if (idx === 2) {
              return (
                <React.Fragment key={`suggestions-${idx}`}>
                  <FoodPost key={post.id} post={post} token={token} onPostDeleted={handlePostDeleted} />
                  <FoodieSuggestions key={`suggestions`} />
                </React.Fragment>
              );
            }
            return <FoodPost key={post.id} post={post} token={token} onPostDeleted={handlePostDeleted} />;
          })}
          
          {/* Infinite Scroll Sentinel & Loading Indicator */}
          {hasMorePages && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {isLoadingMore ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <svg
                    className="animate-spin h-6 w-6 text-orange-500"
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
                  <span className="text-sm font-medium">Loading more posts...</span>
                </div>
              ) : (
                <div className="h-6" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
