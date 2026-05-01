'use client';

import React, { useEffect } from 'react';
import { db } from '@/lib/db';
import { apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const processQueue = async () => {
      const actions = await db.actions.toArray();
      if (actions.length === 0) return;

      toast.loading(`Syncing ${actions.length} offline actions...`, { id: 'sync' });

      for (const action of actions) {
        try {
          await apiRequest(action.endpoint, {
            method: action.method,
            body: action.payload,
          });
          // Remove from queue on success
          if (action.id) await db.actions.delete(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          // Keep in queue for next retry
        }
      }

      toast.success('Sync complete!', { id: 'sync' });
    };

    const handleOnline = () => {
      console.log('App is online. Processing sync queue...');
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    
    // Also try to sync on mount if online
    if (navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <>{children}</>;
};
