/**
 * Eatery/Branch API service functions
 */

import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";
import { handleApiError } from "./client";
import type { ApiResponse } from "@/types/auth";

export interface BranchType {
  type: string;
  id: number;
  ac_type_alias: string;
  alias: string;
}

export interface CreateEateryData {
  eatery_name: string;
  step_name: string;
  organization_alias: string;
  email: string;
  address: string;
  phone_number?: string;
  pincode: string;
  latitude: string;
  longitude: string;
  country: string;
  eatery_alias?: string; // for updates
}

export interface CreateEateryDocumentsData {
  eatery_alias: string;
  step_name: string;
  fssai_number: string;
  fssai_certificate?: File;
  fssai_expires_at: string;
  gst_reg_num?: string;
  gst_certificate?: File;
}

export interface ExtraCharge {
  type: string;
  amount: number;
}

export interface DeliveryData {
  available_radius: number;
  charges_per_km: number;
  extra_charges?: {
    offline?: ExtraCharge[];
    online?: ExtraCharge[];
  };
}

export interface PickUpData {
  extra_charges?: {
    offline?: ExtraCharge[];
    online?: ExtraCharge[];
  };
}

export interface ReservationData {
  advance_amount?: number;
  advance_percentage_of_order?: number;
  cleaning_time?: string;
}

export interface DiningData {
  cleaning_time?: string;
}

export interface CreateEateryOrderOptionsData {
  eatery_alias: string;
  step_name: string;
  available_order_types: string[];
  available_payment_options: string[];
  reservation?: ReservationData;
  delivery?: DeliveryData;
  pick_up?: PickUpData;
  dining?: DiningData;
}

export interface EateryResponse {
  branch_name: string;
  qr_code: string | null;
  alias: string;
  address: string;
  pincode: string;
  email: string;
  country_code: string;
  phone_number: string;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: string;
  longitude: string;
  fssai_number: string | null;
  fssai_certificate: string | null;
  fssai_expires_at: string | null;
  fssai_status: string;
  gst_certificate: string | null;
  gst_number: string | null;
  available_payment_option: string | null;
  order_types_details: any[];
  eatery_profile_image: string | null;
  eatery_cover_image: string | null;
  description: string | null;
  resto_link: string;
  menu: any[];
  working_hours: any[];
  amenities: any[];
  cuisines: any[];
  organization: {
    type: string;
    alias: string;
  };
  owned_by: {
    referral_code: string;
    name: string;
  };
}

/**
 * Get account organization types (branch types)
 */
export async function getAccountOrgTypes(
  token: string,
  accountType: string = "acc.organization"
): Promise<ApiResponse<BranchType[]>> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: BranchType[];
      code: number;
    }>(
      `${API_ENDPOINTS.ACCOUNT.GET_ORG_TYPES}?account_type=${encodeURIComponent(accountType)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success || true,
      data: response.data.data || [],
      message: response.data.message || "Branch types fetched successfully",
    };
  } catch (err) {
    console.error("[API:getAccountOrgTypes] Error occurred:", err);
    const errorResponse = handleApiError<BranchType[]>(err);
    return errorResponse;
  }
}

/**
 * Create or update an eatery/branch
 */
export async function createOrUpdateEatery(
  data: CreateEateryData,
  token: string
): Promise<ApiResponse<EateryResponse>> {
  console.log("========================================");
  console.log("[API:createOrUpdateEatery] ===== REQUEST STARTED =====");
  console.log("========================================");
  console.log("[API:createOrUpdateEatery] Starting request...");
  console.log("[API:createOrUpdateEatery] Endpoint:", API_ENDPOINTS.EATERY.CREATE_OR_UPDATE);
  console.log("[API:createOrUpdateEatery] Request Method: POST");
  console.log("[API:createOrUpdateEatery] Token (first 20 chars):", token.substring(0, 20) + "...");
  
  console.log("[API:createOrUpdateEatery] Request data:", {
    eatery_name: data.eatery_name,
    step_name: data.step_name,
    organization_alias: data.organization_alias,
    email: data.email,
    address: data.address,
    phone_number: data.phone_number,
    pincode: data.pincode,
    latitude: data.latitude,
    longitude: data.longitude,
    country: data.country,
    eatery_alias: data.eatery_alias,
  });

  console.log("[API:createOrUpdateEatery] Request headers:", {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.substring(0, 20)}...`,
  });

  try {
    console.log("[API:createOrUpdateEatery] Sending POST request...");
    
    const response = await axios.post<ApiResponse<EateryResponse>>(
      API_ENDPOINTS.EATERY.CREATE_OR_UPDATE,
      data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("========================================");
    console.log("[API:createOrUpdateEatery] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[API:createOrUpdateEatery] Response status:", response.status);
    console.log("[API:createOrUpdateEatery] Response headers:", response.headers);
    console.log("[API:createOrUpdateEatery] Response data:", JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      console.log("[API:createOrUpdateEatery] Response data details:", {
        branch_name: response.data.data.branch_name,
        alias: response.data.data.alias,
        address: response.data.data.address,
        email: response.data.data.email,
        phone_number: response.data.data.phone_number,
        organization_type: response.data.data.organization?.type,
        organization_alias: response.data.data.organization?.alias,
      });
    }
    
    console.log("[API:createOrUpdateEatery] Response success:", response.data?.success);
    console.log("[API:createOrUpdateEatery] Response message:", response.data?.message);
    
    return response.data;
  } catch (err) {
    console.error("========================================");
    console.error("[API:createOrUpdateEatery] ===== ERROR OCCURRED =====");
    console.error("========================================");
    console.error("[API:createOrUpdateEatery] Error occurred:", err);
    
    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateEatery] Error is Axios error");
      console.error("[API:createOrUpdateEatery] Error response status:", err.response?.status);
      console.error("[API:createOrUpdateEatery] Error response data:", err.response?.data);
      console.error("[API:createOrUpdateEatery] Error response headers:", err.response?.headers);
      console.error("[API:createOrUpdateEatery] Error message:", err.message);
      console.error("[API:createOrUpdateEatery] Error code:", err.code);
      
      if (err.response) {
        console.error("[API:createOrUpdateEatery] Error response details:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        });
      }
    } else {
      console.error("[API:createOrUpdateEatery] Unknown error type:", err);
    }
    
    const errorResponse = handleApiError<EateryResponse>(err);
    console.error("[API:createOrUpdateEatery] Processed error response:", errorResponse);
    return errorResponse;
  }
}

export interface ValidateEateryOTPData {
  phone_number: string;
  otp: string;
  reference_code?: string;
  email?: string;
}

export interface ValidateEateryOTPResponse {
  success: boolean;
  message: string;
  data: any[];
  code: number;
}

/**
 * Validate OTP for eatery/branch phone verification
 */
export async function validateEateryOTP(
  data: ValidateEateryOTPData,
  token: string
): Promise<ApiResponse<ValidateEateryOTPResponse>> {
  try {
    const response = await axios.post<ApiResponse<ValidateEateryOTPResponse>>(
      API_ENDPOINTS.EATERY.VALIDATE_OTP,
      data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: response.data.success || true,
      data: response.data.data,
      message: response.data.message || "Phone number verified successfully!",
    };
  } catch (err) {
    console.error("[API:validateEateryOTP] Error occurred:", err);
    const errorResponse = handleApiError<ValidateEateryOTPResponse>(err);
    return errorResponse;
  }
}

/**
 * Create or update eatery documents (multipart/form-data)
 */
export async function createOrUpdateEateryDocuments(
  data: CreateEateryDocumentsData,
  token: string
): Promise<ApiResponse<EateryResponse>> {
  console.log("========================================");
  console.log("[API:createOrUpdateEateryDocuments] ===== REQUEST STARTED =====");
  console.log("========================================");
  console.log("[API:createOrUpdateEateryDocuments] Starting request...");
  console.log("[API:createOrUpdateEateryDocuments] Endpoint:", API_ENDPOINTS.EATERY.CREATE_OR_UPDATE);
  console.log("[API:createOrUpdateEateryDocuments] Request Method: POST (multipart/form-data)");
  console.log("[API:createOrUpdateEateryDocuments] Token (first 20 chars):", token.substring(0, 20) + "...");

  try {
    const formData = new FormData();

    // Add required fields
    formData.append("eatery_alias", data.eatery_alias);
    formData.append("step_name", data.step_name);
    formData.append("fssai_number", data.fssai_number);
    formData.append("fssai_expires_at", data.fssai_expires_at);

    // Add FSSAI certificate file if provided
    if (data.fssai_certificate) {
      console.log("[API:createOrUpdateEateryDocuments] Adding fssai_certificate:", {
        name: data.fssai_certificate.name,
        size: data.fssai_certificate.size,
        type: data.fssai_certificate.type,
      });
      formData.append("fssai_certificate", data.fssai_certificate);
    }

    // Add optional GST fields
    if (data.gst_reg_num) {
      formData.append("gst_reg_num", data.gst_reg_num);
    }

    if (data.gst_certificate) {
      console.log("[API:createOrUpdateEateryDocuments] Adding gst_certificate:", {
        name: data.gst_certificate.name,
        size: data.gst_certificate.size,
        type: data.gst_certificate.type,
      });
      formData.append("gst_certificate", data.gst_certificate);
    }

    // Log FormData contents
    console.log("[API:createOrUpdateEateryDocuments] FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    console.log("[API:createOrUpdateEateryDocuments] Sending POST request with FormData...");

    const response = await axios.post<ApiResponse<EateryResponse>>(
      API_ENDPOINTS.EATERY.CREATE_OR_UPDATE,
      formData,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // Content-Type will be set automatically by axios/browser with boundary
        },
      }
    );

    console.log("========================================");
    console.log("[API:createOrUpdateEateryDocuments] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[API:createOrUpdateEateryDocuments] Response status:", response.status);
    console.log("[API:createOrUpdateEateryDocuments] Response data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      console.log("[API:createOrUpdateEateryDocuments] Response data details:", {
        branch_name: response.data.data.branch_name,
        alias: response.data.data.alias,
        fssai_number: response.data.data.fssai_number,
        fssai_certificate: response.data.data.fssai_certificate,
        fssai_expires_at: response.data.data.fssai_expires_at,
        gst_number: response.data.data.gst_number,
        gst_certificate: response.data.data.gst_certificate,
      });
    }

    console.log("[API:createOrUpdateEateryDocuments] Response success:", response.data?.success);
    console.log("[API:createOrUpdateEateryDocuments] Response message:", response.data?.message);

    return response.data;
  } catch (err) {
    console.error("========================================");
    console.error("[API:createOrUpdateEateryDocuments] ===== ERROR OCCURRED =====");
    console.error("========================================");
    console.error("[API:createOrUpdateEateryDocuments] Error occurred:", err);

    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateEateryDocuments] Error response status:", err.response?.status);
      console.error("[API:createOrUpdateEateryDocuments] Error response data:", err.response?.data);
      console.error("[API:createOrUpdateEateryDocuments] Error message:", err.message);
    }

    const errorResponse = handleApiError<EateryResponse>(err);
    return errorResponse;
  }
}

/**
 * Create or update eatery order options
 */
export async function createOrUpdateEateryOrderOptions(
  data: CreateEateryOrderOptionsData,
  token: string
): Promise<ApiResponse<EateryResponse>> {
  console.log("========================================");
  console.log("[API:createOrUpdateEateryOrderOptions] ===== REQUEST STARTED =====");
  console.log("========================================");
  console.log("[API:createOrUpdateEateryOrderOptions] Starting request...");
  console.log("[API:createOrUpdateEateryOrderOptions] Endpoint:", API_ENDPOINTS.EATERY.CREATE_OR_UPDATE);
  console.log("[API:createOrUpdateEateryOrderOptions] Request Method: POST");
  console.log("[API:createOrUpdateEateryOrderOptions] Token (first 20 chars):", token.substring(0, 20) + "...");
  console.log("[API:createOrUpdateEateryOrderOptions] Request data:", JSON.stringify(data, null, 2));

  try {
    const response = await axios.post<ApiResponse<EateryResponse>>(
      API_ENDPOINTS.EATERY.CREATE_OR_UPDATE,
      data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("========================================");
    console.log("[API:createOrUpdateEateryOrderOptions] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[API:createOrUpdateEateryOrderOptions] Response status:", response.status);
    console.log("[API:createOrUpdateEateryOrderOptions] Response data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      console.log("[API:createOrUpdateEateryOrderOptions] Response data details:", {
        branch_name: response.data.data.branch_name,
        alias: response.data.data.alias,
        available_payment_option: response.data.data.available_payment_option,
        order_types_details: response.data.data.order_types_details,
      });
    }

    console.log("[API:createOrUpdateEateryOrderOptions] Response success:", response.data?.success);
    console.log("[API:createOrUpdateEateryOrderOptions] Response message:", response.data?.message);

    return response.data;
  } catch (err) {
    console.error("========================================");
    console.error("[API:createOrUpdateEateryOrderOptions] ===== ERROR OCCURRED =====");
    console.error("========================================");
    console.error("[API:createOrUpdateEateryOrderOptions] Error occurred:", err);

    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateEateryOrderOptions] Error response status:", err.response?.status);
      console.error("[API:createOrUpdateEateryOrderOptions] Error response data:", err.response?.data);
      console.error("[API:createOrUpdateEateryOrderOptions] Error message:", err.message);
    }

    const errorResponse = handleApiError<EateryResponse>(err);
    return errorResponse;
  }
}

/**
 * Amenity interface
 */
export interface Amenity {
  amenity: string;
  alias: string;
}

/**
 * Working Day interface
 */
export interface WorkingDay {
  days: string;
  alias: string;
}

/**
 * Get all amenities
 */
export async function getAmenities(
  token: string
): Promise<ApiResponse<Amenity[]>> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: Amenity[];
      code: number;
    }>(API_ENDPOINTS.EATERY.GET_AMENITIES, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.data.success || true,
      data: response.data.data || [],
      message: response.data.message || "Amenities fetched successfully",
    };
  } catch (err) {
    console.error("[API:getAmenities] Error occurred:", err);
    const errorResponse = handleApiError<Amenity[]>(err);
    return errorResponse;
  }
}

/**
 * Get all working days
 */
export async function getWorkingDays(
  token: string
): Promise<ApiResponse<WorkingDay[]>> {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      data: WorkingDay[];
      code: number;
    }>(API_ENDPOINTS.EATERY.GET_WORKING_DAYS, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.data.success || true,
      data: response.data.data || [],
      message: response.data.message || "Working days fetched successfully",
    };
  } catch (err) {
    console.error("[API:getWorkingDays] Error occurred:", err);
    const errorResponse = handleApiError<WorkingDay[]>(err);
    return errorResponse;
  }
}

/**
 * Table data interface
 */
export interface TableData {
  name: string;
  capacity: number;
}

/**
 * Working hour data interface
 */
export interface WorkingHourData {
  day: string;
  start_time: string;
  end_time: string;
}

/**
 * Create or update eatery business details data interface
 */
export interface CreateEateryBusinessDetailsData {
  eatery_alias: string;
  step_name: string;
  upi_id?: string;
  food_category_alias?: string;
  cuisine?: string[];
  eatery_profile_image?: File;
  eatery_cover_image?: File;
  description?: string;
  amenities?: string[];
  table?: TableData[];
  working_hours?: WorkingHourData[];
  first_order_discount?: number;
}

/**
 * Create or update eatery business details (multipart/form-data)
 */
export async function createOrUpdateEateryBusinessDetails(
  data: CreateEateryBusinessDetailsData,
  token: string
): Promise<ApiResponse<EateryResponse>> {
  console.log("========================================");
  console.log("[API:createOrUpdateEateryBusinessDetails] ===== REQUEST STARTED =====");
  console.log("========================================");
  console.log("[API:createOrUpdateEateryBusinessDetails] Starting request...");
  console.log("[API:createOrUpdateEateryBusinessDetails] Endpoint:", API_ENDPOINTS.EATERY.CREATE_OR_UPDATE);
  console.log("[API:createOrUpdateEateryBusinessDetails] Request Method: POST (multipart/form-data)");
  console.log("[API:createOrUpdateEateryBusinessDetails] Token (first 20 chars):", token.substring(0, 20) + "...");

  try {
    const formData = new FormData();

    // Add required fields
    formData.append("eatery_alias", data.eatery_alias);
    formData.append("step_name", data.step_name);

    // Add optional fields
    if (data.upi_id) {
      formData.append("upi_id", data.upi_id);
    }

    if (data.food_category_alias) {
      formData.append("food_category_alias", data.food_category_alias);
    }

    // Add cuisine array
    if (data.cuisine && data.cuisine.length > 0) {
      data.cuisine.forEach((cuisine, index) => {
        formData.append(`cuisine[${index}]`, cuisine);
      });
    }

    // Add profile image if provided
    if (data.eatery_profile_image) {
      console.log("[API:createOrUpdateEateryBusinessDetails] Adding eatery_profile_image:", {
        name: data.eatery_profile_image.name,
        size: data.eatery_profile_image.size,
        type: data.eatery_profile_image.type,
      });
      formData.append("eatery_profile_image", data.eatery_profile_image);
    }

    // Add cover image if provided
    if (data.eatery_cover_image) {
      console.log("[API:createOrUpdateEateryBusinessDetails] Adding eatery_cover_image:", {
        name: data.eatery_cover_image.name,
        size: data.eatery_cover_image.size,
        type: data.eatery_cover_image.type,
      });
      formData.append("eatery_cover_image", data.eatery_cover_image);
    }

    // Add description
    if (data.description) {
      formData.append("description", data.description);
    }

    // Add amenities array
    if (data.amenities && data.amenities.length > 0) {
      data.amenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}]`, amenity);
      });
    }

    // Add table array
    if (data.table && data.table.length > 0) {
      data.table.forEach((table, index) => {
        formData.append(`table[${index}][name]`, table.name);
        formData.append(`table[${index}][capacity]`, table.capacity.toString());
      });
    }

    // Add working hours array
    if (data.working_hours && data.working_hours.length > 0) {
      data.working_hours.forEach((workingHour, index) => {
        formData.append(`working_hours[${index}][day]`, workingHour.day);
        formData.append(`working_hours[${index}][start_time]`, workingHour.start_time);
        formData.append(`working_hours[${index}][end_time]`, workingHour.end_time);
      });
    }

    // Add first order discount
    if (data.first_order_discount !== undefined) {
      formData.append("first_order_discount", data.first_order_discount.toString());
    }

    // Log FormData contents
    console.log("[API:createOrUpdateEateryBusinessDetails] FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    console.log("[API:createOrUpdateEateryBusinessDetails] Sending POST request with FormData...");

    const response = await axios.post<ApiResponse<EateryResponse>>(
      API_ENDPOINTS.EATERY.CREATE_OR_UPDATE,
      formData,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // Content-Type will be set automatically by axios/browser with boundary
        },
      }
    );

    console.log("========================================");
    console.log("[API:createOrUpdateEateryBusinessDetails] ===== RESPONSE RECEIVED =====");
    console.log("========================================");
    console.log("[API:createOrUpdateEateryBusinessDetails] Response status:", response.status);
    console.log("[API:createOrUpdateEateryBusinessDetails] Response data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      console.log("[API:createOrUpdateEateryBusinessDetails] Response data details:", {
        branch_name: response.data.data.branch_name,
        alias: response.data.data.alias,
        eatery_profile_image: response.data.data.eatery_profile_image,
        eatery_cover_image: response.data.data.eatery_cover_image,
        description: response.data.data.description,
        amenities: response.data.data.amenities,
        cuisines: response.data.data.cuisines,
        working_hours: response.data.data.working_hours,
      });
    }

    console.log("[API:createOrUpdateEateryBusinessDetails] Response success:", response.data?.success);
    console.log("[API:createOrUpdateEateryBusinessDetails] Response message:", response.data?.message);

    return response.data;
  } catch (err) {
    console.error("========================================");
    console.error("[API:createOrUpdateEateryBusinessDetails] ===== ERROR OCCURRED =====");
    console.error("========================================");
    console.error("[API:createOrUpdateEateryBusinessDetails] Error occurred:", err);

    if (axios.isAxiosError(err)) {
      console.error("[API:createOrUpdateEateryBusinessDetails] Error response status:", err.response?.status);
      console.error("[API:createOrUpdateEateryBusinessDetails] Error response data:", err.response?.data);
      console.error("[API:createOrUpdateEateryBusinessDetails] Error message:", err.message);
    }

    const errorResponse = handleApiError<EateryResponse>(err);
    return errorResponse;
  }
}

