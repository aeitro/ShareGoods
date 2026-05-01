import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "approved":
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "matched":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-gray-100 text-gray-800"
    case "declined":
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending Review"
    case "approved":
      return "Approved"
    case "matched":
      return "Matched"
    case "confirmed":
      return "Confirmed"
    case "completed":
      return "Completed"
    case "declined":
      return "Declined"
    case "cancelled":
      return "Cancelled"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}
