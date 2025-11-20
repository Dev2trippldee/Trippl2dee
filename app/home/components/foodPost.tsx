"use client";
import React, { useState, useEffect, useRef } from "react";
import type Player from "video.js/dist/types/player";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  UserPlus,
  MapPin,
  Clock,
} from "lucide-react";
import type { Post } from "@/types/post";
import { timeAgo } from "@/lib/utils/timeAgo";
import { toggleLike } from "@/lib/api/post";
import toast from "react-hot-toast";

// Global Video Manager
class VideoManager {
  private players: Set<{
    pause: () => void;
    play: () => void;
    isPlaying: () => boolean;
  }> = new Set();
  private currentPlayer: {
    pause: () => void;
    play: () => void;
    isPlaying: () => boolean;
  } | null = null;

  register(player: any) {
    this.players.add(player);
  }

  unregister(player: any) {
    this.players.delete(player);
    if (this.currentPlayer === player) {
      this.currentPlayer = null;
    }
  }

  onPlay(player: any) {
    this.players.forEach((p) => {
      if (p !== player && p.isPlaying()) {
        p.pause();
      }
    });
    this.currentPlayer = player;
  }
}

const videoManager = new VideoManager();

/* VIDEO PLAYER COMPONENT SAME AS YOURS (UNTOUCHED) */

function VideoJsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerIdRef = useRef<any>(null);
  const wasPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!src) return;

    const loadVideoJs = async () => {
      try {
        const videojs = (await import("video.js")).default;

        let link = document.querySelector('link[href*="video-js"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement("link") as HTMLLinkElement;
          link.rel = "stylesheet";
          link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/video.js/8.10.0/video-js.min.css";
          document.head.appendChild(link);
        }

        if (!playerRef.current && videoRef.current) {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            responsive: true,
            fluid: true,
            preload: "metadata",
            playbackRates: [0.5, 1, 1.5, 2],
            sources: [
              {
                src: src,
                type: "video/mp4",
              },
            ],
          });

          playerRef.current.ready(() => {
            if (!playerRef.current) return;
            
            const playerControl = {
              pause: () =>
                playerRef.current && !playerRef.current.paused()
                  ? playerRef.current.pause()
                  : null,
              play: () =>
                playerRef.current && playerRef.current.paused()
                  ? playerRef.current.play()
                  : null,
              isPlaying: () =>
                playerRef.current ? !playerRef.current.paused() : false,
            };

            playerIdRef.current = playerControl;
            videoManager.register(playerControl);

            playerRef.current.on("play", () => {
              wasPlayingRef.current = true;
              videoManager.onPlay(playerControl);
            });

            playerRef.current.on("pause", () => {
              wasPlayingRef.current = false;
            });
          });

          if (playerRef.current) {
            playerRef.current.on("error", () => {
              setUseNativePlayer(true);
            });
          }
        }
      } catch {
        setUseNativePlayer(true);
      }
    };

    if (!useNativePlayer) loadVideoJs();

    return () => {
      if (playerIdRef.current) videoManager.unregister(playerIdRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [src, useNativePlayer]);

  if (!src)
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        No video source
      </div>
    );

  if (useNativePlayer)
    return (
      <div ref={containerRef}>
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          className="w-full h-auto max-h-[600px] rounded-lg"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );

  return (
    <div ref={containerRef} data-vjs-player className="w-full">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
        preload="metadata"
      ></video>
      {error && (
        <div className="text-center text-sm text-red-500 mt-2">{error}</div>
      )}
    </div>
  );
}

/* ------------------ FOOD POST COMPONENT ------------------ */

export function FoodPost({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.is_liked_by_me);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [timeAgoText, setTimeAgoText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [token, setToken] = useState<string>("");

  const handleLike = async () => {
    if (!post.alias) {
      toast.error("Cannot like post: Post alias not found");
      return;
    }

    if (!token) {
      toast.error("Please login to like posts");
      return;
    }

    if (isLiking) {
      return; // Prevent multiple simultaneous requests
    }

    setIsLiking(true);
    
    // Optimistic update
    const previousLiked = liked;
    const previousLikeCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await toggleLike(post.alias, token);
      
      if (response.success && response.data) {
        // Update with actual API response
        setLiked(response.data.is_liked_by_me);
        setLikeCount(response.data.likes_count);
      } else {
        // Revert optimistic update on error
        setLiked(previousLiked);
        setLikeCount(previousLikeCount);
        toast.error(response.message || "Failed to toggle like");
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error("Error toggling like:", error);
      toast.error("An error occurred while toggling like");
    } finally {
      setIsLiking(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    setTimeAgoText(timeAgo(post.created_at));
  }, [post.created_at]);

  // Get token from cookies
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  const hasContent = !!post.content?.trim();
  const displayImage = post.images?.[0] || null;
  const displayVideo = post.videos?.[0] || null;

  return (
    <div className="max-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand">
      
      {/* ⭐⭐⭐ UPDATED SMALLER HEADER ⭐⭐⭐ */}
      <div className="flex items-center justify-between p-1 gap-1">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <img
            src={`https://placehold.co/36x36/8b5cf6/ffffff?text=${getInitials(
              post.user_name
            )}`}
            className="w-6 h-6 rounded-full"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-gray-900 text-[9px] truncate max-w-[60px]">
                {post.user_name}
              </span>

              <img src="/green-verified.svg" className="w-2 h-2" />

              <span className="text-[7px] text-gray-500 truncate max-w-[50px]">
                {post.user_referral_code}
              </span>

              <span className="px-1 py-[1px] text-[6.5px] font-medium text-orange-600 bg-orange-50 rounded-full border border-orange-200 leading-none">
                {post.privacy.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[7px] text-gray-400 mt-[2px] flex-wrap">
              {post.user_location && (
                <>
                  <MapPin className="w-2 h-2" />
                  <span className="truncate max-w-[60px]">
                    {post.user_location}
                  </span>
                  <span>•</span>
                </>
              )}
              <Clock className="w-2 h-2" /> <span>{timeAgoText}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="flex items-center gap-1 px-2 py-[2px] text-[8px] font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition">
            <UserPlus className="w-2 h-2" />
            <span className="hidden sm:inline">Follow</span>
          </button>

          <button className="p-1 hover:bg-gray-100 rounded-full">
            <MoreHorizontal className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {hasContent && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 text-sm">{post.content}</p>
        </div>
      )}

      {/* IMAGE */}
      {displayImage && (
        <div className="px-4 pb-3">
          <img
            src={displayImage.url}
            className="w-full h-auto max-h-[600px] rounded-lg object-contain"
          />
        </div>
      )}

      {/* VIDEO */}
      {displayVideo && (
        <div className="px-4 pb-3">
          <VideoJsPlayer src={displayVideo.url} />
        </div>
      )}

      {/* STATS */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
        <div className="flex items-center gap-4">
          <span>
            👍 {likeCount}
          </span>
          <span>👁 {post.view_count}</span>
        </div>
        <span>{post.share_count} Shares</span>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-around px-4 py-2 border-t">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            liked ? "text-red-500" : "text-gray-600"
          } hover:bg-gray-50`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          {isLiking ? "Loading..." : "Like"}
        </button>

        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>

        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
}
