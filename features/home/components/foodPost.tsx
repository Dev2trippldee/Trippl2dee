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
  Trash2,
  X,
  Bookmark,
  Flag,
  Edit,
  Image as ImageIcon,
  Video,
  EyeOff,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/post";
import { timeAgo } from "@/lib/utils/timeAgo";
import { deletePost, toggleLike, getShareLinks, toggleSave, reportPost, createOrUpdatePost, toggleHidePost } from "@/lib/api/post";
import toast from "react-hot-toast";

// Global video manager to ensure only one video plays at a time
class VideoManager {
  private players: Set<{ pause: () => void; play: () => void; isPlaying: () => boolean }> = new Set();
  private currentPlayer: { pause: () => void; play: () => void; isPlaying: () => boolean } | null = null;

  register(player: { pause: () => void; play: () => void; isPlaying: () => boolean }) {
    this.players.add(player);
  }

  unregister(player: { pause: () => void; play: () => void; isPlaying: () => boolean }) {
    this.players.delete(player);
    if (this.currentPlayer === player) {
      this.currentPlayer = null;
    }
  }

  onPlay(player: { pause: () => void; play: () => void; isPlaying: () => boolean }) {
    // Pause all other players
    this.players.forEach((p) => {
      if (p !== player && p.isPlaying()) {
        p.pause();
      }
    });
    this.currentPlayer = player;
  }
}

const videoManager = new VideoManager();

interface VideoJsPlayerProps {
  src: string;
}

function VideoJsPlayer({ src }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerIdRef = useRef<{ pause: () => void; isPlaying: () => boolean; play: () => void } | null>(null);
  const wasPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!src) {
      return;
    }

    // Reset error state when src changes
    setError(null);

    const loadVideoJs = async () => {
      try {
        const videojs = (await import("video.js")).default;

        // Check if stylesheet already exists
        let link = document.querySelector('link[href*="video-js"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement("link") as HTMLLinkElement;
          link.rel = "stylesheet";
          link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/video.js/8.10.0/video-js.min.css";
          document.head.appendChild(link);
        }

        if (!playerRef.current && videoRef.current) {
          // Detect video type from URL
          const videoType = src.endsWith(".mp4") ? "video/mp4" : 
                          src.endsWith(".webm") ? "video/webm" :
                          src.endsWith(".ogg") ? "video/ogg" : "video/mp4";
          
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            responsive: true,
            fluid: true,
            preload: "metadata",
            playbackRates: [0.5, 1, 1.5, 2],
            sources: [{
              src: src,
              type: videoType
            }],
            html5: {
              vhs: {
                overrideNative: false
              },
              nativeVideoTracks: true,
              nativeAudioTracks: true,
              nativeTextTracks: true
            }
          });
          
          playerRef.current.ready(() => {
            if (!playerRef.current) return;
            
            // Set max-height constraint for tall videos
            const playerEl = playerRef.current.el();
            if (playerEl && playerEl instanceof HTMLElement) {
              playerEl.style.maxHeight = '600px';
              const tech = playerRef.current.tech();
              if (tech && tech.el()) {
                const techEl = tech.el();
                if (techEl && techEl instanceof HTMLElement) {
                  techEl.style.maxHeight = '600px';
                  techEl.style.objectFit = 'contain';
                }
              }
            }
            
            // Register player with video manager
            const playerControl = {
              pause: () => {
                if (playerRef.current && !playerRef.current.paused()) {
                  playerRef.current.pause();
                }
              },
              play: () => {
                const player = playerRef.current;
                if (player && player.paused()) {
                  const playPromise = player.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(() => {});
                  }
                }
              },
              isPlaying: () => {
                return playerRef.current ? !playerRef.current.paused() : false;
              }
            };
            playerIdRef.current = playerControl;
            videoManager.register(playerControl);

            // Listen for play events
            playerRef.current.on("play", () => {
              wasPlayingRef.current = true;
              videoManager.onPlay(playerControl);
            });

            // Track when video is paused
            playerRef.current.on("pause", () => {
              wasPlayingRef.current = false;
            });
          });

          if (playerRef.current) {
            playerRef.current.on("error", () => {
              const playerError = playerRef.current?.error();
              if (playerError) {
                // If video.js fails, fallback to native player
                if (playerError.code === 4) {
                  setUseNativePlayer(true);
                  if (playerRef.current) {
                    try {
                      playerRef.current.dispose();
                    } catch {
                      // Error disposing player
                    }
                    playerRef.current = null;
                  }
                } else {
                  setError("Failed to load video");
                }
              }
            });

            playerRef.current.on("loadstart", () => {});
          }
        } else if (playerRef.current && src && !useNativePlayer) {
          // Update source if player already exists
          const videoType = src.endsWith(".mp4") ? "video/mp4" : 
                          src.endsWith(".webm") ? "video/webm" :
                          src.endsWith(".ogg") ? "video/ogg" : "video/mp4";
          playerRef.current.src({
            src: src,
            type: videoType
          });
        }
      } catch {
        setUseNativePlayer(true);
      }
    };

    if (!useNativePlayer) {
      loadVideoJs();
    }

    return () => {
      // Unregister from video manager
      if (playerIdRef.current) {
        videoManager.unregister(playerIdRef.current);
        playerIdRef.current = null;
      }
      
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch {
          // Error disposing player
        }
        playerRef.current = null;
      }
    };
  }, [src, useNativePlayer]);

  if (!src) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        No video source
      </div>
    );
  }

  // Register/unregister native video player
  useEffect(() => {
    if (useNativePlayer && videoRef.current) {
      const video = videoRef.current;
      
      const playerControl = {
        pause: () => {
          if (video && !video.paused) {
            video.pause();
          }
        },
        play: () => {
          if (video && video.paused) {
            video.play().catch(() => {});
          }
        },
        isPlaying: () => {
          return video ? !video.paused : false;
        }
      };
      
      playerIdRef.current = playerControl;
      videoManager.register(playerControl);

      const handlePlay = () => {
        wasPlayingRef.current = true;
        videoManager.onPlay(playerControl);
      };

      const handlePause = () => {
        wasPlayingRef.current = false;
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        if (playerIdRef.current) {
          videoManager.unregister(playerIdRef.current);
          playerIdRef.current = null;
        }
      };
    }
  }, [useNativePlayer]);

  // Intersection Observer to pause/play based on viewport visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in viewport - resume if it was playing before
            if (wasPlayingRef.current && playerIdRef.current) {
              playerIdRef.current.play();
            }
          } else {
            // Video is out of viewport - pause if playing
            if (playerIdRef.current && playerIdRef.current.isPlaying()) {
              wasPlayingRef.current = true;
              playerIdRef.current.pause();
            } else {
              wasPlayingRef.current = false;
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of video is visible
        rootMargin: "0px",
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [useNativePlayer]);

  // Fallback to native HTML5 video player
  if (useNativePlayer) {
    return (
      <div ref={containerRef} className="w-full max-h-[600px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg"
          onError={(e) => {
            const video = e.currentTarget;
            const error = video.error;
            if (error) {
              setError("Failed to load video. Please check the video URL.");
            }
          }}
          onLoadStart={() => {
            setError(null);
          }}
          onLoadedData={() => {
            setError(null);
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {error && (
          <div className="mt-2 text-sm text-red-500 text-center">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} data-vjs-player className="w-full">
      <video 
        ref={videoRef} 
        className="video-js vjs-big-play-centered"
        playsInline
        preload="metadata"
        style={{ maxHeight: '600px' }}
      >
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener noreferrer">
            supports HTML5 video
          </a>.
        </p>
      </video>
      {error && (
        <div className="mt-2 text-sm text-red-500 text-center">{error}</div>
      )}
    </div>
  );
}

interface FoodPostProps {
  post: Post;
  token: string;
  onPostDeleted?: (postId: number) => void;
}

export function FoodPost({ post, token, onPostDeleted }: FoodPostProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.is_liked_by_me);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [timeAgoText, setTimeAgoText] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageVisible, setImageVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editImages, setEditImages] = useState<{ id?: number; url: string; thumbnail?: string }[]>([]);
  const [editVideos, setEditVideos] = useState<{ id?: number; url: string; thumbnail?: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [reportReason, setReportReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isLoadingShareLinks, setIsLoadingShareLinks] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [shareLinks, setShareLinks] = useState<{
    facebook: string;
    whatsapp: string;
    twitter: string;
    linkedin: string;
    copy_link: string;
  } | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const imageFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareModalRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  // Get user referral code from cookies
  useEffect(() => {
    const fetchUserReferralCode = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        setUserReferralCode(data.referral_code || null);
      } catch (error) {
        console.error("Error fetching user referral code:", error);
      }
    };
    fetchUserReferralCode();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
      if (reportModalRef.current && !reportModalRef.current.contains(event.target as Node)) {
        setShowReportModal(false);
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
        setShowEditModal(false);
      }
    };

    if (showMenu || showShareModal || showReportModal || showEditModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showShareModal, showReportModal, showEditModal]);

  const handleLike = async () => {
    if (!post.alias) {
      toast.error("Cannot like post: Post alias not found");
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

  const handleDelete = async () => {
    if (!post.alias) {
      toast.error("Cannot delete post: Post alias not found");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deletePost(post.alias, token);
      console.log("[FoodPost] Delete response:", response);
      if (response.success) {
        toast.success(response.data?.message || response.message || "Post deleted successfully");
        setShowDeleteConfirm(false);
        setShowMenu(false);
        // Call the callback to remove post from list
        if (onPostDeleted) {
          console.log("[FoodPost] Calling onPostDeleted with post.id:", post.id);
          onPostDeleted(post.id);
        } else {
          console.warn("[FoodPost] onPostDeleted callback not provided");
        }
      } else {
        toast.error(response.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!post.alias) {
      toast.error("Cannot share post: Post alias not found");
      return;
    }

    setIsLoadingShareLinks(true);
    setShowShareModal(true);
    
    try {
      const response = await getShareLinks(post.alias, token);
      if (response.success && response.data?.share_links) {
        setShareLinks(response.data.share_links);
      } else {
        toast.error(response.message || "Failed to get share links");
        setShowShareModal(false);
      }
    } catch (error) {
      console.error("Error fetching share links:", error);
      toast.error("An error occurred while fetching share links");
      setShowShareModal(false);
    } finally {
      setIsLoadingShareLinks(false);
    }
  };

  const handleSharePlatform = (platform: 'facebook' | 'whatsapp' | 'twitter' | 'linkedin') => {
    if (!shareLinks) return;
    
    const url = shareLinks[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = async () => {
    if (!shareLinks?.copy_link) return;
    
    try {
      await navigator.clipboard.writeText(shareLinks.copy_link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleSave = async () => {
    if (!post.alias) {
      toast.error("Cannot save post: Post alias not found");
      return;
    }

    if (isSaving) {
      return; // Prevent multiple simultaneous requests
    }

    setIsSaving(true);
    
    // Optimistic update
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const response = await toggleSave(post.alias, token);
      
      if (response.success && response.data) {
        // Update with actual API response
        setIsSaved(response.data.saved);
        toast.success(response.message || (response.data.saved ? "Post saved successfully" : "Post unsaved successfully"));
      } else {
        // Revert optimistic update on error
        setIsSaved(previousSaved);
        toast.error(response.message || "Failed to toggle save");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(previousSaved);
      console.error("Error toggling save:", error);
      toast.error("An error occurred while toggling save");
    } finally {
      setIsSaving(false);
      setShowMenu(false);
    }
  };

  const handleHide = async () => {
    if (!post.alias) {
      toast.error("Cannot hide post: Post alias not found");
      return;
    }

    if (!token) {
      toast.error("Please login to hide posts");
      return;
    }

    if (isHiding) {
      return; // Prevent multiple simultaneous requests
    }

    setIsHiding(true);
    
    // Optimistic update
    const previousHidden = isHidden;
    setIsHidden(!isHidden);

    try {
      const response = await toggleHidePost(post.alias, token);
      
      if (response.success && response.data) {
        // Update with actual API response
        setIsHidden(response.data.hidden);
        toast.success(response.message || (response.data.hidden ? "Post hidden successfully" : "Post unhidden successfully"));
      } else {
        // Revert optimistic update on error
        setIsHidden(previousHidden);
        toast.error(response.message || "Failed to toggle hide");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsHidden(previousHidden);
      console.error("Error toggling hide:", error);
      toast.error("An error occurred while toggling hide");
    } finally {
      setIsHiding(false);
      setShowMenu(false);
    }
  };

  const handleReport = async () => {
    if (!post.alias) {
      toast.error("Cannot report post: Post alias not found");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    if (isReporting) {
      return; // Prevent multiple simultaneous requests
    }

    setIsReporting(true);

    try {
      const response = await reportPost(post.alias, reportReason.trim(), token);
      
      if (response.success) {
        toast.success(response.message || "Post reported successfully");
        setShowReportModal(false);
        setReportReason("");
        setShowMenu(false);
      } else {
        toast.error(response.message || "Failed to report post");
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("An error occurred while reporting the post");
    } finally {
      setIsReporting(false);
    }
  };

  const handleEdit = () => {
    if (!post.alias) {
      toast.error("Cannot edit post: Post alias not found");
      return;
    }
    setEditContent(post.content || "");
    setEditImages(post.images || []);
    setEditVideos(post.videos || []);
    setNewImages([]);
    setNewVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImageFiles: File[] = [];
    const newVideoFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newImageFiles.push(file);
      } else if (file.type.startsWith("video/")) {
        newVideoFiles.push(file);
      }
    });

    // Replace existing images/videos with new ones
    if (newImageFiles.length > 0) {
      // Clear existing images when new images are selected
      setEditImages([]);
      setImagePreviews([]); // Clear old previews first
      setNewImages(newImageFiles);
      // Create previews for new images
      newImageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${newImageFiles.length} image(s) selected - will replace existing images`);
    }
    
    if (newVideoFiles.length > 0) {
      // Clear existing videos when new videos are selected
      setEditVideos([]);
      setVideoPreviews([]); // Clear old previews first
      setNewVideos(newVideoFiles);
      // Create previews for new videos
      newVideoFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${newVideoFiles.length} video(s) selected - will replace existing videos`);
    }
    
    // Reset file input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleRemoveExistingVideo = (index: number) => {
    setEditVideos((prev) => prev.filter((_, i) => i !== index));
    toast.success("Video removed");
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleRemoveNewVideo = (index: number) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Video removed");
  };

  const handleUpdatePost = async () => {
    if (!post.alias) {
      toast.error("Cannot update post: Post alias not found");
      return;
    }

    if (isEditing) {
      return; // Prevent multiple simultaneous requests
    }

    setIsEditing(true);

    try {
      const response = await createOrUpdatePost(
        {
          content: editContent.trim() || undefined,
          privacy_alias: post.privacy_alias,
          post_alias: post.alias,
          images: newImages.length > 0 ? newImages : undefined,
          videos: newVideos.length > 0 ? newVideos : undefined,
        },
        token
      );

      if (response.success && response.data) {
        toast.success(response.message || "Post updated successfully");
        setShowEditModal(false);
        setEditContent("");
        setEditImages([]);
        setEditVideos([]);
        setNewImages([]);
        setNewVideos([]);
        setImagePreviews([]);
        setVideoPreviews([]);
        // Reload the page to show updated content
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post");
    } finally {
      setIsEditing(false);
    }
  };

  const canDelete = userReferralCode && post.user_referral_code && userReferralCode === post.user_referral_code && post.alias;
  const isMyPost = userReferralCode && post.user_referral_code && userReferralCode === post.user_referral_code;

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return "U"; // Default to "U" for User
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate timeAgo on client side only to avoid hydration issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeAgoText(timeAgo(post.created_at));
    }
  }, [post.created_at]);

  // Set loading states with 1 second delay, then fade in
  useEffect(() => {
    const hasImages = post.images && post.images.length > 0;
    
    if (hasImages) {
      setImageLoading(true);
      setImageVisible(false);
      // Clear any existing fade timer
      if (imageFadeTimerRef.current) {
        clearTimeout(imageFadeTimerRef.current);
        imageFadeTimerRef.current = null;
      }
      
      const timer = setTimeout(() => {
        setImageLoading(false);
        // Start fade-in after loader is hidden
        imageFadeTimerRef.current = setTimeout(() => {
          setImageVisible(true);
        }, 50); // Small delay to ensure DOM update
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (imageFadeTimerRef.current) {
          clearTimeout(imageFadeTimerRef.current);
          imageFadeTimerRef.current = null;
        }
      };
    } else {
      setImageLoading(false);
      setImageVisible(false);
    }
  }, [post.images]);

  useEffect(() => {
    const hasVideos = post.videos && post.videos.length > 0;
    
    if (hasVideos) {
      setVideoLoading(true);
      setVideoVisible(false);
      // Clear any existing fade timer
      if (videoFadeTimerRef.current) {
        clearTimeout(videoFadeTimerRef.current);
        videoFadeTimerRef.current = null;
      }
      
      const timer = setTimeout(() => {
        setVideoLoading(false);
        // Start fade-in after loader is hidden
        videoFadeTimerRef.current = setTimeout(() => {
          setVideoVisible(true);
        }, 50); // Small delay to ensure DOM update
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (videoFadeTimerRef.current) {
          clearTimeout(videoFadeTimerRef.current);
          videoFadeTimerRef.current = null;
        }
      };
    } else {
      setVideoLoading(false);
      setVideoVisible(false);
    }
  }, [post.videos]);

  const hasContent = post.content && post.content.trim().length > 0;
  const hasImages = post.images && post.images.length > 0;
  const hasVideos = post.videos && post.videos.length > 0;
  const displayImage = hasImages ? post.images[0] : null;
  const displayVideo = hasVideos ? post.videos[0] : null;
  const hasBothMedia = displayImage && displayVideo;
  const totalSlides = hasBothMedia ? 2 : (displayImage || displayVideo ? 1 : 0);

  // Swipe state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!mouseStart || !mouseEnd) return;
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    setMouseStart(null);
    setMouseEnd(null);
  };

  return (
    <div className="max-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://placehold.co/48x48/8b5cf6/ffffff?text=${getInitials(post.user_name)}`}
            alt={post.user_name || "User"}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.user_name || "User"}</span>
              <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-full border border-orange-200">
                {post.privacy.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{post.user_referral_code}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              {post.user_location && (
                <span className="flex flex-row gap-1 items-center justify-center">
                  <MapPin className="w-[12px] h-[12px]" /> {post.user_location}
                </span>
              )}
              <span className="flex flex-row gap-1 items-center justify-center">
                <Clock className="w-[12px] h-[12px]" /> {timeAgoText || "..."}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0 sm:gap-2">
          <button className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition">
            <UserPlus className="w-4 h-4" />
            Follow
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0 transition-transform" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {token && (
                  <button
                    onClick={handleHide}
                    disabled={isHiding}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isHidden ? (
                      <>
                        <Eye className="w-4 h-4" />
                        {isHiding ? "Unhiding..." : "Unhide"}
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        {isHiding ? "Hiding..." : "Hide"}
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
                </button>
                {!isMyPost && (
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                )}
                {isMyPost && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {hasContent && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 text-sm leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {/* MEDIA - Swipeable if both image and video exist */}
      {((displayImage && displayImage.url) || (displayVideo && displayVideo.url)) && (
        <div className="w-full px-4 pb-3">
          <div
            className="relative overflow-hidden rounded-lg"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : hasBothMedia ? 'grab' : 'default' }}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {/* Image Slide */}
              {displayImage && displayImage.url && (
                <div className="w-full flex-shrink-0 relative">
                  {imageLoading && (
                    <div className="w-full h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="animate-spin h-12 w-12 text-orange-500"
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
                      </div>
                    </div>
                  )}
                  {!imageLoading && (
                    <div className="w-full max-h-[600px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={displayImage.url}
                        alt="Post image"
                        className={`max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg transition-opacity duration-[6000ms] ${
                          imageVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const placeholder = document.createElement("div");
                          placeholder.className = "w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500";
                          placeholder.textContent = "Failed to load image";
                          target.parentElement?.appendChild(placeholder);
                        }}
                        onLoad={() => {}}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Video Slide */}
              {displayVideo && displayVideo.url && (
                <div className="w-full flex-shrink-0 relative">
                  {videoLoading && (
                    <div className="w-full h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="animate-spin h-12 w-12 text-orange-500"
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
                      </div>
                    </div>
                  )}
                  {!videoLoading && (
                    <div className={`w-full transition-opacity duration-[6000ms] ${
                      videoVisible ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <VideoJsPlayer src={displayVideo.url} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Slide Indicators */}
            {hasBothMedia && totalSlides > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === index
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="text-blue-500">👍</span>
            {likeCount}
          </span>
          <span>👁 {post.view_count}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{post.share_count} Shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around px-4 py-2 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            liked ? "text-red-500" : "text-gray-600"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          <span className="font-medium">{isLiking ? "Like" : "Like"}</span>
        </button>
        <button 
          onClick={() => {
            if (post.alias) {
              router.push(`/post/${post.alias}`);
            } else {
              toast.error("Cannot open post: Post alias not found");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                disabled={isDeleting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
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
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div ref={shareModalRef} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                disabled={isLoadingShareLinks}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {isLoadingShareLinks ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-orange-500"
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
              </div>
            ) : shareLinks ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleSharePlatform('facebook')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium">Share on Facebook</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="font-medium">Share on WhatsApp</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="font-medium">Share on Twitter</span>
                </button>

                <button
                  onClick={() => handleSharePlatform('linkedin')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-medium">Share on LinkedIn</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Copy Link</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load share links
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div ref={reportModalRef} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                disabled={isReporting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide a reason for reporting this post..."
                  rows={4}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none"
                  disabled={isReporting}
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  disabled={isReporting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={isReporting || !reportReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isReporting ? (
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
                      Reporting...
                    </>
                  ) : (
                    "Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div ref={editModalRef} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditContent("");
                  setEditImages([]);
                  setEditVideos([]);
                  setNewImages([]);
                  setNewVideos([]);
                  setImagePreviews([]);
                  setVideoPreviews([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                disabled={isEditing}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition resize-none"
                  disabled={isEditing}
                />
              </div>

              {/* Existing Images */}
              {editImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Images ({editImages.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                          }}
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(index)}
                          disabled={isEditing}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Videos */}
              {editVideos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Videos ({editVideos.length})
                  </label>
                  <div className="space-y-3">
                    {editVideos.map((video, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={video.url}
                          controls
                          className="w-full h-auto max-h-64 rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                          }}
                        />
                        <button
                          onClick={() => handleRemoveExistingVideo(index)}
                          disabled={isEditing}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Images/Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Images or Videos
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
                  <div className="flex justify-center gap-3 mb-3">
                    <ImageIcon className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8" />
                    <Video className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8" />
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleEditFileSelect}
                    className="hidden"
                    disabled={isEditing}
                  />
                  <button
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isEditing}
                    className="px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Select from computer
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Supports multiple images and videos
                  </p>
                </div>
              </div>

              {/* New Images Preview */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Images ({imagePreviews.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`New image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveNewImage(index)}
                          disabled={isEditing}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Videos Preview */}
              {videoPreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Videos ({videoPreviews.length})
                  </label>
                  <div className="space-y-3">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={preview}
                          controls
                          className="w-full h-auto max-h-64 rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveNewVideo(index)}
                          disabled={isEditing}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditContent("");
                    setEditImages([]);
                    setEditVideos([]);
                    setNewImages([]);
                    setNewVideos([]);
                    setImagePreviews([]);
                    setVideoPreviews([]);
                  }}
                  disabled={isEditing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={isEditing}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEditing ? (
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
                      Updating...
                    </>
                  ) : (
                    "Update Post"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
