"use client";
import { FileUpload, Progress } from "@ark-ui/react";
import { FileText, Upload } from "lucide-react";
import { BranchRegFormProps } from "@/app/branch-reg/page";

export function BranchDocForm({ setStep }: BranchRegFormProps) {
  return (
    <div className="bg-brand-white flex-4 font-fira rounded-3xl overflow-clip">
      {/* Progress bar */}
      <Progress.Root value={60} className="w-full">
        {/*<Progress.Label>Label</Progress.Label>*/}
        <Progress.Track className="rounded-2xl ">
          <Progress.Range className="bg-teal-400 h-3" />
        </Progress.Track>
        <Progress.ValueText className="pl-[57%]" />
      </Progress.Root>

      {/* Form content */}
      <div className="p-[30px] font-fira">
        <form action="" className="w-full space-y-[20px]">
          {/* Header */}
          <div className="text-brand flex justify-start gap-3 items-center pb-[10px]">
            <FileText className="w-[36px]" />
            <h3 className="font-inter text-[28px] font-semibold">Documents</h3>
          </div>

          {/* FSSAI Registration Number */}
          <div className="flex flex-col gap-[15px]">
            <label htmlFor="fssai-number" className="text-[18px]">
              FSSAI Registration Number
            </label>
            <input
              type="text"
              name="fssai-number"
              placeholder="Enter FSSAI number"
              className="bg-brand-bg-200 pl-3 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Upload FSSAI Certificate */}
          <FileUpload.Root
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxFiles={1}
            maxFileSize={10000000}
            className="flex flex-col gap-[15px] rounded-2xl"
          >
            <FileUpload.Label className="text-[18px]">
              Upload FSSAI Certificate
            </FileUpload.Label>
            <FileUpload.Context>
              {({ acceptedFiles, dragging }) => (
                <FileUpload.Dropzone
                  className={`border border-dashed border-gray-500 rounded-md flex flex-col items-center justify-center py-[30px] cursor-pointer transition-colors ${
                    dragging
                      ? "bg-brand border-brand"
                      : "bg-brand-bg-200 hover:bg-brand-bg-100"
                  }`}
                >
                  <FileUpload.Trigger>
                    <Upload className="w-[28px]" />
                  </FileUpload.Trigger>
                  {acceptedFiles.length > 0 ? (
                    <FileUpload.ItemGroup>
                      {acceptedFiles.map((file) => (
                        <FileUpload.Item
                          key={file.name}
                          file={file}
                          className="file-item"
                        >
                          <FileUpload.ItemName />
                        </FileUpload.Item>
                      ))}
                    </FileUpload.ItemGroup>
                  ) : (
                    "Click to upload or drag and drop"
                  )}
                  <p className="text-[13px] text-gray-400">
                    {acceptedFiles.length > 0
                      ? "Click to replace"
                      : "PDF, DOC up to 10MB"}
                  </p>
                </FileUpload.Dropzone>
              )}
            </FileUpload.Context>
            <FileUpload.HiddenInput />
          </FileUpload.Root>

          {/* FSSAI Expiry Date */}
          <div className="flex flex-col gap-[15px]">
            <label htmlFor="fssai-expiry" className="text-[18px]">
              FSSAI Expiry Date
            </label>
            <input
              type="date"
              name="fssai-expiry"
              className="bg-brand-bg-200 pl-3 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* GST Registration Number */}
          <div className="flex flex-col gap-[15px]">
            <label htmlFor="gst-number" className="text-[18px]">
              GST Registration Number
            </label>
            <input
              type="text"
              name="gst-number"
              placeholder="Enter GST number"
              className="bg-brand-bg-200 pl-3 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Upload GST Certificate */}
          <FileUpload.Root
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxFiles={1}
            maxFileSize={10000000}
            className="flex flex-col gap-[15px] rounded-2xl w-full"
          >
            <FileUpload.Label className="text-[18px]">
              Upload GST Certificate
            </FileUpload.Label>
            <FileUpload.Context>
              {({ acceptedFiles, dragging }) => (
                <FileUpload.Dropzone
                  className={`border border-dashed border-gray-500 rounded-md flex flex-col items-center justify-center py-[30px] cursor-pointer transition-colors ${
                    dragging
                      ? "bg-brand border-brand"
                      : "bg-brand-bg-200 hover:bg-brand-bg-100"
                  }`}
                >
                  <FileUpload.Trigger>
                    <Upload className="w-[28px]" />
                  </FileUpload.Trigger>
                  {acceptedFiles.length > 0 ? (
                    <FileUpload.ItemGroup>
                      {acceptedFiles.map((file) => (
                        <FileUpload.Item
                          key={file.name}
                          file={file}
                          className="file-item"
                        >
                          <FileUpload.ItemName />
                        </FileUpload.Item>
                      ))}
                    </FileUpload.ItemGroup>
                  ) : (
                    "Click to upload or drag and drop"
                  )}
                  <p className="text-[13px] text-gray-400">
                    {acceptedFiles.length > 0
                      ? "Click to replace"
                      : "PDF, DOC up to 10MB"}
                  </p>
                </FileUpload.Dropzone>
              )}
            </FileUpload.Context>
            <FileUpload.HiddenInput />
          </FileUpload.Root>

          {/* Buttons */}
          <div className="font-inter text-[14px] flex justify-between pt-5">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-brand-bg-100 text-black py-[16px] px-[35px] rounded-2xl border border-gray-200 hover:bg-brand-shadow cursor-pointer"
            >
              Next
            </button>
            <button
              type="submit"
              className="bg-brand text-brand-white py-[16px] px-[35px] rounded-2xl border border-gray-200 hover:bg-orange-300 cursor-pointer"
            >
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
