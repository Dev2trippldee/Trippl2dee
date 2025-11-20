"use client";

import { ArrowLeft, MapPinned } from "lucide-react";
import { BranchBussDetailsForm } from "@/features/branch-reg/components/branchBussDetailsForm";
import { useEffect, useRef } from "react";

interface BusinessDetailsFormProps {
  onPrevious?: () => void;
  onSave?: (data: any) => void;
}

export function BusinessDetailsForm({ 
  onPrevious = () => {}, 
  onSave = () => {} 
}: BusinessDetailsFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept form submission
    if (containerRef.current) {
      const form = containerRef.current.querySelector('form');
      if (form) {
        const handleFormSubmit = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Collect form data
          const formData = new FormData(form as HTMLFormElement);
          const data: any = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });
          
          console.log("Business details form submitted:", data);
          onSave(data);
        };

        form.addEventListener('submit', handleFormSubmit);
        
        return () => {
          form.removeEventListener('submit', handleFormSubmit);
        };
      }
    }
  }, [onSave]);

  const handleSaveAndContinue = () => {
    if (containerRef.current) {
      const form = containerRef.current.querySelector('form');
      if (form) {
        // Trigger form submission
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  useEffect(() => {
    // Apply styles to match DocumentsForm/OrderDetailsForm layout
    if (containerRef.current) {
      // Hide progress bar
      const progressBar = containerRef.current.querySelector('[role="progressbar"]');
      if (progressBar) {
        const progressContainer = progressBar.closest('div');
        if (progressContainer) {
          (progressContainer as HTMLElement).style.display = 'none';
        }
      }

      // Hide the original submit button
      const originalButton = containerRef.current.querySelector('button[type="submit"]');
      if (originalButton) {
        (originalButton as HTMLElement).style.display = 'none';
      }

      // Update the main container styling
      const mainContainer = containerRef.current.querySelector('.bg-brand-white');
      if (mainContainer) {
        (mainContainer as HTMLElement).style.background = 'transparent';
        (mainContainer as HTMLElement).style.border = 'none';
        (mainContainer as HTMLElement).style.borderRadius = '0';
        (mainContainer as HTMLElement).style.boxShadow = 'none';
        (mainContainer as HTMLElement).style.padding = '0';
      }

      // Update inner form container
      const formContainer = containerRef.current.querySelector('.p-\\[30px\\]');
      if (formContainer) {
        (formContainer as HTMLElement).style.padding = '0';
      }

      // Hide the original header
      const originalHeader = containerRef.current.querySelector('.text-brand.flex.justify-start');
      if (originalHeader && originalHeader.textContent?.includes('Business Details')) {
        (originalHeader as HTMLElement).style.display = 'none';
      }
    }
  }, []);

  return (
    <div className="bg-white w-full rounded-[22px] p-3 md:p-5 shadow-md border border-orange-200">
      {/* Header - matching DocumentsForm style */}
      <div className="mb-5 flex items-center gap-2">
        <MapPinned className="w-6 h-6 text-brand" />
        <h1 className="text-[19px] md:text-[24px] font-semibold text-brand">
          Business Details
        </h1>
      </div>

      <div ref={containerRef} className="relative">
        <BranchBussDetailsForm />
      </div>

      {/* Custom buttons to match the pattern */}
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
          type="button"
          onClick={handleSaveAndContinue}
          className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
        >
          Update
        </button>
      </div>
    </div>
  );
}

