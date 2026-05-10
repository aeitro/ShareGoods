"use client"

import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

export function GoogleSignInButton({ text = "Continue with Google", role }: { text?: string; role?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${role ? `?role=${role}` : ""}`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl font-medium bg-white group"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4CAF50] border-t-transparent"></div>
      ) : (
        <>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
          />
          <span className="text-gray-700">{text}</span>
        </>
      )}
    </Button>
  )
}
