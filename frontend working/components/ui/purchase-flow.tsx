'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, CreditCard, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCustomToast } from '@/hooks/use-custom-toast'

interface PurchaseFlowProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    price?: number
    location: string
    donationType?: 'free' | 'sell'
  }
}

export function PurchaseFlow({ isOpen, onClose, item }: PurchaseFlowProps) {
  const router = useRouter()
  const { showSuccess } = useCustomToast()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const totalSteps = item.donationType === 'sell' ? 3 : 2
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Final step
      if (item.donationType === 'sell' && item.price) {
        // For items that are for sale, redirect to payment page
        router.push(`/payment?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}&price=${item.price}`)
        onClose()
      } else {
        // For free items, show success and close
        setIsProcessing(true)
        setTimeout(() => {
          setIsProcessing(false)
          onClose()
          showSuccess(
            'Request Successful!', 
            `Your request for "${item.name}" has been sent to the donor.`
          )
        }, 1500)
      }
    }
  }
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 1 && 'Confirm Pickup Location'}
            {step === 2 && item.donationType === 'sell' && 'Review Purchase'}
            {step === 2 && item.donationType === 'free' && 'Confirm Request'}
            {step === 3 && 'Payment Method'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 === step ? 'bg-[#4CAF50] text-white' : index + 1 < step ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {index + 1 < step ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-10 h-1 ${index + 1 < step ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Step 1: Pickup Location */}
        {step === 1 && (
          <div className="py-4">
            <div className="flex items-start mb-4">
              <MapPin className="w-5 h-5 text-[#4CAF50] mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Pickup Location</h3>
                <p className="text-gray-600 text-sm">{item.location}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You'll need to pick up this item from the location shown above. Are you able to pick up from this location?
            </p>
          </div>
        )}
        
        {/* Step 2: Review */}
        {step === 2 && (
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Item Details</h3>
              <p className="text-gray-800 font-medium">{item.name}</p>
              {item.donationType === 'sell' && item.price && (
                <p className="text-[#4CAF50] font-medium">${item.price.toFixed(2)}</p>
              )}
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{item.location}</span>
              </div>
            </div>
            
            {item.donationType === 'sell' ? (
              <p className="text-sm text-gray-600">
                By proceeding, you agree to purchase this item. You'll be redirected to complete your payment.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                By confirming, you're requesting this item. The donor will be notified of your interest.
              </p>
            )}
          </div>
        )}
        
        {/* Step 3: Payment Method (only for items for sale) */}
        {step === 3 && item.donationType === 'sell' && (
          <div className="py-4">
            <div className="flex items-start mb-4">
              <CreditCard className="w-5 h-5 text-[#4CAF50] mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Payment Information</h3>
                <p className="text-gray-600 text-sm">You'll be redirected to our secure payment page to complete your purchase.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Item Price:</span>
                <span className="font-medium">${item.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-medium">${item.price?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={handleNext} 
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : (
              step === totalSteps ? (
                item.donationType === 'sell' ? 'Proceed to Payment' : 'Confirm Request'
              ) : 'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}