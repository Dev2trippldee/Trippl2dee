"use client";

import React, { useState, useEffect } from "react";
import { Smile, MapPin, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { UploadModal } from "@/app/home/components/uploadModal";
import type { Post } from "@/types/post";

interface PostFormProps {
  onPostCreated?: (post: Post) => void;
}

export function PostForm({ onPostCreated }: PostFormProps = {}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

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
              // Get first two words
              const words = locationName.split(" ").slice(0, 2).join(" ");
              setLocation(words);
              toast.success("Location fetched successfully");
            } catch (error) {
              console.error("[PostForm] Geocoding failed:", error);
              const locationName = `${latitude}, ${longitude}`;
              const words = locationName.split(" ").slice(0, 2).join(" ");
              setLocation(words);
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

  const handleOpenModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    // Reset content and location after modal closes
    setContent("");
    setLocation("");
  };

  const canShowButton = content.trim().length > 14;

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
              type="text"
              value={content}
              onChange={handleContentChange}
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
        {location && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-1.5 bg-orange-50 rounded-lg border border-orange-200 min-w-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-orange-700 font-medium flex-shrink-0">Location:</span>
            <span className="text-xs sm:text-sm text-orange-600 truncate min-w-0">{location}</span>
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
            onClick={() => {
              console.log("[PostForm] Photo/Videos button clicked, opening upload modal");
              setIsUploadModalOpen(true);
            }}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0"
          >
            <ImageIcon size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Photos/Videos</span>
          </button>
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
        />
      )}
    </>
  );
}
