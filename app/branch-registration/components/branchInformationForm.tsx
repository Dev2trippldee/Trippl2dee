"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAccountOrgTypes, createOrUpdateEatery } from "@/lib/api/eatery";
import type { BranchType } from "@/lib/api/eatery";
import { PhoneVerificationModal } from "./phoneVerificationModal";

interface BranchInformationFormProps {
  onSave: (data: any) => void;
}

interface Branch {
  id?: string;
  name: string;
  city?: string;
  alias?: string;
}

export function BranchInformationForm({ onSave }: BranchInformationFormProps) {
  const [token, setToken] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchTypes, setBranchTypes] = useState<BranchType[]>([]);
  const [isLoadingBranchTypes, setIsLoadingBranchTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLatitude, setMapLatitude] = useState<string>("");
  const [mapLongitude, setMapLongitude] = useState<string>("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [eateryData, setEateryData] = useState<any>(null);

  const [formData, setFormData] = useState({
    branchName: "",
    branchType: "",
    branchTypeAlias: "",
    address: "",
    pinCode: "",
    phone: "",
    email: "",
    country: "india",
    latitude: "",
    longitude: "",
  });

  // Get token from cookies API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          console.warn("No token found in response");
          toast.error("Please login to continue");
        }
      } catch (error) {
        console.error("Failed to fetch token:", error);
        toast.error("Failed to authenticate");
      }
    };

    fetchToken();
  }, []);

  // Fetch branches from API (placeholder - you may need to add an API endpoint for this)
  useEffect(() => {
    // TODO: Replace with actual API call to fetch branches
    // For now, using mock data based on BranchesList component
    const mockBranches: Branch[] = [
      { id: "1", name: "Six Sight Restaurant", city: "Coimbatore" },
      { id: "2", name: "Six Sight Restaurant", city: "Chennai" },
      { id: "3", name: "Six Sight Restaurant", city: "Bangalore" },
    ];
    setBranches(mockBranches);
  }, []);

  const fetchBranchTypes = async () => {
    if (!token) return;

    setIsLoadingBranchTypes(true);
    try {
      const response = await getAccountOrgTypes(token, "acc.organization");
      if (response.success && response.data) {
        setBranchTypes(response.data);
      } else {
        toast.error(response.message || "Failed to load branch types");
      }
    } catch (error) {
      console.error("Error fetching branch types:", error);
      toast.error("Failed to load branch types");
    } finally {
      setIsLoadingBranchTypes(false);
    }
  };

  // Fetch branch types when a branch is selected
  useEffect(() => {
    if (selectedBranch && token) {
      fetchBranchTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, token]);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    // Reset branch type when branch changes
    setFormData((prev) => ({ ...prev, branchType: "", branchTypeAlias: "" }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // When branch type is selected, also set the alias
    if (name === "branchType" && value) {
      const selectedType = branchTypes.find((type) => type.type === value);
      if (selectedType) {
        setFormData((prev) => ({ ...prev, branchTypeAlias: selectedType.alias }));
      }
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get location using browser geolocation API
    handleGetLocation();
  };

  const handleGetLocation = () => {
    setIsFetchingLocation(true);

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapLatitude(latitude.toString());
          setMapLongitude(longitude.toString());
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.display_name && !formData.address) {
              setFormData((prev) => ({
                ...prev,
                address: data.display_name,
              }));
            }
            toast.success("Location fetched successfully");
          } catch (error) {
            console.warn("Geocoding failed:", error);
            toast.success("Location coordinates saved");
          } finally {
            setIsFetchingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsFetchingLocation(false);
          let errorMessage = "Failed to get location. Please try again.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          toast.error(errorMessage);
        },
        options
      );
    } else {
      setIsFetchingLocation(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("========================================");
    console.log("[BranchInformationForm] ===== FORM SUBMISSION STARTED =====");
    console.log("========================================");

    // Validation
    console.log("[BranchInformationForm] Validating form data...");
    console.log("[BranchInformationForm] Selected branch:", selectedBranch);
    console.log("[BranchInformationForm] Form data:", {
      branchName: formData.branchName,
      branchType: formData.branchType,
      branchTypeAlias: formData.branchTypeAlias,
      address: formData.address,
      pinCode: formData.pinCode,
      phone: formData.phone,
      email: formData.email,
      latitude: formData.latitude,
      longitude: formData.longitude,
      country: formData.country,
    });

    if (!selectedBranch) {
      console.error("[BranchInformationForm] Validation failed: No branch selected");
      toast.error("Please select a branch");
      return;
    }

    if (!formData.branchName) {
      console.error("[BranchInformationForm] Validation failed: Branch name is empty");
      toast.error("Please enter branch name");
      return;
    }

    if (!formData.branchType || !formData.branchTypeAlias) {
      console.error("[BranchInformationForm] Validation failed: Branch type not selected");
      toast.error("Please select a branch type");
      return;
    }

    if (!formData.address) {
      console.error("[BranchInformationForm] Validation failed: Address is empty");
      toast.error("Please enter address");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      console.error("[BranchInformationForm] Validation failed: Location not selected");
      toast.error("Please select location on map");
      return;
    }

    if (!token) {
      console.error("[BranchInformationForm] Validation failed: No authentication token");
      toast.error("Authentication token not found");
      return;
    }

    console.log("[BranchInformationForm] All validations passed");
    setIsSubmitting(true);

    try {
      console.log("[BranchInformationForm] Preparing data for submission...");
      
      // Handle phone number - use it as-is from PhoneInput (includes country code like "+918254792632")
      // Same pattern as signup form - just trim whitespace
      const phone = formData.phone?.trim();
      const hasValidPhone = phone && phone.length > 4 && phone.length >= 13;
      
      console.log("[BranchInformationForm] Original phone:", formData.phone);
      console.log("[BranchInformationForm] Trimmed phone:", phone);
      console.log("[BranchInformationForm] Has valid phone:", hasValidPhone);

      const submitData = {
        eatery_name: formData.branchName,
        step_name: "basic_info",
        organization_alias: formData.branchTypeAlias,
        email: formData.email,
        address: formData.address,
        phone_number: hasValidPhone ? phone : undefined,
        pincode: formData.pinCode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        country: formData.country,
      };

      console.log("[BranchInformationForm] Prepared submit data:", submitData);
      console.log("[BranchInformationForm] Token (first 20 chars):", token.substring(0, 20) + "...");
      console.log("[BranchInformationForm] Calling createOrUpdateEatery API...");

      const response = await createOrUpdateEatery(submitData, token);

      console.log("[BranchInformationForm] API response received");
      console.log("[BranchInformationForm] Response success:", response.success);
      console.log("[BranchInformationForm] Response message:", response.message);
      console.log("[BranchInformationForm] Response data:", response.data);

      if (response.success && response.data) {
        console.log("[BranchInformationForm] ✅ Success! Branch information saved successfully");
        toast.success(response.message || "Branch information saved successfully!");
        // Store the eatery data and show verification modal
        setEateryData(response.data);
        setShowVerificationModal(true);
      } else {
        console.error("[BranchInformationForm] ❌ Failed! Response:", response);
        toast.error(response.message || "Failed to save branch information");
      }
    } catch (error) {
      console.error("========================================");
      console.error("[BranchInformationForm] ===== ERROR OCCURRED =====");
      console.error("========================================");
      console.error("[BranchInformationForm] Error submitting form:", error);
      if (error instanceof Error) {
        console.error("[BranchInformationForm] Error message:", error.message);
        console.error("[BranchInformationForm] Error stack:", error.stack);
      }
      toast.error("Failed to save branch information");
    } finally {
      setIsSubmitting(false);
      console.log("[BranchInformationForm] Form submission process completed");
      console.log("========================================");
    }
  };

  return (
    <div className="bg-white w-full rounded-[22px] p-3 md:p-5 shadow-md border border-orange-200">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-brand" />
        <h1 className="text-[19px] md:text-[24px] font-semibold text-brand">
          Branch Information
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Branch Selection */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branchSelect" className="text-[13px] font-medium text-gray-700">
            Select Branch
          </label>
          <select
            id="branchSelect"
            name="branchSelect"
            value={selectedBranch?.id || ""}
            onChange={(e) => {
              const branch = branches.find((b) => b.id === e.target.value);
              if (branch) {
                handleBranchSelect(branch);
              }
            }}
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Select a branch</option>
            {branches.map((branch) => (
              <option key={branch.id || branch.name} value={branch.id || branch.name}>
                {branch.name} {branch.city ? `- ${branch.city}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branchName" className="text-[13px] font-medium text-gray-700">
            Branch Name
          </label>
          <input
            type="text"
            id="branchName"
            name="branchName"
            value={formData.branchName}
            onChange={handleInputChange}
            placeholder="Enter branch name"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        {/* Branch Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branchType" className="text-[13px] font-medium text-gray-700">
            Branch Type
          </label>
          {isLoadingBranchTypes ? (
            <div className="flex items-center justify-center h-[40px] bg-brand-bg-200 rounded-lg border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="ml-2 text-[13px] text-gray-600">Loading branch types...</span>
            </div>
          ) : (
            <select
              id="branchType"
              name="branchType"
              value={formData.branchType}
              onChange={handleInputChange}
              disabled={!selectedBranch || branchTypes.length === 0}
              className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">{selectedBranch ? "Select branch type" : "Select a branch first"}</option>
              {branchTypes.map((type) => (
                <option key={type.id} value={type.type}>
                  {type.type}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-[13px] font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter complete address"
            className="bg-brand-bg-200 rounded-lg w-full border border-gray-200 p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Map Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Choose your location in map
          </label>
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className="relative w-full h-[240px] md:h-[280px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
          >
            {/* Map Placeholder or Location Info */}
            {mapLatitude && mapLongitude ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-brand mx-auto mb-2" />
                  <p className="text-gray-700 text-[12px] font-medium mb-1">Location Selected</p>
                  <p className="text-gray-600 text-[10px]">
                    Lat: {mapLatitude.substring(0, 8)}...
                  </p>
                  <p className="text-gray-600 text-[10px]">
                    Lng: {mapLongitude.substring(0, 8)}...
                  </p>
                  <p className="text-gray-500 text-[9px] mt-2">Click again to update</p>
                </div>
              </div>
            ) : isFetchingLocation ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-brand mx-auto mb-2 animate-spin" />
                  <p className="text-gray-600 text-[11px] font-medium">Fetching location...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-brand mx-auto mb-2" />
                  <p className="text-gray-600 text-[11px] font-medium">Click to select location</p>
                </div>
              </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetLocation();
                }}
                disabled={isFetchingLocation}
                className="bg-white text-brand px-3 py-1.5 rounded-lg text-[11px] font-medium shadow-md hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  "Get Location"
                )}
              </button>
            </div>

            {/* Zoom Controls - Placeholder for future map integration */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
              <div className="w-2.5 h-2.5 bg-brand rounded-full mx-auto"></div>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                disabled
              >
                <span className="text-base font-semibold leading-none">+</span>
              </button>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                disabled
              >
                <span className="text-base font-semibold leading-none">−</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pin Code */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pinCode" className="text-[13px] font-medium text-gray-700">
            Pin code
          </label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleInputChange}
            placeholder="12345"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-[13px] font-medium text-gray-700">
            Phone Number
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            defaultCountry="in"
            inputProps={{ placeholder: "Enter your Mobile no" }}
            inputStyle={{
              width: "100%",
              height: "40px",
              borderRadius: "0px 10px 10px 0px",
              background: "#ffedd8",
              border: "1px solid #e5e7eb",
              paddingLeft: "10px",
              fontSize: "13px",
            }}
            countrySelectorStyleProps={{
              buttonStyle: {
                height: "40px",
                borderRadius: "10px 0px 0px 10px",
                border: "1px solid #e5e7eb",
                borderRight: "none",
              },
            }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your Email"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 pt-3 justify-between">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>
      </form>

      {/* Phone Verification Modal */}
      {showVerificationModal && eateryData && (
        <PhoneVerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            // Prevent closing if not verified
            if (!phoneVerified) {
              if (window.confirm("Are you sure you want to close? Phone verification is required to continue.")) {
                setShowVerificationModal(false);
              }
            } else {
              setShowVerificationModal(false);
            }
          }}
          phoneNumber={formData.phone?.trim() || ""}
          eateryAlias={eateryData.alias || ""}
          token={token}
          onVerifySuccess={() => {
            // Called when Next button is clicked after verification
            setPhoneVerified(true);
            setShowVerificationModal(false);
            // Call onSave to move to next step (documents page)
            onSave(eateryData);
          }}
        />
      )}
    </div>
  );
}

