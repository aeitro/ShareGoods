'use client'

import React, { useEffect, createContext, useContext } from 'react'
import { initSocket, getSocket } from '@/lib/socket'
import { useToast } from '@/components/ui/use-toast'
import { usePathname, useRouter } from 'next/navigation'

const SocketContext = createContext<any>(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      initSocket(token)
      const socket = getSocket()

      if (socket) {
        socket.on('new_notification', (notification: any) => {
          // Only show toast if not on the messages page for message notifications
          const isMessagesPage = pathname?.includes('/dashboard/messages')
          if (notification.type === 'NEW_MESSAGE' && isMessagesPage) {
            return
          }

          toast({
            title: notification.title,
            description: notification.message,
            action: (
              <button 
                onClick={() => {
                  if (notification.type === 'NEW_MESSAGE') {
                    router.push('/dashboard/messages')
                  }
                }}
                className="text-xs font-bold underline"
              >
                View
              </button>
            )
          })
        })
      }
    }

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.off('new_notification')
      }
    }
  }, [pathname, toast, router])

  return (
    <SocketContext.Provider value={{}}>
      {children}
    </SocketContext.Provider>
  )
}
