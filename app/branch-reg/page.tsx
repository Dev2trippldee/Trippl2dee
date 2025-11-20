"use client";

import { useState } from "react";
import { Navbar } from "@/features/home/components/navbar";
import { BranchesList } from "./components/branchesList";
import { BranchInformationForm } from "./components/branchInformationForm";
import { DocumentsForm } from "./components/documentsForm";
import { OrderDetailsForm } from "./components/orderDetailsForm";
import { BusinessDetailsForm } from "./components/businessDetailsForm";

type FormStep = "branch-info" | "documents" | "order-details" | "business-details";

export type BranchRegFormProps = {
  setStep: (step: number) => void;
};

export default function BranchRegPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>("branch-info");
  const [branchInfoData, setBranchInfoData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [orderDetailsData, setOrderDetailsData] = useState<any>(null);

  const handleBranchInfoSave = (data: any) => {
    // Save branch information data (dummy backend)
    console.log("Saving branch information to backend:", data);
    setBranchInfoData(data);
    // Move to documents form
    setCurrentStep("documents");
  };

  const handleDocumentsSave = (data: any) => {
    // Save documents data (dummy backend)
    console.log("Saving documents to backend:", data);
    setDocumentsData(data);
    // Move to order details form
    setCurrentStep("order-details");
  };

  const handleOrderDetailsSave = (data: any) => {
    // Save order details data (dummy backend)
    console.log("Saving order details to backend:", data);
    setOrderDetailsData(data);
    // Move to business details form
    setCurrentStep("business-details");
  };

  const handleBusinessDetailsSave = (data: any) => {
    // Save business details data (dummy backend)
    console.log("Saving business details to backend:", data);
    console.log("Complete registration data:", {
      branchInfo: branchInfoData,
      documents: documentsData,
      orderDetails: orderDetailsData,
      businessDetails: data,
    });
    // You can add navigation or success message here
    alert("Registration completed successfully!");
  };

  const handlePrevious = () => {
    if (currentStep === "documents") {
      setCurrentStep("branch-info");
    } else if (currentStep === "order-details") {
      setCurrentStep("documents");
    } else if (currentStep === "business-details") {
      setCurrentStep("order-details");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Same as home page */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Panel - Branches (1/4 width) */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <BranchesList />
          </div>

          {/* Right Panel - Forms (3/4 width) */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            {currentStep === "branch-info" ? (
              <BranchInformationForm onSave={handleBranchInfoSave} />
            ) : currentStep === "documents" ? (
              <DocumentsForm 
                onPrevious={handlePrevious} 
                onSave={handleDocumentsSave}
              />
            ) : currentStep === "order-details" ? (
              <OrderDetailsForm 
                onPrevious={handlePrevious} 
                onSave={handleOrderDetailsSave}
              />
            ) : (
              <BusinessDetailsForm 
                onPrevious={handlePrevious} 
                onSave={handleBusinessDetailsSave}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

