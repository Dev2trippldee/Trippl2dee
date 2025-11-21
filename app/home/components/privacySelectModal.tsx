"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getPrivacyOptions } from "@/lib/api/post";
import type { PrivacyOption } from "@/types/post";

interface PrivacySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onPrivacySelected: (privacyAlias: string) => void;
}

export function PrivacySelectModal({ isOpen, onClose, token, onPrivacySelected }: PrivacySelectModalProps) {
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("");

  useEffect(() => {
    if (isOpen && privacyOptions.length === 0) {
      fetchPrivacyOptions();
    }
  }, [isOpen]);

  const fetchPrivacyOptions = async () => {
    setIsLoading(true);
    try {
      const response = await getPrivacyOptions(token);
      if (response.success && response.data) {
        setPrivacyOptions(response.data);
      } else {
        toast.error(response.message || "Failed to load privacy options");
      }
    } catch (error) {
      console.error("[PrivacySelectModal] Error fetching privacy options:", error);
      toast.error("Failed to load privacy options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (privacyAlias: string) => {
    setSelectedPrivacy(privacyAlias);
  };

  const handleConfirm = () => {
    if (selectedPrivacy) {
      onPrivacySelected(selectedPrivacy);
      handleClose();
    } else {
      toast.error("Please select a privacy option");
    }
  };

  const handleClose = () => {
    setSelectedPrivacy("");
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
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500" size={20} />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Select Privacy</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading privacy options...</span>
            </div>
          ) : privacyOptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No privacy options available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {privacyOptions.map((option) => (
                <button
                  key={option.alias}
                  onClick={() => handleSelect(option.alias)}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all ${
                    selectedPrivacy === option.alias
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base">{option.name}</span>
                    {selectedPrivacy === option.alias && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
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
            disabled={!selectedPrivacy || isLoading}
            className="px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-orange-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}









