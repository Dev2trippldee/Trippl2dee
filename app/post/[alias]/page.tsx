"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FoodPost } from "@/features/home/components/foodPost";
import { CommentSection } from "@/features/home/components/commentSection";
import { getAllPosts } from "@/lib/api/post";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/app/home/components/navbar";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alias = params.alias as string;
  const [post, setPost] = useState<Post | null>(null);
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
          toast.error("Please login to view post");
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
    const fetchPost = async () => {
      if (!token || !alias) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all posts and find the one with matching alias
        const response = await getAllPosts(token, 1);
        if (response.success && response.data) {
          const allPosts = response.data.data;
          
          // Map PostResponse to Post format
          const mappedPosts: Post[] = allPosts.map((postResponse) => {
            const userName = postResponse.user_referral_code || "User";
            return {
              id: postResponse.id,
              alias: postResponse.alias,
              user_referral_code: postResponse.user_referral_code,
              user_name: userName,
              user_location: postResponse.location,
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

          const foundPost = mappedPosts.find((p) => p.alias === alias);
          if (foundPost) {
            setPost(foundPost);
          } else {
            toast.error("Post not found");
            router.push("/home");
          }
        } else {
          toast.error("Failed to load post");
          router.push("/home");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("An error occurred while loading the post");
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPost();
    }
  }, [token, alias, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-66px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-66px)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Post not found</p>
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

          {/* Post */}
          <div className="mb-6">
            <FoodPost post={post} token={token} />
          </div>

          {/* Comment Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand p-6">
            <CommentSection postAlias={alias} token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}

