import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants/api";
import FormDataLib from "form-data";

/**
 * Next.js API route to proxy recipe creation/update requests
 * This allows server-side logging that appears in the terminal
 */
export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("[SERVER API] ===== RECIPE CREATE/UPDATE REQUEST RECEIVED =====");
  console.log("========================================");
  console.log("[SERVER API] Request URL:", request.url);
  console.log("[SERVER API] Request Method: POST");
  
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    console.log("[SERVER API] FormData received from client");
    
    // Log all form data entries
    console.log("========================================");
    console.log("[SERVER API] ===== FORM DATA BEING SENT =====");
    console.log("========================================");
    
    const requestDataSummary: Record<string, any> = {};
    const entriesArray: Array<{ key: string; value: any }> = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const fileData = {
          name: value.name,
          size: value.size,
          type: value.type,
        };
        
        if (!requestDataSummary[key]) {
          requestDataSummary[key] = [];
        }
        requestDataSummary[key].push(fileData);
        
        entriesArray.push({
          key,
          value: {
            type: "File",
            name: value.name,
            size: `${(value.size / 1024).toFixed(2)} KB`,
            mimeType: value.type,
          },
        });
      } else {
        requestDataSummary[key] = value;
        entriesArray.push({ key, value: value.toString() });
      }
    }
    
    console.log("[SERVER API] FormData Summary (JSON):", JSON.stringify(requestDataSummary, null, 2));
    console.log("[SERVER API] FormData Entries:");
    console.table(entriesArray);
    
    // Extract authorization token from headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    
    console.log("[SERVER API] Token (first 20 chars):", token.substring(0, 20) + "...");
    
    // Create FormData for axios (using form-data library for Node.js)
    const axiosFormData = new FormDataLib();
    
    // Copy all entries to axios FormData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Convert File to Buffer for form-data
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        axiosFormData.append(key, buffer, {
          filename: value.name,
          contentType: value.type || undefined,
        });
      } else {
        axiosFormData.append(key, value.toString());
      }
    }
    
    console.log("[SERVER API] Sending request to external API...");
    console.log("[SERVER API] External API URL:", API_ENDPOINTS.RECIPE.CREATE_OR_UPDATE);
    
    // Make the request to the external API
    const response = await axios.post(
      API_ENDPOINTS.RECIPE.CREATE_OR_UPDATE,
      axiosFormData,
      {
        headers: {
          ...axiosFormData.getHeaders(),
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("========================================");
    console.log("[SERVER API] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[SERVER API] Response status:", response.status);
    console.log("[SERVER API] Response headers:", response.headers);
    console.log("[SERVER API] Response data:", JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      console.log("[SERVER API] Recipe details:", {
        id: response.data.data.id,
        name: response.data.data.name,
        recipe_alias: response.data.data.recipe_alias,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      });
    }
    
    console.log("[SERVER API] Response message:", response.data?.message);
    console.log("[SERVER API] Response success:", response.data?.success);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("========================================");
    console.error("[SERVER API] ===== ERROR OCCURRED =====");
    console.error("========================================");
    console.error("[SERVER API] Error:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("[SERVER API] Error response:", error.response?.data);
      console.error("[SERVER API] Error status:", error.response?.status);
      console.error("[SERVER API] Error headers:", error.response?.headers);
      
      return NextResponse.json(
        {
          success: false,
          message: error.response?.data?.message || "An error occurred",
          data: null,
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      },
      { status: 500 }
    );
  }
}

