"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPinned, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { BranchBussDetailsForm } from "@/features/branch-registration/components/branchBussDetailsForm";
import { createOrUpdateEateryBusinessDetails } from "@/lib/api/eatery";
import { getCuisines, getFoodCategories } from "@/lib/api/recipe";
import { getAmenities, getWorkingDays, type TableData, type WorkingHourData } from "@/lib/api/eatery";
import type { Cuisine, FoodCategory } from "@/lib/api/recipe";
import type { Amenity, WorkingDay } from "@/lib/api/eatery";

interface BusinessDetailsFormProps {
  onPrevious?: () => void;
  onSave?: (data: any) => void;
  eateryAlias?: string;
}

// Helper function to format time from Date to "HH:MM AM/PM" format
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Helper function to map day names to working day aliases
const mapDayToAlias = (dayName: string): string => {
  const dayMap: { [key: string]: string } = {
    Sunday: "wk.sunday",
    Monday: "wk.monday",
    Tuesday: "wk.tueday",
    Wednesday: "wk.wednesday",
    Thursday: "wk.thursday",
    Friday: "wk.friday",
    Saturday: "wk.saturday",
  };
  return dayMap[dayName] || dayName.toLowerCase();
};

// Helper function to map category name to food category alias
const mapCategoryToAlias = (categoryName: string): string => {
  const categoryMap: { [key: string]: string } = {
    Veg: "food.veg",
    "Non-Veg": "food.non",
  };
  return categoryMap[categoryName] || categoryName.toLowerCase();
};

export function BusinessDetailsForm({ 
  onPrevious = () => {}, 
  onSave = () => {},
  eateryAlias = ""
}: BusinessDetailsFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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

  // Fetch all data from APIs
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) return;

      setIsLoadingData(true);
      try {
        // Fetch all data in parallel
        const [cuisinesRes, foodCategoriesRes, amenitiesRes, workingDaysRes] = await Promise.all([
          getCuisines(token),
          getFoodCategories(token),
          getAmenities(token),
          getWorkingDays(token),
        ]);

        if (cuisinesRes.success && cuisinesRes.data) {
          setCuisines(cuisinesRes.data);
        }

        if (foodCategoriesRes.success && foodCategoriesRes.data) {
          setFoodCategories(foodCategoriesRes.data);
        }

        if (amenitiesRes.success && amenitiesRes.data) {
          setAmenities(amenitiesRes.data);
        }

        if (workingDaysRes.success && workingDaysRes.data) {
          setWorkingDays(workingDaysRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load form data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [token]);

  // Validate eateryAlias
  useEffect(() => {
    if (!eateryAlias) {
      toast.error("Eatery alias not found. Please complete previous steps first.");
    }
  }, [eateryAlias]);

  const collectFormData = () => {
    if (!containerRef.current) return null;

    const form = containerRef.current.querySelector('form') as HTMLFormElement;
    if (!form) {
      console.error("[BusinessDetailsForm] Form not found");
      return null;
    }

    console.log("[BusinessDetailsForm] Collecting form data from form:", form);

    // Create FormData to capture all form inputs including hidden inputs from Ark UI
    const formDataObj = new FormData(form);
    console.log("[BusinessDetailsForm] FormData entries:");
    for (const [key, value] of formDataObj.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, { name: (value as File).name, size: (value as File).size });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Get UPI ID - direct input field
    const upiIdInput = form.querySelector('input[name="upi-id"], input[id="upi-id"]') as HTMLInputElement;
    const upiId = upiIdInput?.value || "";
    console.log("[BusinessDetailsForm] UPI ID:", upiId);

    // Get description - textarea - try multiple selectors
    // First try FormData
    let description = (formDataObj.get('description') as string)?.trim() || "";
    
    // If not found in FormData, try DOM query
    if (!description) {
      let descriptionTextarea = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      if (!descriptionTextarea) {
        // Try finding by placeholder or nearby label
        descriptionTextarea = Array.from(form.querySelectorAll('textarea')).find(ta => {
          const placeholder = ta.getAttribute('placeholder') || '';
          const label = ta.closest('div')?.querySelector('label')?.textContent || '';
          return placeholder.toLowerCase().includes('describe') || 
                 placeholder.toLowerCase().includes('restaurant') ||
                 label.toLowerCase().includes('description');
        }) as HTMLTextAreaElement;
      }
      // If still not found, try to find any textarea after the description label
      if (!descriptionTextarea) {
        const allLabels = Array.from(form.querySelectorAll('label'));
        const descriptionLabel = allLabels.find(label => label.textContent?.toLowerCase().includes('description'));
        if (descriptionLabel) {
          const parentDiv = descriptionLabel.closest('div');
          descriptionTextarea = parentDiv?.querySelector('textarea') as HTMLTextAreaElement;
        }
      }
      description = descriptionTextarea?.value?.trim() || "";
    }
    
    console.log("[BusinessDetailsForm] Description:", description ? `${description.substring(0, 50)}...` : "empty");

    // Get selected food category (from radio group)
    // Find checked radio button in RadioGroup
    const radioButtons = form.querySelectorAll('input[type="radio"]');
    let selectedCategory = "";
    radioButtons.forEach((radio) => {
      if ((radio as HTMLInputElement).checked) {
        selectedCategory = (radio as HTMLInputElement).value;
      }
    });
    console.log("[BusinessDetailsForm] Selected category:", selectedCategory);
    
    let foodCategoryAlias = "";
    if (selectedCategory) {
      const foodCategory = foodCategories.find(fc => fc.category === selectedCategory || fc.alias === selectedCategory);
      if (foodCategory) {
        foodCategoryAlias = foodCategory.alias;
      } else {
        foodCategoryAlias = mapCategoryToAlias(selectedCategory);
      }
    }
    console.log("[BusinessDetailsForm] Food category alias:", foodCategoryAlias);

    // Get selected cuisines (from checkbox group)
    // First, try to get from FormData (hidden inputs from Ark UI)
    const selectedCuisines: string[] = [];
    const cuisineValuesFromFormData = formDataObj.getAll('cuisine') as string[];
    
    if (cuisineValuesFromFormData.length > 0) {
      console.log("[BusinessDetailsForm] Found cuisine values from FormData:", cuisineValuesFromFormData);
      cuisineValuesFromFormData.forEach((value) => {
        const cuisine = cuisines.find(c => c.cuisine === value || c.alias === value);
        if (cuisine) {
          selectedCuisines.push(cuisine.alias);
        } else if (value.includes('.') || value.startsWith('cucn.')) {
          selectedCuisines.push(value);
        }
      });
    }
    
    // Also find all checked checkboxes in the cuisines section
    // First, try to find the cuisines section by looking for the heading
    const allSections = Array.from(form.querySelectorAll('div'));
    const cuisineSection = allSections.find(div => {
      const h3 = div.querySelector('h3');
      const text = h3?.textContent?.toLowerCase() || '';
      return text.includes('cuisines') || text.includes('cuisine');
    });
    
    console.log("[BusinessDetailsForm] Cuisine section found:", !!cuisineSection);
    console.log("[BusinessDetailsForm] Cuisines from FormData:", selectedCuisines);
    
    // If we already have cuisines from FormData, skip DOM extraction
    if (selectedCuisines.length === 0 && cuisineSection) {
      // Find all checkboxes and checkbox roots in this section
      const allCheckboxes = cuisineSection.querySelectorAll('input[type="checkbox"]');
      console.log("[BusinessDetailsForm] Found checkboxes in cuisine section:", allCheckboxes.length);
      
      // Also find checkbox roots to check their data-state attribute
      const checkboxRoots = cuisineSection.querySelectorAll('[data-state], [class*="Checkbox"]');
      console.log("[BusinessDetailsForm] Found checkbox roots:", checkboxRoots.length);
      
      allCheckboxes.forEach((checkbox, index) => {
        const checkboxEl = checkbox as HTMLInputElement;
        let isChecked = checkboxEl.checked;
        
        // Also check the parent checkbox root for data-state
        const checkboxRoot = checkboxEl.closest('[data-state], [class*="Checkbox"]');
        if (checkboxRoot) {
          const dataState = checkboxRoot.getAttribute('data-state');
          if (dataState === 'checked') {
            isChecked = true;
          }
        }
        
        const checkboxValue = checkboxEl.value || '';
        
        // If no value, try to get from the label text
        let cuisineName = checkboxValue;
        if (!cuisineName) {
          const checkboxItem = checkboxEl.closest('[class*="Checkbox"]');
          const label = checkboxItem?.querySelector('label')?.textContent?.trim();
          if (label) {
            cuisineName = label;
          }
        }
        
        console.log(`[BusinessDetailsForm] Checkbox ${index}: checked=${isChecked}, value="${checkboxValue}", name="${cuisineName}"`);
        
        if (isChecked && cuisineName) {
          // Try to find cuisine by name
          const cuisine = cuisines.find(c => {
            const cuisineNameLower = c.cuisine.toLowerCase();
            const nameLower = cuisineName.toLowerCase();
            return cuisineNameLower === nameLower || 
                   cuisineNameLower.includes(nameLower) || 
                   nameLower.includes(cuisineNameLower) ||
                   c.alias === cuisineName ||
                   c.alias === checkboxValue;
          });
          
          if (cuisine) {
            selectedCuisines.push(cuisine.alias);
            console.log(`[BusinessDetailsForm] Added cuisine alias: ${cuisine.alias} (found by name: ${cuisineName})`);
          } else {
            // If not found in API data, try to use the value directly if it looks like an alias
            if (checkboxValue && (checkboxValue.includes('.') || checkboxValue.startsWith('cucn.'))) {
              selectedCuisines.push(checkboxValue);
              console.log(`[BusinessDetailsForm] Added cuisine value directly as alias: ${checkboxValue}`);
            } else if (cuisineName) {
              // Last resort: try to map common cuisine names to expected aliases
              const cuisineNameLower = cuisineName.toLowerCase();
              let mappedAlias = '';
              
              // Common mappings
              if (cuisineNameLower.includes('north indian')) mappedAlias = 'cucn.north_indian';
              else if (cuisineNameLower.includes('south indian')) mappedAlias = 'cucn.south';
              else if (cuisineNameLower.includes('chinese')) mappedAlias = 'cucn.chinese';
              else if (cuisineNameLower.includes('italian')) mappedAlias = 'cucn.italian';
              else if (cuisineNameLower.includes('continental')) mappedAlias = 'cucn.continental';
              else if (cuisineNameLower.includes('fast food')) mappedAlias = 'cucn.fast_food';
              else if (cuisineNameLower.includes('beverages')) mappedAlias = 'cucn.beverages';
              else if (cuisineNameLower.includes('desserts')) mappedAlias = 'cucn.desserts';
              
              if (mappedAlias) {
                selectedCuisines.push(mappedAlias);
                console.log(`[BusinessDetailsForm] Mapped cuisine name "${cuisineName}" to alias: ${mappedAlias}`);
              } else {
                console.warn(`[BusinessDetailsForm] Could not find or map cuisine for: ${cuisineName}`);
              }
            }
          }
        }
      });
      
      // If still no cuisines found, try looking for hidden inputs
      if (selectedCuisines.length === 0) {
        const hiddenInputs = cuisineSection.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach((input) => {
          const value = (input as HTMLInputElement).value;
          if (value && (value.includes('.') || value.startsWith('cucn.'))) {
            selectedCuisines.push(value);
          }
        });
      }
    }
    
    console.log("[BusinessDetailsForm] Selected cuisines:", selectedCuisines);

    // Get profile image (first FileUpload - Profile Photo section)
    const profilePhotoSection = Array.from(form.querySelectorAll('div')).find(div => {
      const label = div.querySelector('label');
      return label?.textContent?.includes('Profile Photo');
    });
    const profileImageInput = profilePhotoSection?.querySelector('input[type="file"]') as HTMLInputElement;
    const profileImage = profileImageInput?.files?.[0] || null;

    // Get cover image (second FileUpload - Cover Photo section)
    const coverPhotoSection = Array.from(form.querySelectorAll('div')).find(div => {
      const label = div.querySelector('label');
      return label?.textContent?.includes('Cover Photo');
    });
    const coverImageInput = coverPhotoSection?.querySelector('input[type="file"]') as HTMLInputElement;
    const coverImage = coverImageInput?.files?.[0] || null;

    // Get selected amenities (from checkbox group)
    const selectedAmenities: string[] = [];
    const amenitiesSection = Array.from(form.querySelectorAll('div')).find(div => {
      const h3 = div.querySelector('h3');
      return h3?.textContent?.includes('Amenities');
    });
    
    if (amenitiesSection) {
      const amenityCheckboxes = amenitiesSection.querySelectorAll('input[type="checkbox"]');
      amenityCheckboxes.forEach((checkbox) => {
        if ((checkbox as HTMLInputElement).checked) {
          const checkboxValue = (checkbox as HTMLInputElement).value;
          // Find amenity by name and get alias
          const amenity = amenities.find(a => 
            a.amenity.toLowerCase() === checkboxValue.toLowerCase() || 
            a.alias === checkboxValue
          );
          if (amenity) {
            selectedAmenities.push(amenity.alias);
          }
        }
      });
    }

    // Get table data - collect all table rows
    const tables: TableData[] = [];
    const tableSection = Array.from(form.querySelectorAll('div')).find(div => {
      const h3 = div.querySelector('h3');
      return h3?.textContent?.includes('Table Setup');
    });
    
    if (tableSection) {
      // Find all table rows (grid with table name and capacity inputs)
      const tableRows = tableSection.querySelectorAll('[class*="grid"] > [class*="col-span-12"]');
      tableRows.forEach((row) => {
        const nameInput = row.querySelector('input[type="text"]') as HTMLInputElement;
        const capacityInput = row.querySelector('input[type="number"]') as HTMLInputElement;
        if (nameInput && capacityInput && nameInput.value && capacityInput.value) {
          // Skip if it's a duplicate (same row might be selected multiple times)
          const existing = tables.find(t => t.name === nameInput.value && t.capacity === parseInt(capacityInput.value));
          if (!existing) {
            tables.push({
              name: nameInput.value,
              capacity: parseInt(capacityInput.value) || 0,
            });
          }
        }
      });
    }

    // Get working hours - extract from RSuite TimePicker inputs
    const workingHours: WorkingHourData[] = [];
    const workingHoursSection = Array.from(form.querySelectorAll('div')).find(div => {
      const h3 = div.querySelector('h3');
      const text = h3?.textContent?.toLowerCase() || '';
      return text.includes('operating hours') || text.includes('working hours');
    });
    
    console.log("[BusinessDetailsForm] Working hours section found:", !!workingHoursSection);
    
    if (workingHoursSection) {
      // Try multiple selectors for time picker inputs
      let timePickerInputs = workingHoursSection.querySelectorAll('input.rs-picker-toggle-input');
      if (timePickerInputs.length === 0) {
        timePickerInputs = workingHoursSection.querySelectorAll('input[class*="rs-picker"]');
      }
      if (timePickerInputs.length === 0) {
        // Try to find by input with time-related attributes
        timePickerInputs = workingHoursSection.querySelectorAll('input[type="text"]');
      }
      
      console.log("[BusinessDetailsForm] Found time picker inputs:", timePickerInputs.length);
      
      // Working hours structure: for each day, there's an opening and closing time (2 TimePickers per day)
      // The structure is: [Day Name] [Open TimePicker] [Close TimePicker] (3 columns)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Find the grid container that has the working hours
      const hoursGrid = workingHoursSection.querySelector('[class*="grid"][class*="grid-cols-3"]') || 
                       workingHoursSection.querySelector('[class*="grid"]');
      
      if (hoursGrid) {
        // Get all rows in the grid (each row has: day name, open time, close time)
        const gridRows = Array.from(hoursGrid.children) as HTMLElement[];
        console.log(`[BusinessDetailsForm] Found ${gridRows.length} grid rows in working hours section`);
        
        dayNames.forEach((dayName, dayIndex) => {
          // Find the row that contains this day name
          const dayRow = gridRows.find((row, idx) => {
            const text = row.textContent || '';
            return text.includes(dayName);
          });
          
          if (dayRow) {
            console.log(`[BusinessDetailsForm] Found row for ${dayName}`);
            
            // The row structure: [Day Name] [Open TimePicker] [Close TimePicker]
            // Get all children of this row
            const rowChildren = Array.from(dayRow.children) as HTMLElement[];
            
            // First child should be day name, second should be open time, third should be close time
            // But we need to find the TimePicker components
            
            let openTime = '';
            let closeTime = '';
            
            // Find all TimePicker components in this row
            const timePickers = dayRow.querySelectorAll('.rs-picker, [class*="rs-picker"]');
            console.log(`[BusinessDetailsForm] Found ${timePickers.length} time pickers in row for ${dayName}`);
            
            timePickers.forEach((picker, idx) => {
              let timeValue = '';
              
              // Method 1: Check the toggle input value (most reliable)
              const allInputs = picker.querySelectorAll('input');
              allInputs.forEach((input) => {
                const value = (input as HTMLInputElement).value?.trim() || '';
                if (value && value !== '' && 
                    !value.includes('Select') && !value.includes('Choose') && 
                    (value.includes(':') || value.includes('AM') || value.includes('PM'))) {
                  if (!timeValue) {
                    timeValue = value;
                    console.log(`[BusinessDetailsForm] TimePicker ${idx} input value found: "${value}"`);
                  }
                }
              });
              
              // Method 2: Check the toggle button text content - get ALL text
              if (!timeValue) {
                const toggle = picker.querySelector('[class*="toggle"], button[class*="picker"], .rs-picker-toggle, button') as HTMLElement;
                if (toggle) {
                  // Get all text content from the toggle
                  const allText = toggle.innerText?.trim() || toggle.textContent?.trim() || '';
                  console.log(`[BusinessDetailsForm] TimePicker ${idx} toggle full text: "${allText}"`);
                  
                  // Try to extract time from the text (look for pattern like "10:00 AM" or "10:00")
                  const timeMatch = allText.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
                  if (timeMatch) {
                    const hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    const ampm = timeMatch[3] || (hours >= 12 ? 'PM' : 'AM');
                    const displayHours = hours % 12 || 12;
                    timeValue = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm.toUpperCase()}`;
                    console.log(`[BusinessDetailsForm] TimePicker ${idx} extracted time: "${timeValue}"`);
                  } else if (allText && (allText.includes(':') || allText.includes('AM') || allText.includes('PM')) && 
                      !allText.includes('Select') && !allText.includes('Choose') && 
                      !allText.includes('Opens at') && !allText.includes('Closes at') &&
                      !allText.includes('--') && /\d/.test(allText)) {
                    // If no match but looks like time, use as-is
                    timeValue = allText;
                    console.log(`[BusinessDetailsForm] TimePicker ${idx} using text as time: "${timeValue}"`);
                  }
                }
              }
              
              // Method 3: Check all text content in the picker (including nested elements)
              if (!timeValue) {
                const allText = picker.textContent?.trim() || (picker instanceof HTMLElement ? picker.innerText?.trim() : '') || '';
                console.log(`[BusinessDetailsForm] TimePicker ${idx} all text: "${allText}"`);
                
                // Extract time from any text in the picker
                const timeMatch = allText.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
                if (timeMatch) {
                  const hours = parseInt(timeMatch[1]);
                  const minutes = parseInt(timeMatch[2]);
                  const ampm = timeMatch[3] || (hours >= 12 ? 'PM' : 'AM');
                  const displayHours = hours % 12 || 12;
                  timeValue = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm.toUpperCase()}`;
                  console.log(`[BusinessDetailsForm] TimePicker ${idx} extracted time from all text: "${timeValue}"`);
                }
              }
              
              // Method 4: Check aria-label or title attribute
              if (!timeValue) {
                const toggle = picker.querySelector('[class*="toggle"], button') as HTMLElement;
                if (toggle) {
                  const ariaLabel = toggle.getAttribute('aria-label') || '';
                  const title = toggle.getAttribute('title') || '';
                  const placeholder = toggle.getAttribute('placeholder') || '';
                  
                  if (ariaLabel && (ariaLabel.includes(':') || ariaLabel.includes('AM') || ariaLabel.includes('PM'))) {
                    timeValue = ariaLabel;
                  } else if (title && (title.includes(':') || title.includes('AM') || title.includes('PM'))) {
                    timeValue = title;
                  } else if (placeholder && (placeholder.includes(':') || placeholder.includes('AM') || placeholder.includes('PM'))) {
                    timeValue = placeholder;
                  }
                }
              }
              
              // Assign to open or close time based on index
              if (timeValue) {
                if (idx === 0 || !openTime) {
                  openTime = timeValue;
                } else if (idx === 1 || !closeTime) {
                  closeTime = timeValue;
                }
              } else {
                console.warn(`[BusinessDetailsForm] TimePicker ${idx} - Could not extract time value`);
              }
            });
            
            console.log(`[BusinessDetailsForm] Day: ${dayName}, Open: "${openTime}", Close: "${closeTime}"`);
            
            // Check if times are valid (not empty, not placeholder text)
            const isValidTime = (time: string): boolean => {
              if (!time || time.trim() === '') return false;
              const timeLower = time.toLowerCase();
              // Exclude placeholder/empty states
              if (timeLower.includes('select') || timeLower.includes('choose') || 
                  timeLower.includes('--') || timeLower === 'none' || timeLower === '') {
                return false;
              }
              // Must contain a colon (time format)
              if (!time.includes(':')) return false;
              // Should have some digits
              if (!/\d/.test(time)) return false;
              return true;
            };
            
            // Only add if both times are set and valid
            if (isValidTime(openTime) && isValidTime(closeTime)) {
              // Format time to "HH:MM AM/PM" format if needed
              let formattedOpenTime = openTime.trim();
              let formattedCloseTime = closeTime.trim();
              
              // If time is in 24-hour format (HH:MM), convert to 12-hour format (HH:MM AM/PM)
              const formatTime = (timeStr: string): string => {
                // Remove any whitespace
                timeStr = timeStr.trim();
                
                // If already in 12-hour format with AM/PM, return as is (might need cleanup)
                if (timeStr.includes('AM') || timeStr.includes('PM')) {
                  // Clean up any extra spaces or formatting - ensure format is "H:MM AM/PM"
                  let cleaned = timeStr.replace(/\s+/g, ' ').trim();
                  // Extract time and AM/PM parts
                  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                  if (timeMatch) {
                    const hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    const ampm = timeMatch[3].toUpperCase();
                    const displayHours = hours % 12 || 12;
                    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                  }
                  return cleaned;
                }
                
                // Try to parse as 24-hour format (HH:MM or H:MM)
                const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
                if (match) {
                  const hours = parseInt(match[1]);
                  const minutes = parseInt(match[2]);
                  
                  if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                  }
                }
                
                return timeStr; // Return as-is if can't parse
              };
              
              formattedOpenTime = formatTime(formattedOpenTime);
              formattedCloseTime = formatTime(formattedCloseTime);
              
              // Add if both times are valid
              if (formattedOpenTime && formattedCloseTime) {
                workingHours.push({
                  day: mapDayToAlias(dayName),
                  start_time: formattedOpenTime,
                  end_time: formattedCloseTime,
                });
                console.log(`[BusinessDetailsForm] ✅ Added working hours for ${dayName}: ${formattedOpenTime} - ${formattedCloseTime}`);
              }
            } else {
              console.warn(`[BusinessDetailsForm] ⚠️ Skipping ${dayName} - invalid times: open="${openTime}", close="${closeTime}"`);
            }
          }
        });
        
        // Fallback: If we still don't have any working hours, try sequential access from timePickerInputs
        if (workingHours.length === 0 && timePickerInputs.length > 0) {
          console.log("[BusinessDetailsForm] Trying fallback method to get working hours...");
          dayNames.forEach((dayName, dayIndex) => {
            const openTimeInput = timePickerInputs[dayIndex * 2] as HTMLInputElement;
            const closeTimeInput = timePickerInputs[dayIndex * 2 + 1] as HTMLInputElement;
            
            if (openTimeInput && closeTimeInput) {
              const openTime = openTimeInput.value?.trim() || '';
              const closeTime = closeTimeInput.value?.trim() || '';
              
              if (openTime && closeTime && openTime !== '' && closeTime !== '') {
                let formattedOpenTime = openTime;
                let formattedCloseTime = closeTime;
                
                // Format if needed
                if (!formattedOpenTime.includes('AM') && !formattedOpenTime.includes('PM')) {
                  const match = formattedOpenTime.match(/^(\d{1,2}):(\d{2})$/);
                  if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    formattedOpenTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                  }
                }
                
                if (!formattedCloseTime.includes('AM') && !formattedCloseTime.includes('PM')) {
                  const match = formattedCloseTime.match(/^(\d{1,2}):(\d{2})$/);
                  if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    formattedCloseTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                  }
                }
                
                // Only add if not midnight for both
                if (!(formattedOpenTime === '12:00 AM' && formattedCloseTime === '12:00 AM')) {
                  workingHours.push({
                    day: mapDayToAlias(dayName),
                    start_time: formattedOpenTime,
                    end_time: formattedCloseTime,
                  });
                  console.log(`[BusinessDetailsForm] ✅ Added working hours for ${dayName} (fallback): ${formattedOpenTime} - ${formattedCloseTime}`);
                }
              }
            }
          });
        }
      }
    }
    
    console.log("[BusinessDetailsForm] Collected working hours:", workingHours);

    // Get first order discount (from switch in Promotions section)
    let firstOrderDiscount = 0;
    const promotionsSection = Array.from(form.querySelectorAll('div')).find(div => {
      const h3 = div.querySelector('h3');
      return h3?.textContent?.includes('Promotions');
    });
    
    if (promotionsSection) {
      const discountSwitch = promotionsSection.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (discountSwitch?.checked) {
        firstOrderDiscount = 1;
      }
    }

    return {
      upiId,
      foodCategoryAlias,
      selectedCuisines,
      profileImage,
      coverImage,
      description,
      selectedAmenities,
      tables,
      workingHours,
      firstOrderDiscount,
    };
  };

  const handleSaveAndContinue = async () => {
    if (!eateryAlias) {
      toast.error("Eatery alias not found. Please complete previous steps first.");
      return;
    }

    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[BusinessDetailsForm] Form submission started...");

      // Collect form data
      const formData = collectFormData();
      if (!formData) {
        toast.error("Failed to collect form data");
        setIsSubmitting(false);
        return;
      }

      console.log("[BusinessDetailsForm] Collected form data:", {
        upiId: formData.upiId,
        foodCategoryAlias: formData.foodCategoryAlias,
        selectedCuisinesCount: formData.selectedCuisines?.length || 0,
        selectedCuisines: formData.selectedCuisines,
        hasProfileImage: !!formData.profileImage,
        hasCoverImage: !!formData.coverImage,
        description: formData.description,
        selectedAmenitiesCount: formData.selectedAmenities?.length || 0,
        selectedAmenities: formData.selectedAmenities,
        tablesCount: formData.tables?.length || 0,
        tables: formData.tables,
        workingHoursCount: formData.workingHours?.length || 0,
        workingHours: formData.workingHours,
        firstOrderDiscount: formData.firstOrderDiscount,
      });

      // Comprehensive form validation with informative error messages
      const validationErrors: string[] = [];

      // 1. Validate UPI ID (if provided, should be valid format)
      if (formData.upiId && formData.upiId.trim() !== "") {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiRegex.test(formData.upiId.trim())) {
          validationErrors.push("Please enter a valid UPI ID format (e.g., yourname@paytm)");
        }
      }

      // 2. Validate Food Category
      if (!formData.foodCategoryAlias || formData.foodCategoryAlias.trim() === "") {
        validationErrors.push("Please select a food category (Veg or Non-Veg)");
      }

      // 3. Validate Cuisines - at least one required
      if (!formData.selectedCuisines || formData.selectedCuisines.length === 0) {
        validationErrors.push("Please select at least one cuisine");
      }

      // 4. Validate Profile Image - required and between 1 MB and 2 MB
      if (!formData.profileImage) {
        validationErrors.push("Please upload a profile image");
      } else {
        const fileSizeBytes = formData.profileImage.size;
        const fileSizeMB = fileSizeBytes / (1024 * 1024);
        const minSizeMB = 1; // 1 MB = 1024 * 1024 bytes
        const maxSizeMB = 2; // 2 MB = 2 * 1024 * 1024 bytes
        const minSizeBytes = minSizeMB * 1024 * 1024;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (fileSizeBytes < minSizeBytes) {
          validationErrors.push(`Profile image must be at least ${minSizeMB} MB. Current size: ${fileSizeMB.toFixed(2)} MB`);
        } else if (fileSizeBytes > maxSizeBytes) {
          validationErrors.push(`Profile image must not exceed ${maxSizeMB} MB. Current size: ${fileSizeMB.toFixed(2)} MB`);
        }
      }

      // 5. Validate Cover Image - required and between 1 MB and 2 MB
      if (!formData.coverImage) {
        validationErrors.push("Please upload a cover image");
      } else {
        const fileSizeBytes = formData.coverImage.size;
        const fileSizeMB = fileSizeBytes / (1024 * 1024);
        const minSizeMB = 1; // 1 MB = 1024 * 1024 bytes
        const maxSizeMB = 2; // 2 MB = 2 * 1024 * 1024 bytes
        const minSizeBytes = minSizeMB * 1024 * 1024;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (fileSizeBytes < minSizeBytes) {
          validationErrors.push(`Cover image must be at least ${minSizeMB} MB. Current size: ${fileSizeMB.toFixed(2)} MB`);
        } else if (fileSizeBytes > maxSizeBytes) {
          validationErrors.push(`Cover image must not exceed ${maxSizeMB} MB. Current size: ${fileSizeMB.toFixed(2)} MB`);
        }
      }

      // 6. Validate Description - required and minimum length
      if (!formData.description || formData.description.trim() === "") {
        validationErrors.push("Please enter a description for your restaurant");
      } else if (formData.description.trim().length < 10) {
        validationErrors.push("Description must be at least 10 characters long");
      }

      // 7. Validate Amenities - optional but validate if provided
      // (No specific validation needed as amenities are optional)

      // 8. Validate Tables - if provided, should have valid data
      if (formData.tables && formData.tables.length > 0) {
        const invalidTables = formData.tables.filter(
          (table) => !table.name || table.name.trim() === "" || !table.capacity || table.capacity <= 0
        );
        if (invalidTables.length > 0) {
          validationErrors.push("Please ensure all tables have a valid name and capacity greater than 0");
        }
      }

      // 9. Validate Working Hours - at least one day required
      if (!formData.workingHours || formData.workingHours.length === 0) {
        validationErrors.push("Please set working hours for at least one day (select opening and closing times)");
      } else {
        // Validate that each working hour entry has valid times
        const invalidHours = formData.workingHours.filter(
          (hour) => !hour.start_time || !hour.end_time || hour.start_time.trim() === "" || hour.end_time.trim() === ""
        );
        if (invalidHours.length > 0) {
          validationErrors.push("Please ensure all working hours have valid opening and closing times");
        }
      }

      // 10. Validate First Order Discount - optional (no validation needed)

      // Show all validation errors
      if (validationErrors.length > 0) {
        // Show first error as toast, log all errors
        console.error("[BusinessDetailsForm] Validation errors:", validationErrors);
        toast.error(validationErrors[0]);
        
        // If there are multiple errors, show them all after a delay
        if (validationErrors.length > 1) {
          setTimeout(() => {
            validationErrors.slice(1).forEach((error, index) => {
              setTimeout(() => {
                toast.error(error, { duration: 3000 });
              }, (index + 1) * 500);
            });
          }, 500);
        }
        
        setIsSubmitting(false);
        return;
      }

      console.log("[BusinessDetailsForm] ✅ All validations passed");

      // Prepare API request data
      const requestData: any = {
        eatery_alias: eateryAlias,
        step_name: "business_details",
        // Required fields - always include
        cuisine: formData.selectedCuisines,
        description: formData.description.trim(),
        working_hours: formData.workingHours,
      };

      // Optional fields
      if (formData.upiId) {
        requestData.upi_id = formData.upiId;
      }

      if (formData.foodCategoryAlias) {
        requestData.food_category_alias = formData.foodCategoryAlias;
      }

      if (formData.profileImage) {
        requestData.eatery_profile_image = formData.profileImage;
      }

      if (formData.coverImage) {
        requestData.eatery_cover_image = formData.coverImage;
      }

      if (formData.selectedAmenities && formData.selectedAmenities.length > 0) {
        requestData.amenities = formData.selectedAmenities;
      }

      if (formData.tables && formData.tables.length > 0) {
        requestData.table = formData.tables;
      }

      if (formData.firstOrderDiscount !== undefined) {
        requestData.first_order_discount = formData.firstOrderDiscount;
      }

      console.log("[BusinessDetailsForm] Prepared submit data:", requestData);

      // Submit to API
      const response = await createOrUpdateEateryBusinessDetails(requestData, token);

      if (response.success && response.data) {
        toast.success(response.message || "Business details saved successfully!");
        onSave(response.data);
      } else {
        toast.error(response.message || "Failed to save business details");
      }
    } catch (error) {
      console.error("[BusinessDetailsForm] Error submitting form:", error);
      toast.error("Failed to save business details");
    } finally {
      setIsSubmitting(false);
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

  if (isLoadingData) {
    return (
      <div className="bg-white w-full rounded-[22px] p-5 shadow-md border border-orange-200 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

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
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Update"
          )}
        </button>
      </div>
    </div>
  );
}
