"use client";

import React, { useState, useEffect, useRef } from "react";
import { Smile, MapPin, Image as ImageIcon, X, Video } from "lucide-react";
import toast from "react-hot-toast";
import { UploadModal } from "./uploadModal";
import type { Post } from "@/types/post";

interface PostFormProps {
  onPostCreated?: (post: Post) => void;
}

export function PostForm({ onPostCreated }: PostFormProps = {}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [location, setLocation] = useState<string>(""); // Full location for backend
  const [displayLocation, setDisplayLocation] = useState<string>(""); // First two words for display
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get token from cookies API
    const fetchToken = async () => {
      console.log("[PostForm] Fetching token from cookies API...");
      try {
        const response = await fetch("/api/cookies/get-user-data");
        console.log("[PostForm] Token API response status:", response.status);
        const data = await response.json();
        console.log("[PostForm] Token API response data:", data);
        if (data.token) {
          console.log("[PostForm] Token received, setting token");
          setToken(data.token);
        } else {
          console.warn("[PostForm] No token found in response");
        }
      } catch (error) {
        console.error("[PostForm] Failed to fetch token:", error);
      }
    };

    fetchToken();
  }, []);


  // Function to fetch location
  const fetchLocation = async () => {
    setIsFetchingLocation(true);
    try {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds timeout
          maximumAge: 0 // Don't use cached position
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
              // Store full location for backend
              setLocation(locationName);
              // Get first two words for display
              const words = locationName.split(" ").slice(0, 2).join(" ");
              setDisplayLocation(words);
              toast.success("Location fetched successfully");
            } catch (error) {
              console.error("[PostForm] Geocoding failed:", error);
              const locationName = `${latitude}, ${longitude}`;
              // Store full location for backend
              setLocation(locationName);
              // Get first two words for display
              const words = locationName.split(" ").slice(0, 2).join(" ");
              setDisplayLocation(words);
              toast.success("Location fetched (coordinates only)");
            } finally {
              setIsFetchingLocation(false);
            }
          },
          (error) => {
            console.error("[PostForm] Geolocation error:", error);
            setIsFetchingLocation(false);
            
            let errorMessage = "Failed to get location.";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location access in your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out. Please try again.";
                break;
              default:
                errorMessage = "An unknown error occurred while fetching location.";
                break;
            }
            toast.error(errorMessage);
          },
          options
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
        setIsFetchingLocation(false);
      }
    } catch (error) {
      console.error("[PostForm] Error fetching location:", error);
      setIsFetchingLocation(false);
      toast.error("An error occurred while fetching location");
    }
  };

  // Note: Removed automatic location fetching on content change
  // Mobile browsers require location requests to be triggered by direct user interaction
  // Location will only be fetched when user explicitly clicks the "Location" button

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Ensure input is focused when clicked (including clicking on placeholder)
    setIsInputFocused(true);
    // Focus the input if it's not already focused
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.focus();
    }
  };

  const handleInputMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    // Set focus state immediately on mousedown to show button right away
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    // Always hide button when input loses focus (regardless of content)
    setIsInputFocused(false);
  };

  const handleRemoveLocation = () => {
    console.log("[PostForm] Removing location");
    setLocation("");
    setDisplayLocation("");
    toast.success("Location removed");
  };

  const handleOpenModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: File[] = [];
    const newVideos: File[] = [];
    const newImagePreviews: string[] = [];
    const newVideoPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        newVideos.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    setSelectedImages((prev) => [...prev, ...newImages]);
    setSelectedVideos((prev) => [...prev, ...newVideos]);
    toast.success(`${newImages.length} image(s) and ${newVideos.length} video(s) selected`);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Video removed");
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    // Reset content and location after modal closes
    setContent("");
    setLocation("");
    setDisplayLocation("");
    // Reset files
    setSelectedImages([]);
    setSelectedVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    // Reset focus state
    setIsInputFocused(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show button when input is focused (clicked/active)
  const canShowButton = isInputFocused;

  return (
    <>
      <div className="w-full max-w-full mx-auto bg-brand-white rounded-xl sm:rounded-2xl flex flex-col gap-2 sm:gap-3 ring-1 ring-brand p-2.5 sm:p-5 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://placehold.co/48x48/78f432/fffff?text=U"
            alt="User avatar"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 relative min-w-0">
            <input
              ref={textInputRef}
              type="text"
              value={content}
              onChange={handleContentChange}
              onMouseDown={handleInputMouseDown}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="What's on your mind?"
              className={`w-full text-sm sm:text-base text-gray-700 bg-gray-100 rounded-full py-2 sm:py-2.5 outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-400 ${
                canShowButton ? "pr-14 sm:pr-20" : "pr-3 sm:pr-4"
              } pl-3 sm:pl-4`}
            />
            {canShowButton && (
              <button
                onClick={handleOpenModal}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-orange-500 text-white text-xs sm:text-sm font-medium rounded-full hover:bg-orange-600 transition active:scale-95 z-10 whitespace-nowrap"
              >
                Post
              </button>
            )}
          </div>
        </div>
        
        {/* Location Display */}
        {displayLocation && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-1.5 bg-orange-50 rounded-lg border border-orange-200 min-w-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-orange-700 font-medium flex-shrink-0">Location:</span>
            <span className="text-xs sm:text-sm text-orange-600 truncate min-w-0 flex-1">{displayLocation}</span>
            <button
              onClick={handleRemoveLocation}
              className="flex-shrink-0 p-0.5 sm:p-1 hover:bg-orange-200 rounded-full transition-colors group"
              aria-label="Remove location"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 group-hover:text-orange-700" />
            </button>
          </div>
        )}

        {/* Media Previews */}
        {(selectedImages.length > 0 || selectedVideos.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {videoPreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => handleRemoveVideo(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  aria-label="Remove video"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-around border-t border-gray-500 pt-2.5 sm:pt-[18px] text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
          <button 
            onClick={fetchLocation}
            disabled={isFetchingLocation}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-1 sm:px-0 py-1 sm:py-0"
          >
            <MapPin size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">{isFetchingLocation ? "Fetching..." : "Location"}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0"
          >
            <ImageIcon size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Photos/Videos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0">
            <Smile size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Feelings/activity</span>
          </button>
        </div>
      </div>

      {token && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={handleModalClose}
          token={token}
          onPostCreated={onPostCreated}
          initialContent={content}
          initialLocation={location}
          initialImages={selectedImages}
          initialVideos={selectedVideos}
        />
      )}
    </>
  );
}
