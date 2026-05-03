'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/store/services/notificationsApi'
import type { AdminNotification } from '@/types/api'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationItem({ notif, onRead }: { notif: AdminNotification; onRead: (id: string) => void }) {
  return (
    <div
      className="px-4 py-3 hover:bg-[#f9fafb] transition-colors cursor-pointer flex gap-3"
      onClick={() => { if (!notif.isRead) onRead(notif.id) }}
    >
      {!notif.isRead && (
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3454d1] shrink-0" />
      )}
      <div className={!notif.isRead ? '' : 'ml-[18px]'}>
        <p className="text-xs font-semibold text-[#283c50] leading-snug">{notif.title}</p>
        <p className="text-[11px] text-[#6b7885] mt-0.5 leading-snug">{notif.body}</p>
        <p className="text-[10px] text-[#9ca3af] mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
    </div>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 15 },
    { pollingInterval: 30000 }
  )
  const [markRead] = useMarkNotificationReadMutation()
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation()

  const notifications = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
      >
        <Bell className="w-4 h-4 text-[#6b7885]" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5"
            style={{ backgroundColor: '#ea4d4d' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl border border-[#e5e7eb] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-[#283c50]">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 bg-[#eef1fb] text-[#3454d1]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                disabled={markingAll}
                className="flex items-center gap-1 text-[11px] text-[#3454d1] hover:underline disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#f9fafb]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-6 h-6 text-[#d1d5db] mx-auto mb-2" />
                <p className="text-xs text-[#9ca3af]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onRead={(id) => markRead(id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
