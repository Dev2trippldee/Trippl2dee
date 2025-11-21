"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesSelected: (images: File[]) => void;
}

export function ImageSelectModal({ isOpen, onClose, onImagesSelected }: ImageSelectModalProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: File[] = [];
    const newImagePreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) selected`);
    } else {
      toast.error("Please select valid image files");
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleConfirm = () => {
    if (selectedImages.length > 0) {
      onImagesSelected(selectedImages);
      handleClose();
    } else {
      toast.error("Please select at least one image");
    }
  };

  const handleClose = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 h-[100dvh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Select Images</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
              <div className="flex justify-center mb-3 sm:mb-4">
                <ImageIcon className="text-gray-400 group-hover:text-orange-500 transition w-12 h-12 sm:w-16 sm:h-16" />
              </div>
              <p className="text-gray-700 mb-2 sm:mb-3 font-semibold text-base sm:text-lg">
                Upload Images
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
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
                Supports image files only
              </p>
            </div>

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700">
                  Selected Images ({selectedImages.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                    >
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex justify-between items-center gap-2">
          <button
            onClick={handleClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedImages.length === 0}
            className="px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-orange-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            Confirm ({selectedImages.length})
          </button>
        </div>
      </div>
    </div>
  );
}










