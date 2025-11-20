"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeUploadForm } from "./components/recipe-upload-form";
import toast from "react-hot-toast";

export default function UploadRecipePage() {
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          toast.error("Please login to upload recipes");
          router.push("/signin");
        }
      } catch (error) {
        console.error("[UploadRecipePage] Failed to fetch token:", error);
        toast.error("Failed to authenticate");
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <RecipeUploadForm token={token} />
    </div>
  );
}







