"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Calendar, ArrowLeft, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateEateryDocuments } from "@/lib/api/eatery";

interface DocumentsFormProps {
  onPrevious: () => void;
  onSave: (data: any) => void;
  eateryAlias: string;
}

export function DocumentsForm({ onPrevious, onSave, eateryAlias }: DocumentsFormProps) {
  const [token, setToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fssaiNumber: "",
    fssaiExpiryDate: "",
    gstNumber: "",
  });

  const [fssaiFile, setFssaiFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [fssaiError, setFssaiError] = useState<string>("");
  const fssaiFileInputRef = useRef<HTMLInputElement>(null);
  const gstFileInputRef = useRef<HTMLInputElement>(null);

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

  // Validate eateryAlias
  useEffect(() => {
    if (!eateryAlias) {
      toast.error("Eatery alias not found. Please complete branch information first.");
    }
  }, [eateryAlias]);

  // FSSAI validation regex: must start with 1-9, followed by exactly 13 digits (total 14 digits)
  const fssaiRegex = /^[1-9][0-9]{13}$/;

  const validateFSSAI = (number: string): boolean => {
    return fssaiRegex.test(number);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    // If it's FSSAI number, validate format (but allow user to type)
    if (name === "fssaiNumber") {
      // Only allow digits
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      
      // Validate when user has entered 14 digits
      if (numericValue.length === 14) {
        if (!validateFSSAI(numericValue)) {
          setFssaiError("Invalid FSSAI number. It must start with 1-9 and be exactly 14 digits.");
        } else {
          setFssaiError("");
        }
      } else if (numericValue.length > 14) {
        // Prevent typing more than 14 digits
        const truncated = numericValue.slice(0, 14);
        setFormData((prev) => ({ ...prev, [name]: truncated }));
        if (!validateFSSAI(truncated)) {
          setFssaiError("Invalid FSSAI number. It must start with 1-9 and be exactly 14 digits.");
        } else {
          setFssaiError("");
        }
      } else {
        setFssaiError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "fssai" | "gst"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or DOC file");
        return;
      }

      if (type === "fssai") {
        setFssaiFile(file);
        toast.success("FSSAI certificate selected");
      } else {
        setGstFile(file);
        toast.success("GST certificate selected");
      }
    }
  };

  const handleRemoveFile = (type: "fssai" | "gst") => {
    if (type === "fssai") {
      setFssaiFile(null);
      if (fssaiFileInputRef.current) {
        fssaiFileInputRef.current.value = "";
      }
    } else {
      setGstFile(null);
      if (gstFileInputRef.current) {
        gstFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("========================================");
    console.log("[DocumentsForm] ===== FORM SUBMISSION STARTED =====");
    console.log("========================================");

    // Validation
    if (!eateryAlias) {
      toast.error("Eatery alias not found. Please complete branch information first.");
      return;
    }

    if (!formData.fssaiNumber) {
      toast.error("Please enter FSSAI registration number");
      return;
    }

    // Validate FSSAI number format
    if (!validateFSSAI(formData.fssaiNumber)) {
      toast.error("Invalid FSSAI number. It must be 14 digits and start with 1-9.");
      return;
    }

    if (!fssaiFile) {
      toast.error("Please upload FSSAI certificate");
      return;
    }

    if (!formData.fssaiExpiryDate) {
      toast.error("Please select FSSAI expiry date");
      return;
    }

    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[DocumentsForm] Preparing data for submission...");
      console.log("[DocumentsForm] Eatery alias:", eateryAlias);
      console.log("[DocumentsForm] Form data:", formData);
      console.log("[DocumentsForm] FSSAI file:", fssaiFile?.name);
      console.log("[DocumentsForm] GST file:", gstFile?.name);

      const submitData = {
        eatery_alias: eateryAlias,
        step_name: "business_documents",
        fssai_number: formData.fssaiNumber,
        fssai_certificate: fssaiFile,
        fssai_expires_at: formData.fssaiExpiryDate,
        gst_reg_num: formData.gstNumber || undefined,
        gst_certificate: gstFile || undefined,
      };

      console.log("[DocumentsForm] Calling createOrUpdateEateryDocuments API...");

      const response = await createOrUpdateEateryDocuments(submitData, token);

      console.log("[DocumentsForm] API response received");
      console.log("[DocumentsForm] Response success:", response.success);
      console.log("[DocumentsForm] Response message:", response.message);
      console.log("[DocumentsForm] Response data:", response.data);

      if (response.success && response.data) {
        console.log("[DocumentsForm] ✅ Success! Documents uploaded successfully");
        toast.success(response.message || "Documents uploaded successfully!");
        // Call onSave callback with the response data
        onSave(response.data);
      } else {
        console.error("[DocumentsForm] ❌ Failed! Response:", response);
        toast.error(response.message || "Failed to upload documents");
      }
    } catch (error) {
      console.error("========================================");
      console.error("[DocumentsForm] ===== ERROR OCCURRED =====");
      console.error("========================================");
      console.error("[DocumentsForm] Error submitting form:", error);
      if (error instanceof Error) {
        console.error("[DocumentsForm] Error message:", error.message);
        console.error("[DocumentsForm] Error stack:", error.stack);
      }
      toast.error("Failed to upload documents");
    } finally {
      setIsSubmitting(false);
      console.log("[DocumentsForm] Form submission process completed");
      console.log("========================================");
    }
  };

  return (
    <div className="bg-white w-full rounded-[22px] p-3 md:p-5 shadow-md border border-orange-200">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <FileText className="w-6 h-6 text-brand" />
        <h1 className="text-[19px] md:text-[24px] font-semibold text-brand">
          Documents
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FSSAI Registration Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fssaiNumber" className="text-[13px] font-medium text-gray-700">
            FSSAI Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fssaiNumber"
            name="fssaiNumber"
            value={formData.fssaiNumber}
            onChange={handleInputChange}
            placeholder="Enter FSSAI number (14 digits)"
            maxLength={14}
            className={`bg-brand-bg-200 rounded-lg w-full h-[40px] border px-3 text-[13px] focus:outline-none focus:ring-2 ${
              fssaiError 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-200 focus:ring-brand"
            }`}
            required
          />
          {fssaiError && (
            <span className="text-red-600 text-[12px] mt-1">{fssaiError}</span>
          )}
          {formData.fssaiNumber && !fssaiError && formData.fssaiNumber.length === 14 && (
            <span className="text-green-600 text-[12px] mt-1">✓ Valid FSSAI number</span>
          )}
        </div>

        {/* Upload FSSAI Certificate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Upload FSSAI Certificate <span className="text-red-500">*</span>
          </label>
          {fssaiFile ? (
            <div className="border-2 border-brand rounded-lg bg-brand-bg-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-brand flex-shrink-0" />
                <span className="text-[13px] text-gray-700 truncate">{fssaiFile.name}</span>
                <span className="text-[11px] text-gray-500">
                  ({(fssaiFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile("fssai")}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fssaiFileInputRef.current?.click()}
              className="border-2 border-dashed border-brand rounded-lg bg-brand-bg-200 hover:bg-brand-bg-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-8 px-4"
            >
              <Upload className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-[13px] text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-[11px] text-gray-500">
                PDF, DOC up to 10MB
              </p>
              <input
                ref={fssaiFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "fssai")}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* FSSAI Expiry Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fssaiExpiryDate" className="text-[13px] font-medium text-gray-700">
            FSSAI Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              id="fssaiExpiryDate"
              name="fssaiExpiryDate"
              value={formData.fssaiExpiryDate}
              onChange={handleInputChange}
              placeholder="Pick expiry date"
              className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 pl-10 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
        </div>

        {/* GST Registration Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gstNumber" className="text-[13px] font-medium text-gray-700">
            GST Registration Number <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleInputChange}
            placeholder="Enter GST number"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Upload GST Certificate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Upload GST Certificate <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          {gstFile ? (
            <div className="border-2 border-brand rounded-lg bg-brand-bg-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-brand flex-shrink-0" />
                <span className="text-[13px] text-gray-700 truncate">{gstFile.name}</span>
                <span className="text-[11px] text-gray-500">
                  ({(gstFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile("gst")}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => gstFileInputRef.current?.click()}
              className="border-2 border-dashed border-brand rounded-lg bg-brand-bg-200 hover:bg-brand-bg-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-8 px-4"
            >
              <Upload className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-[13px] text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-[11px] text-gray-500">
                PDF, DOC up to 10MB
              </p>
              <input
                ref={gstFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "gst")}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 pt-3 justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !eateryAlias}
            className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

