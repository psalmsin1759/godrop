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
      className="px-4 py-3 hover:bg-[#F7F9FC] transition-colors cursor-pointer flex gap-3"
      onClick={() => { if (!notif.isRead) onRead(notif.id) }}
    >
      {!notif.isRead && (
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FFF] shrink-0" />
      )}
      <div className={!notif.isRead ? '' : 'ml-[18px]'}>
        <p className="text-xs font-semibold text-[#0D1426] leading-snug">{notif.title}</p>
        <p className="text-[11px] text-[#525A72] mt-0.5 leading-snug">{notif.body}</p>
        <p className="text-[10px] text-[#9AA1B4] mt-1 font-mono">{timeAgo(notif.createdAt)}</p>
      </div>
    </div>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 15 }
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
        className="relative w-9 h-9 rounded-[10px] border border-[#E7EAF1] bg-white flex items-center justify-center hover:bg-[#F7F9FC] transition-colors"
      >
        <Bell className="w-[17px] h-[17px] text-[#525A72]" />
        {unreadCount > 0 && (
          <span
            className="absolute top-[9px] right-[9px] w-[7px] h-[7px] rounded-full border-2 border-white"
            style={{ backgroundColor: '#FF6A2C' }}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl border border-[#E7EAF1] shadow-card-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7EAF1]">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold text-[#0D1426]">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-[#1E5FFF]" style={{ backgroundColor: 'rgba(30,95,255,.14)' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                disabled={markingAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#1E5FFF] hover:underline disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#EEF1F7]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E5FFF]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-6 h-6 text-[#DDE2EC] mx-auto mb-2" />
                <p className="text-xs text-[#9AA1B4]">No notifications yet</p>
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
