'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Upload, X, Loader2, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api-client"

interface WizardData {
  title: string;
  category: string;
  subcategory: string;
  condition: string;
  description: string;
  quantity: number;
  handoverPreference: string;
  location: string;
  availability: string;
  images: File[];
  donationType: "free" | "sell";
  price: string;
}

const CATEGORIES = ["Clothing", "Shoes", "Books", "Toys", "Electronics", "Household Items", "Furniture", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Worn", "Needs Repair"];
const HANDOVER_OPTIONS = ["Direct pickup from home", "Drop-off at NGO", "Community drive"];

export default function AddItemWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  
  // Try to load draft from localStorage on mount
  const [data, setData] = useState<WizardData>({
    title: "",
    category: "",
    subcategory: "",
    condition: "",
    description: "",
    quantity: 1,
    handoverPreference: "Direct pickup from home",
    location: "",
    availability: "",
    images: [],
    donationType: "free",
    price: "",
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem("draft:listing");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Files can't be stored in localStorage, so reset images array
        setData({ ...parsed, images: [] });
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save draft on every change, omitting File objects
    const draft = { ...data, images: [] };
    localStorage.setItem("draft:listing", JSON.stringify(draft));
  }, [data]);

  const updateData = (field: keyof WizardData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setData((prev) => ({ ...prev, images: [...prev.images, ...files].slice(0, 3) }))
  };

  const removeImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  };

  const classifyConditionWithAI = async () => {
    if (!data.description || !data.category) return;
    setAiLoading(true);
    setAiError("");
    try {
      const response = await apiRequest<{ condition: string, isMock: boolean }>('/ai/classify-condition', {
        method: 'POST',
        body: { description: data.description, category: data.category }
      });
      updateData("condition", response.condition);
    } catch (err: any) {
      setAiError(err.message || "Failed to classify condition");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (data.donationType === "sell" && (!data.price || parseFloat(data.price) <= 0)) {
      alert("Please enter a valid price.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // For demo purposes, we skip real image upload and use a placeholder
      // In production, we'd upload each File to Cloudinary
      const imageUrls = data.images.length > 0 
        ? ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"] 
        : [];

      await apiRequest('/items', {
        method: 'POST',
        body: {
          name: data.title,
          category: data.category,
          subcategory: data.subcategory,
          condition: data.condition,
          description: data.description,
          quantity: data.quantity,
          handoverPreference: data.handoverPreference,
          availability: data.availability,
          location: data.location,
          donationType: data.donationType,
          price: data.donationType === "sell" ? parseFloat(data.price) : undefined,
          images: imageUrls
        }
      });

      localStorage.removeItem("draft:listing");
      alert("Item listed successfully!");
      router.push('/dashboard/donor');
    } catch (error: any) {
      alert(error.message || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/donor" className="flex items-center space-x-2 text-gray-600 hover:text-[#A7D129] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-[#A7D129] rounded-lg flex items-center justify-center">
              <Heart className="w-3 h-3 text-slate-900" />
            </div>
            <span className="font-bold text-slate-900">ShareGoods</span>
          </div>
          <div className="text-sm text-gray-500 font-medium">Step {step} of 6</div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div 
            className="h-1 bg-gradient-to-r from-emerald-500 to-[#A7D129] transition-all duration-300 ease-out" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            
            {/* STEP 1: Category & Title */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">What are you sharing?</h2>
                  <p className="text-gray-500 text-sm mt-1">Start by choosing a broad category and giving it a name.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => updateData("category", cat)}
                          className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${
                            data.category === cat 
                              ? 'border-[#A7D129] bg-[#A7D129]/10 text-slate-900 ring-1 ring-[#A7D129]' 
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => updateData("title", e.target.value)}
                      placeholder="e.g. Vintage Denim Jacket"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Description & Subcategory */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Add a sub-category and describe the item.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
                    <input
                      type="text"
                      value={data.subcategory}
                      onChange={(e) => updateData("subcategory", e.target.value)}
                      placeholder="e.g. Men's Coats"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={data.description}
                      onChange={(e) => updateData("description", e.target.value)}
                      placeholder="Size, brand, history, reasons for giving away..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Condition & Photos */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Photos & Condition</h2>
                  <p className="text-gray-500 text-sm mt-1">Upload up to 3 photos. Let our AI suggest the condition based on your description.</p>
                </div>
                
                <div className="space-y-6">
                  {/* AI Classification Block */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A7D129]" />
                        Item Condition
                      </label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={classifyConditionWithAI}
                        disabled={aiLoading || !data.description}
                        className="text-xs h-8"
                      >
                        {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                        Auto-detect
                      </Button>
                    </div>
                    {aiError && <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {aiError}</p>}
                    
                    <select
                      value={data.condition}
                      onChange={(e) => updateData("condition", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129] focus:border-transparent bg-white"
                    >
                      <option value="" disabled>Select condition...</option>
                      {CONDITIONS.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos (Max 3)</label>
                    <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                      {data.images.map((file, idx) => (
                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {data.images.length < 3 && (
                        <label className="w-24 h-24 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#A7D129] hover:text-[#A7D129] hover:bg-[#A7D129]/5 cursor-pointer transition-colors">
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Add Photo</span>
                          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Quantity & Pricing */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Quantity & Terms</h2>
                  <p className="text-gray-500 text-sm mt-1">Are you giving this away or selling it for a small fee?</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={data.quantity}
                      onChange={(e) => updateData("quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${data.donationType === 'free' ? 'border-[#A7D129] bg-[#A7D129]/10 text-slate-900' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="donationType"
                          checked={data.donationType === "free"}
                          onChange={() => updateData("donationType", "free")}
                          className="text-[#A7D129] focus:ring-[#A7D129]"
                        />
                        <span className="font-medium text-sm">Free Donation</span>
                      </label>
                      <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${data.donationType === 'sell' ? 'border-[#A7D129] bg-[#A7D129]/10 text-slate-900' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="donationType"
                          checked={data.donationType === "sell"}
                          onChange={() => updateData("donationType", "sell")}
                          className="text-[#A7D129] focus:ring-[#A7D129]"
                        />
                        <span className="font-medium text-sm">For Sale</span>
                      </label>
                    </div>
                  </div>

                  {data.donationType === "sell" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => updateData("price", e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Handover */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Handover Preference</h2>
                  <p className="text-gray-500 text-sm mt-1">How would you like to pass this item to the recipient?</p>
                </div>
                
                <div className="space-y-3">
                  {HANDOVER_OPTIONS.map(opt => (
                    <label key={opt} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${data.handoverPreference === opt ? 'border-[#A7D129] bg-[#A7D129]/5 ring-1 ring-[#A7D129]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="handoverPreference"
                        checked={data.handoverPreference === opt}
                        onChange={() => updateData("handoverPreference", opt)}
                        className="mt-1 text-[#A7D129] focus:ring-[#A7D129]"
                      />
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{opt}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {opt === 'Direct pickup from home' && "Recipient comes to your location to pick it up."}
                          {opt === 'Drop-off at NGO' && "You'll drop it at a verified partner NGO center."}
                          {opt === 'Community drive' && "Bring it to the next scheduled community event."}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Location & Availability */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Logistics</h2>
                  <p className="text-gray-500 text-sm mt-1">Final details so people know where and when to reach you.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">General Location (City, Area)</label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => updateData("location", e.target.value)}
                      placeholder="e.g. Downtown Seattle"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129]"
                    />
                    <p className="text-xs text-gray-500 mt-1">For safety, exact address will only be shared when a match is confirmed.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability Window</label>
                    <textarea
                      value={data.availability}
                      onChange={(e) => updateData("availability", e.target.value)}
                      placeholder="e.g. Weekday evenings after 6 PM, weekends anytime"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A7D129]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
          
          {/* Footer Navigation */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || isSubmitting}
              className="w-24 text-gray-600"
            >
              Back
            </Button>
            
            {step < 6 ? (
              <Button 
                onClick={nextStep}
                className="w-24 bg-[#A7D129] hover:bg-[#8eb822] text-slate-900 font-bold"
                disabled={
                  (step === 1 && (!data.category || !data.title)) ||
                  (step === 2 && (!data.description))
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !data.location}
                className="bg-[#A7D129] hover:bg-[#8eb822] text-slate-900 font-bold shadow-md px-6"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                ) : "Publish Listing"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
