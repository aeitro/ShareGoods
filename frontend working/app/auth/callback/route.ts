import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedRole = requestUrl.searchParams.get('role')

  if (code) {
    const cookieStore = cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)

    // After login, check user role for redirection
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Determine if onboarding is needed
      // If profile is missing OR role/phone/address is missing, it's a new user
      const needsOnboarding = !profile || !profile.role || !profile.phone || !profile.address

      if (needsOnboarding) {
        // Redirect to onboarding page (which will handle role selection if needed)
        const onboardingUrl = new URL(`${requestUrl.origin}/${locale}/onboarding`)
        if (requestedRole) onboardingUrl.searchParams.set('role', requestedRole)
        return NextResponse.redirect(onboardingUrl)
      }

      let redirectPath = `/${locale}/dashboard/recipient`

      if (profile?.role === 'ADMIN') {
        redirectPath = `/${locale}/admin/dashboard`
      } else if (profile?.role === 'DONOR') {
        redirectPath = `/${locale}/dashboard/donor`
      } else if (profile?.role === 'NGO' || profile?.role === 'RECIPIENT' || profile?.role === 'INDIVIDUAL') {
        redirectPath = `/${locale}/dashboard/recipient`
      }

      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
    }
  }

  // URL to redirect to after sign in process completes
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  return NextResponse.redirect(`${requestUrl.origin}/${locale}/login`)
}
