"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, MapPin, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getPrivacyOptions, createOrUpdatePost } from "@/lib/api/post";
import type { PrivacyOption, Post, PostResponse } from "@/types/post";
import type { ApiResponse } from "@/types/auth";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onPostCreated?: (post: Post) => void;
  initialContent?: string;
  initialLocation?: string;
  initialImages?: File[];
  initialVideos?: File[];
  imageOnly?: boolean;
  videoOnly?: boolean;
  initialPrivacy?: string;
}

type Step = "select" | "review" | "post";

export function UploadModal({ isOpen, onClose, token, onPostCreated, initialContent = "", initialLocation = "", initialImages = [], initialVideos = [], imageOnly = false, videoOnly = false, initialPrivacy = "" }: UploadModalProps) {
  console.log("[UploadModal] Component rendered, isOpen:", isOpen, "token exists:", !!token);
  
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedImage, setSelectedImage] = useState<File | null>(initialImages[0] || null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(initialVideos[0] || null);
  const [content, setContent] = useState<string>(initialContent);
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([]);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("");
  const [location, setLocation] = useState<string>(initialLocation);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [hasTriedAutoLocation, setHasTriedAutoLocation] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isManualLocationRequest, setIsManualLocationRequest] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch privacy options when modal opens
  useEffect(() => {
    console.log("[UploadModal] useEffect - isOpen:", isOpen, "privacyOptions.length:", privacyOptions.length);
    if (isOpen && privacyOptions.length === 0) {
      console.log("[UploadModal] Modal opened, fetching privacy options...");
      fetchPrivacyOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update content and location when initial values change
  useEffect(() => {
    if (isOpen && initialContent) {
      setContent(initialContent);
      // Skip to review step if content is provided
      setCurrentStep("review");
    }
    if (isOpen && initialLocation) {
      setLocation(initialLocation);
      setShowLocationInput(true);
    }
    if (isOpen && initialImages.length > 0) {
      setSelectedImage(initialImages[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(initialImages[0]);
    }
    if (isOpen && initialVideos.length > 0) {
      setSelectedVideo(initialVideos[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(initialVideos[0]);
    }
    if (isOpen && initialPrivacy) {
      setSelectedPrivacy(initialPrivacy);
    }
  }, [isOpen, initialContent, initialLocation, initialImages, initialVideos, initialPrivacy]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("[UploadModal] Modal closed, resetting state...");
      setCurrentStep("select");
      setSelectedImage(null);
      setSelectedVideo(null);
      setContent("");
      setLocation("");
      setShowLocationInput(false);
      setImagePreview(null);
      setVideoPreview(null);
      setSelectedPrivacy("");
      setUploadProgress(0);
      setIsUploading(false);
      setSelectedFile(null);
      setFileType(null);
      setHasTriedAutoLocation(false);
      setIsFetchingLocation(false);
      setIsManualLocationRequest(false);
      console.log("[UploadModal] State reset complete");
    }
  }, [isOpen]);

  // Automatically fetch location when entering review step
  useEffect(() => {
    if (currentStep === "review" && !showLocationInput) {
      console.log("[UploadModal] Review step entered, showing location input");
      setShowLocationInput(true);
      // If initial location is provided, use it
      if (initialLocation) {
        setLocation(initialLocation);
        setHasTriedAutoLocation(true);
      } else if (!hasTriedAutoLocation && !location) {
        // Automatically fetch location when reaching review step
        console.log("[UploadModal] Auto-fetching location on review step");
        setIsManualLocationRequest(false); // This is an auto-fetch
        
        // Inline location fetch logic for auto-fetch
        setIsFetchingLocation(true);
        setHasTriedAutoLocation(true);
        
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
                setIsFetchingLocation(false);
                toast.success("Location fetched successfully");
              } catch (error) {
                const locationName = `${latitude}, ${longitude}`;
                setLocation(locationName);
                setIsFetchingLocation(false);
                toast.success("Location fetched (coordinates only)");
              }
            },
            (error) => {
              console.error("[UploadModal] Auto-fetch geolocation error:", error);
              setIsFetchingLocation(false);
              // Silently fail on auto-fetch, let user enter manually
            },
            options
          );
        } else {
          setIsFetchingLocation(false);
        }
      }
    }
  }, [currentStep, showLocationInput, initialLocation, hasTriedAutoLocation, location]);

  const fetchPrivacyOptions = async () => {
    console.log("[UploadModal] fetchPrivacyOptions - Starting...");
    try {
      console.log("[UploadModal] Calling getPrivacyOptions API with token:", token.substring(0, 20) + "...");
      const response = await getPrivacyOptions(token);
      console.log("[UploadModal] Privacy options API response:", response);
      if (response.success && response.data) {
        console.log("[UploadModal] Privacy options loaded successfully:", response.data);
        setPrivacyOptions(response.data);
        // Set default privacy to "public" if available and no initialPrivacy is provided
        if (!initialPrivacy) {
          const publicOption = response.data.find((opt) => opt.alias === "public");
          if (publicOption) {
            console.log("[UploadModal] Setting default privacy to:", publicOption.alias);
            setSelectedPrivacy(publicOption.alias);
          } else {
            console.warn("[UploadModal] No 'public' privacy option found");
          }
        } else {
          // Use initialPrivacy if provided
          setSelectedPrivacy(initialPrivacy);
        }
      } else {
        console.error("[UploadModal] Failed to load privacy options:", response.message);
        toast.error(response.message || "Failed to load privacy options");
      }
    } catch (error) {
      console.error("[UploadModal] Error fetching privacy options:", error);
      toast.error("Failed to load privacy options");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[UploadModal] handleFileSelect - File input changed");
    const file = e.target.files?.[0];
    if (file) {
      console.log("[UploadModal] File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      });
      
      if (file.type.startsWith("image/")) {
        if (videoOnly) {
          console.warn("[UploadModal] Image file rejected in video-only mode");
          toast.error("Only video files are allowed");
          return;
        }
        setSelectedFile(file);
        setFileType("image");
        setSelectedImage(file);
        setSelectedVideo(null);
        console.log("[UploadModal] Image file accepted, creating preview...");
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("[UploadModal] Image preview created successfully");
          setImagePreview(reader.result as string);
          setVideoPreview(null);
        };
        reader.onerror = (error) => {
          console.error("[UploadModal] Error reading image file:", error);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        if (imageOnly) {
          console.warn("[UploadModal] Video file rejected in image-only mode");
          toast.error("Only image files are allowed");
          return;
        }
        setSelectedFile(file);
        setFileType("video");
        setSelectedVideo(file);
        setSelectedImage(null);
        console.log("[UploadModal] Video file accepted, creating preview...");
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("[UploadModal] Video preview created successfully");
          setVideoPreview(reader.result as string);
          setImagePreview(null);
        };
        reader.onerror = (error) => {
          console.error("[UploadModal] Error reading video file:", error);
        };
        reader.readAsDataURL(file);
      } else {
        console.warn("[UploadModal] Invalid file type selected:", file.type);
        if (imageOnly) {
          toast.error("Please select a valid image file");
        } else if (videoOnly) {
          toast.error("Please select a valid video file");
        } else {
          toast.error("Please select a valid image or video file");
        }
      }
    } else {
      console.log("[UploadModal] No file selected");
    }
  };

  const handleRemoveLocation = () => {
    console.log("[UploadModal] Removing location");
    setLocation("");
    setShowLocationInput(false);
    toast.success("Location removed");
  };

  const handleGetLocation = (isManual: boolean = true) => {
    console.log("[UploadModal] handleGetLocation - Requesting location (manual:", isManual, ")...");
    setIsFetchingLocation(true);
    setHasTriedAutoLocation(true);
    setIsManualLocationRequest(isManual);
    
    if (navigator.geolocation) {
      console.log("[UploadModal] Geolocation API available, requesting position...");
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds timeout
        maximumAge: 0 // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("[UploadModal] Position retrieved:", { latitude, longitude });
          try {
            // Using reverse geocoding to get location name
            // You might want to use a geocoding service like Google Maps API or OpenStreetMap
            console.log("[UploadModal] Fetching location name from geocoding service...");
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            console.log("[UploadModal] Geocoding response:", data);
            const locationName =
              data.display_name || `${latitude}, ${longitude}`;
            console.log("[UploadModal] Location name resolved:", locationName);
            setLocation(locationName);
            setShowLocationInput(true);
            setIsFetchingLocation(false);
            toast.success("Location fetched successfully");
          } catch (error) {
            console.warn("[UploadModal] Geocoding failed, using coordinates:", error);
            const locationName = `${latitude}, ${longitude}`;
            setLocation(locationName);
            setShowLocationInput(true);
            setIsFetchingLocation(false);
            toast.success("Location fetched (coordinates only)");
          }
        },
        (error) => {
          console.error("[UploadModal] Geolocation error:", error);
          setIsFetchingLocation(false);
          
          let errorMessage = "Failed to get location. You can enter it manually.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Please enter location manually.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again or enter location manually.";
              break;
            default:
              errorMessage = "An unknown error occurred. Please enter location manually.";
              break;
          }
          
          // Only show error toast if user manually triggered it, not on auto-fetch
          // For auto-fetch, silently fail and let user enter manually
          if (isManualLocationRequest) {
            toast.error(errorMessage);
          }
          setShowLocationInput(true);
        },
        options
      );
    } else {
      console.warn("[UploadModal] Geolocation not supported by browser");
      setIsFetchingLocation(false);
      setShowLocationInput(true);
      // Only show error if user manually triggered it
      if (isManualLocationRequest) {
        toast.error("Geolocation is not supported by your browser");
      }
    }
  };

  const handleNext = () => {
    console.log("[UploadModal] handleNext - Current step:", currentStep);
    if (currentStep === "select") {
      // Validate that content is required (mandatory)
      console.log("[UploadModal] Validating selection:", {
        hasImage: !!selectedImage,
        hasVideo: !!selectedVideo,
        hasContent: !!content.trim(),
        contentLength: content.trim().length
      });
      
      // Content is mandatory - user must add at least 140 characters
      const contentLength = content.trim().length;
      if (!content || !content.trim()) {
        console.warn("[UploadModal] Validation failed: Content is required");
        toast.error("Please add a caption to your post");
        return;
      }
      if (contentLength < 140) {
        console.warn("[UploadModal] Validation failed: Content must be at least 140 characters");
        toast.error(`Caption must be at least 140 characters (currently ${contentLength})`);
        return;
      }
      
      console.log("[UploadModal] Validation passed, moving to review step");
      setCurrentStep("review");
    } else if (currentStep === "review") {
      console.log("[UploadModal] Review step - Selected privacy:", selectedPrivacy);
      if (!selectedPrivacy) {
        console.warn("[UploadModal] Validation failed: No privacy selected");
        toast.error("Please select a privacy option");
        return;
      }
      // Location is now optional - removed validation
      console.log("[UploadModal] Moving to post step");
      setCurrentStep("post");
    }
  };

  // Helper function to generate post_alias from content or create a random one
  const generatePostAlias = (contentText: string | undefined): string => {
    if (contentText && contentText.trim()) {
      // Generate slug from content
      const slug = contentText
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 50); // Limit length
      
      // Add random string to ensure uniqueness
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `${slug}-${randomStr}`;
    }
    // Generate random alias if no content
    return `post-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const handleSubmit = async () => {
    console.log("[UploadModal] handleSubmit - Starting post submission...");
    
    // Content is mandatory - must be at least 140 characters
    const contentLength = content.trim().length;
    if (!content || !content.trim()) {
      console.warn("[UploadModal] Validation failed: Content is required");
      toast.error("Please add a caption to your post");
      return;
    }
    if (contentLength < 140) {
      console.warn("[UploadModal] Validation failed: Content must be at least 140 characters");
      toast.error(`Caption must be at least 140 characters (currently ${contentLength})`);
      return;
    }
    
    if (!selectedPrivacy) {
      console.warn("[UploadModal] Validation failed: No privacy selected");
      toast.error("Please select a privacy option");
      return;
    }
    // Location is now optional - removed validation

    // Don't generate post_alias for new posts - let backend handle it
    // post_alias should only be sent when updating an existing post
    const postData = {
      content: content.trim() || undefined,
      images: selectedImage ? [selectedImage] : undefined,
      videos: selectedVideo ? [selectedVideo] : undefined,
      privacy_alias: selectedPrivacy,
      location: location?.trim() || undefined,
      // post_alias: only include when updating, not for new posts
    };

    console.log("========================================");
    console.log("[UploadModal] ===== POST CREATION START =====");
    console.log("========================================");
    console.log("[UploadModal] Post data prepared:", {
      hasContent: !!postData.content,
      content: postData.content,
      hasImages: !!postData.images,
      hasVideos: !!postData.videos,
      privacy_alias: postData.privacy_alias,
      hasLocation: !!postData.location,
      location: postData.location,
      imageCount: postData.images?.length || 0,
      videoCount: postData.videos?.length || 0,
      imageNames: postData.images?.map(img => img.name) || [],
      videoNames: postData.videos?.map(vid => vid.name) || [],
      imageSizes: postData.images?.map(img => `${(img.size / (1024 * 1024)).toFixed(2)} MB`) || [],
      videoSizes: postData.videos?.map(vid => `${(vid.size / (1024 * 1024)).toFixed(2)} MB`) || []
    });
    console.log("[UploadModal] Full postData object:", JSON.stringify({
      ...postData,
      images: postData.images?.map(img => ({ name: img.name, size: img.size, type: img.type })) || undefined,
      videos: postData.videos?.map(vid => ({ name: vid.name, size: vid.size, type: vid.type })) || undefined
    }, null, 2));

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log("[UploadModal] Calling createOrUpdatePost API function...");
      const apiResponse = await createOrUpdatePost(postData, token);
      
      console.log("[UploadModal] API response received:");
      console.log("[UploadModal] Response success:", apiResponse.success);
      console.log("[UploadModal] Response message:", apiResponse.message);
      console.log("[UploadModal] Has response data:", !!apiResponse.data);
      console.log("[UploadModal] Full API response:", JSON.stringify(apiResponse, null, 2));

      // Check if the API call was successful
      // The response should have success: true and data with the post information
      if (apiResponse.success && apiResponse.data) {
        console.log("========================================");
        console.log("[UploadModal] ===== POST CREATED SUCCESSFULLY =====");
        console.log("========================================");
        console.log("[UploadModal] Post ID:", apiResponse.data.id);
        console.log("[UploadModal] User referral code:", apiResponse.data.user_referral_code);
        console.log("[UploadModal] Privacy:", apiResponse.data.privacy);
        console.log("[UploadModal] Content:", apiResponse.data.content);
        console.log("[UploadModal] Location (from response):", apiResponse.data.location);
        console.log("[UploadModal] Location (original):", location);
        console.log("[UploadModal] Likes count:", apiResponse.data.likes_count);
        console.log("[UploadModal] View count:", apiResponse.data.view_count);
        console.log("[UploadModal] Share count:", apiResponse.data.share_count);
        console.log("[UploadModal] Created at:", apiResponse.data.created_at);
        console.log("[UploadModal] Updated at:", apiResponse.data.updated_at);
        console.log("[UploadModal] Images count:", apiResponse.data.images?.length || 0);
        console.log("[UploadModal] Videos count:", apiResponse.data.videos?.length || 0);
        console.log("[UploadModal] Full response data:", JSON.stringify(apiResponse.data, null, 2));
        
        setIsUploading(false);
        setUploadProgress(100);
        
        // Show success message - ensure it's always displayed
        const successMessage = apiResponse.message || "Post created successfully!";
        console.log("[UploadModal] ===== SHOWING SUCCESS MESSAGE =====");
        console.log("[UploadModal] Success message text:", successMessage);
        toast.success(successMessage, {
          duration: 4000,
          position: 'top-center',
        });
        console.log("[UploadModal] Success toast displayed");
        
        // Convert PostResponse to Post format
        console.log("[UploadModal] Processing: Converting PostResponse to Post format...");
        // Note: user_name might not be in the response, so we'll fetch it or use a placeholder
        let userName = "";
        try {
          console.log("[UploadModal] Fetching user data for user_name...");
          const userDataResponse = await fetch("/api/cookies/get-user-data");
          const userData = await userDataResponse.json();
          console.log("[UploadModal] User data response:", userData);
          userName = userData.email?.split("@")[0] || apiResponse.data.user_referral_code || "User";
          console.log("[UploadModal] ✓ User name resolved:", userName);
        } catch (error) {
          console.warn("[UploadModal] ⚠ Could not fetch user data, using fallback");
          console.warn("[UploadModal] Error:", error);
          userName = apiResponse.data.user_referral_code || "User";
          console.log("[UploadModal] Using fallback user name:", userName);
        }

        // Helper function to get first two words from location
        const getFirstTwoWords = (loc: string | null | undefined): string | null => {
          if (!loc || typeof loc !== "string" || loc.trim().length === 0) {
            return null;
          }
          const words = loc.trim().split(/\s+/);
          return words.slice(0, 2).join(" ") || null;
        };

        console.log("[UploadModal] Processing location for display...");
        const displayLocation = getFirstTwoWords(apiResponse.data.location || location);
        console.log("[UploadModal] Display location (first two words):", displayLocation);

        const newPost: Post = {
          id: apiResponse.data.id,
          alias: apiResponse.data.alias,
          user_referral_code: apiResponse.data.user_referral_code,
          user_name: userName,
          user_location: displayLocation || null,
          privacy_alias: apiResponse.data.privacy_alias,
          privacy: apiResponse.data.privacy,
          content: apiResponse.data.content,
          likes_count: apiResponse.data.likes_count,
          is_liked_by_me: apiResponse.data.is_liked_by_me,
          view_count: apiResponse.data.view_count,
          share_count: apiResponse.data.share_count,
          created_at: apiResponse.data.created_at,
          updated_at: apiResponse.data.updated_at,
          images: apiResponse.data.images as Post["images"],
          videos: apiResponse.data.videos as Post["videos"],
        };

        console.log("[UploadModal] ✓ Post converted successfully");
        console.log("[UploadModal] Converted post object:", JSON.stringify(newPost, null, 2));
        console.log("[UploadModal] Post images:", newPost.images);
        console.log("[UploadModal] Post videos:", newPost.videos);

        // Call callback to add post to list
        console.log("[UploadModal] Processing: Handling post creation callback...");
        if (onPostCreated) {
          console.log("[UploadModal] ✓ onPostCreated callback available, calling it...");
          onPostCreated(newPost);
          console.log("[UploadModal] ✓ Callback executed");
        } else {
          console.log("[UploadModal] ⚠ No callback provided, will reload page...");
          window.location.reload();
        }

        console.log("[UploadModal] Closing modal...");
        onClose();
        console.log("========================================");
        console.log("[UploadModal] ===== POST CREATION COMPLETE =====");
        console.log("========================================");
      } else {
        console.log("========================================");
        console.log("[UploadModal] ===== POST CREATION FAILED =====");
        console.log("========================================");
        console.log("[UploadModal] Response success:", apiResponse.success);
        console.log("[UploadModal] Error message:", apiResponse.message);
        console.log("[UploadModal] Full error response:", JSON.stringify(apiResponse, null, 2));
        console.log("========================================");
        setIsUploading(false);
        toast.error(apiResponse.message || "Failed to create post");
      }
    } catch (error) {
      console.log("========================================");
      console.log("[UploadModal] ===== EXCEPTION OCCURRED =====");
      console.log("========================================");
      console.log("[UploadModal] Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.log("[UploadModal] Error message:", error instanceof Error ? error.message : String(error));
      console.log("[UploadModal] Full error object:", error);
      // Error is already handled by createOrUpdatePost function
      console.error("[UploadModal] Error details:", error);
      console.log("========================================");
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("An error occurred while creating the post");
    } finally {
      setIsSubmitting(false);
      console.log("[UploadModal] Submission process completed (finally block)");
      console.log("[UploadModal] Final state - isSubmitting:", false, "isUploading:", false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 h-[100dvh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log("[UploadModal] Backdrop clicked, closing modal");
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header - Modern Social Media Style */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {currentStep !== "select" && (
              <button
                onClick={() => {
                  console.log("[UploadModal] Back button clicked, current step:", currentStep);
                  if (currentStep === "review") {
                    console.log("[UploadModal] Going back to select step");
                    setCurrentStep("select");
                  } else if (currentStep === "post") {
                    console.log("[UploadModal] Going back to review step");
                    setCurrentStep("review");
                  }
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
            )}
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {currentStep === "select"
                ? "Create new post"
                : currentStep === "review"
                ? "Create new post"
                : "Create new post"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === "select" && (
            <div className="p-3 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Unified File Upload - Modern Style */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
                  {!selectedFile ? (
                    <>
                      <div className="flex justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        {!videoOnly && (
                          <ImageIcon className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8 sm:w-12 sm:h-12" />
                        )}
                        {!imageOnly && (
                          <Video className="text-gray-400 group-hover:text-orange-500 transition w-8 h-8 sm:w-12 sm:h-12" />
                        )}
                      </div>
                      <p className="text-gray-700 mb-2 sm:mb-3 font-semibold text-base sm:text-lg">
                        {imageOnly ? "Upload Photo" : videoOnly ? "Upload Video" : "Upload Photo or Video"}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={imageOnly ? "image/*" : videoOnly ? "video/*" : "image/*,video/*"}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-orange-500 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition shadow-sm hover:shadow-md"
                      >
                        Select from computer
                      </button>
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                        {imageOnly ? "Supports image files only" : videoOnly ? "Supports video files only" : "Supports images and videos"}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        {fileType === "image" ? (
                          <ImageIcon className="text-orange-500" size={32} />
                        ) : (
                          <Video className="text-orange-500" size={32} />
                        )}
                        <div className="text-left">
                          <p className="text-gray-800 font-semibold">
                            {fileType === "image" ? "Image" : "Video"} Selected
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {fileType === "image" && imagePreview && (
                        <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl overflow-hidden bg-black max-h-48 sm:max-h-64">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}
                      
                      {fileType === "video" && videoPreview && (
                        <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl overflow-hidden bg-black max-h-48 sm:max-h-64">
                          <video
                            src={videoPreview}
                            controls
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm text-gray-700 font-medium">
                            <span>Uploading {fileType}...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Change file button */}
                      {!isUploading && (
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setFileType(null);
                            setSelectedImage(null);
                            setSelectedVideo(null);
                            setImagePreview(null);
                            setVideoPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="mt-2 px-5 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition font-medium"
                        >
                          Change {fileType}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Text Area - Modern Style */}
                <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:border-orange-300 transition">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-orange-500" size={18} />
                      <label className="block text-gray-800 text-sm sm:text-base font-semibold">
                        Add a caption <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${
                      content.trim().length < 140 
                        ? "text-red-500" 
                        : "text-gray-500"
                    }`}>
                      {content.trim().length}/140
                    </span>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => {
                      console.log("[UploadModal] Content changed, length:", e.target.value.length);
                      setContent(e.target.value);
                    }}
                    placeholder="Write something... (Minimum 140 characters required)"
                    required
                    className={`w-full p-3 sm:p-4 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none transition ${
                      !content || !content.trim() || content.trim().length < 140
                        ? "border-red-300 focus:border-red-500" 
                        : "border-gray-200 focus:border-orange-500"
                    }`}
                    rows={4}
                  />
                  {content.trim().length > 0 && content.trim().length < 140 && (
                    <p className="mt-2 text-xs sm:text-sm text-red-500">
                      Please add at least {140 - content.trim().length} more characters
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="flex flex-col">
              {/* Preview Section - Social Media Style */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="p-3 sm:p-6">
                  {/* User Info */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm sm:text-base font-semibold">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-gray-900">You</span>
                        {fileType && (
                          <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium capitalize">
                            {fileType}
                          </span>
                        )}
                      </div>
                      {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                          <MapPin size={10} />
                          <span className="truncate">{location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  {content && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</p>
                    </div>
                  )}

                  {/* Media Preview */}
                  {imagePreview && (
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-black">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] mx-auto object-contain"
                      />
                    </div>
                  )}

                  {videoPreview && (
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-black">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
                {/* Show selected file with option to change - only for images */}
                {selectedImage && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Photo
                    </label>
                    <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <ImageIcon className="text-orange-500" size={32} />
                        <div className="text-left">
                          <p className="text-gray-800 font-semibold">
                            Image Selected
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedFile?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {imagePreview && (
                        <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl overflow-hidden bg-black max-h-48 sm:max-h-64">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}
                      
                      {/* Change file button */}
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFileType(null);
                          setSelectedImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="mt-2 px-5 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition font-medium w-full"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                )}
                {/* Location */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="space-y-2">
                    {!showLocationInput && (
                      <button
                        onClick={() => handleGetLocation(true)}
                        disabled={isFetchingLocation}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-orange-400 hover:bg-orange-50 transition w-full text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MapPin size={16} className="text-orange-500" />
                        <span className="font-medium">
                          {isFetchingLocation ? "Fetching location..." : "Get Current Location"}
                        </span>
                      </button>
                    )}
                    {isFetchingLocation && showLocationInput && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        <span>Fetching location...</span>
                      </div>
                    )}
                    {showLocationInput && (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => {
                              console.log("[UploadModal] Location changed:", e.target.value);
                              setLocation(e.target.value);
                            }}
                            placeholder="Enter location (optional)"
                            className="w-full p-2.5 sm:p-3 pr-8 sm:pr-10 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition"
                          />
                          {location && location.trim() && (
                            <button
                              type="button"
                              onClick={handleRemoveLocation}
                              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors group"
                              aria-label="Remove location"
                            >
                              <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGetLocation(true)}
                          disabled={isFetchingLocation}
                          className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MapPin size={12} />
                          {isFetchingLocation ? "Fetching..." : "Update Location"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Privacy Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Privacy
                  </label>
                  <select
                    value={selectedPrivacy}
                    onChange={(e) => {
                      console.log("[UploadModal] Privacy changed to:", e.target.value);
                      setSelectedPrivacy(e.target.value);
                    }}
                    className="w-full p-2.5 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition bg-white"
                  >
                    <option value="">Select privacy</option>
                    {privacyOptions.map((option) => (
                      <option key={option.alias} value={option.alias}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === "post" && (
            <div className="p-4 sm:p-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-semibold">Ready to post?</h3>
                  {fileType && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                      {fileType === "image" ? (
                        <ImageIcon className="text-orange-500" size={16} />
                      ) : (
                        <Video className="text-orange-500" size={16} />
                      )}
                      <span className="text-sm font-medium text-orange-700 capitalize">
                        {fileType}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 sm:space-y-4 max-w-md mx-auto">
                  {imagePreview && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-40 sm:max-h-48 object-contain"
                      />
                    </div>
                  )}

                  {videoPreview && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-auto max-h-40 sm:max-h-48"
                      />
                    </div>
                  )}

                  {content && (
                    <div className="border rounded-lg p-3 sm:p-4 text-left">
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{content}</p>
                    </div>
                  )}

                  <div className="text-left space-y-2 text-sm sm:text-base">
                    <p className="text-gray-600">
                      <span className="font-medium">Privacy:</span>{" "}
                      {privacyOptions.find((opt) => opt.alias === selectedPrivacy)?.name}
                    </p>
                    {location && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">{location}</span>
                      </p>
                    )}
                  </div>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Uploading {fileType}...</span>
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
          )}
        </div>

        {/* Footer - Modern Social Media Style */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex justify-between items-center gap-2">
          <button
            onClick={() => {
              console.log("[UploadModal] Cancel button clicked");
              onClose();
            }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          {currentStep === "post" ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-orange-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
              ) : (
                "Share"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentStep === "select" && (!content || !content.trim() || content.trim().length < 140)}
              className={`px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition shadow-sm hover:shadow-md ${
                currentStep === "select" && (!content || !content.trim() || content.trim().length < 140)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

