"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shield, Image as ImageIcon, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import { UploadModal } from "@/app/home/components/uploadModal";
import { PrivacySelectModal } from "@/app/home/components/privacySelectModal";
import type { Post } from "@/types/post";

interface PostFormProps {
  onPostCreated?: (post: Post) => void;
}

export function PostForm({ onPostCreated }: PostFormProps = {}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImageOnlyModal, setIsImageOnlyModal] = useState(false);
  const [isVideoOnlyModal, setIsVideoOnlyModal] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [content, setContent] = useState<string>("");
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

  const handleImageModalOpen = () => {
    setIsImageOnlyModal(true);
    setIsUploadModalOpen(true);
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

  const handleVideoModalOpen = () => {
    setIsVideoOnlyModal(true);
    setIsUploadModalOpen(true);
  };

  const handlePrivacyModalOpen = () => {
    setIsPrivacyModalOpen(true);
  };

  const handlePrivacySelected = (privacyAlias: string) => {
    setSelectedPrivacy(privacyAlias);
    setIsPrivacyModalOpen(false);
    // Open upload modal after privacy is selected
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setIsImageOnlyModal(false);
    setIsVideoOnlyModal(false);
    setSelectedPrivacy("");
    // Reset content after modal closes
    setContent("");
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
            onClick={handleImageModalOpen}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0"
          >
            <ImageIcon size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Image</span>
          </button>
          <button
            onClick={handleVideoModalOpen}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0"
          >
            <Video size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Videos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handlePrivacyModalOpen}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:text-orange-500 transition cursor-pointer px-1 sm:px-0 py-1 sm:py-0"
          >
            <Shield size={18} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs">Privacy</span>
          </button>
        </div>
      </div>

      {token && (
        <>
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={handleModalClose}
            token={token}
            onPostCreated={onPostCreated}
            initialContent={content}
            initialLocation=""
            initialImages={selectedImages}
            initialVideos={selectedVideos}
            imageOnly={isImageOnlyModal}
            videoOnly={isVideoOnlyModal}
            initialPrivacy={selectedPrivacy}
          />
          <PrivacySelectModal
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
            token={token}
            onPrivacySelected={handlePrivacySelected}
          />
        </>
      )}
    </>
  );
}
