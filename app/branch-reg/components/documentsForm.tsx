"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Calendar, ArrowLeft } from "lucide-react";

interface DocumentsFormProps {
  onPrevious: () => void;
  onSave: (data: any) => void;
}

export function DocumentsForm({ onPrevious, onSave }: DocumentsFormProps) {
  const [formData, setFormData] = useState({
    fssaiNumber: "",
    fssaiExpiryDate: "",
    gstNumber: "",
  });

  const [fssaiFile, setFssaiFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const fssaiFileInputRef = useRef<HTMLInputElement>(null);
  const gstFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "fssai" | "gst"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "fssai") {
        setFssaiFile(file);
      } else {
        setGstFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate backend save with dummy data
    const submitData = {
      ...formData,
      fssaiFile: fssaiFile?.name || null,
      gstFile: gstFile?.name || null,
    };
    console.log("Documents form submitted:", submitData);
    // Call onSave callback
    onSave(submitData);
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
            FSSAI Registration Number
          </label>
          <input
            type="text"
            id="fssaiNumber"
            name="fssaiNumber"
            value={formData.fssaiNumber}
            onChange={handleInputChange}
            placeholder="Enter FSSAI number"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Upload FSSAI Certificate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Upload FSSAI Certificate
          </label>
          <div
            onClick={() => fssaiFileInputRef.current?.click()}
            className="border-2 border-dashed border-brand rounded-lg bg-brand-bg-200 hover:bg-brand-bg-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-8 px-4"
          >
            <Upload className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-[13px] text-gray-700 mb-1">
              {fssaiFile ? fssaiFile.name : "Click to upload or drag and drop"}
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
        </div>

        {/* FSSAI Expiry Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fssaiExpiryDate" className="text-[13px] font-medium text-gray-700">
            FSSAI Expiry Date
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
            />
          </div>
        </div>

        {/* GST Registration Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gstNumber" className="text-[13px] font-medium text-gray-700">
            GST Registration Number
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
            Upload GST Certificate
          </label>
          <div
            onClick={() => gstFileInputRef.current?.click()}
            className="border-2 border-dashed border-brand rounded-lg bg-brand-bg-200 hover:bg-brand-bg-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-8 px-4"
          >
            <Upload className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-[13px] text-gray-700 mb-1">
              {gstFile ? gstFile.name : "Click to upload or drag and drop"}
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
            className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

