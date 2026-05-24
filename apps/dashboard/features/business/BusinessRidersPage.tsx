'use client'

import { useState } from 'react'
import { Search, Plus, Trash2, ChevronRight, Loader2, X } from 'lucide-react'
import {
  useGetBusinessRidersQuery,
  useAssignBusinessRiderMutation,
  useRemoveBusinessRiderMutation,
  useGetBusinessRiderOrdersQuery,
} from '@/store/services/businessApi'
import { useSession } from 'next-auth/react'
import { formatNaira, formatDateTime } from '@/lib/utils'
import type { Rider } from '@/types/api'

function AssignRiderModal({ onClose }: { onClose: () => void }) {
  const [riderId, setRiderId] = useState('')
  const [assign, { isLoading, error }] = useAssignBusinessRiderMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!riderId.trim()) return
    try {
      await assign(riderId.trim()).unwrap()
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#283c50]">Assign Rider</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Rider ID</label>
            <input
              value={riderId}
              onChange={(e) => setRiderId(e.target.value)}
              placeholder="Enter rider ID"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">Ask the rider for their Godrop Rider ID from the app.</p>
          </div>
          {error && (
            <p className="text-xs text-[#ea4d4d]">{(error as any)?.data?.error ?? 'Failed to assign rider'}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#3454d1' }}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RiderOrdersDrawer({ rider, onClose }: { rider: Rider; onClose: () => void }) {
  const { data, isLoading } = useGetBusinessRiderOrdersQuery({ riderId: rider.id })
  const orders = data?.data ?? []

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#283c50]">{rider.firstName} {rider.lastName}</h2>
            <p className="text-xs text-[#6b7885] mt-0.5">{rider.phone}</p>
          </div>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-sm text-[#6b7885] py-16">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[#f3f4f6]">
              {orders.map((o: any) => (
                <div key={o.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#3454d1]">{o.trackingCode}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      o.status === 'DELIVERED' ? 'bg-[#e8faf0] text-[#17c666]' :
                      o.status === 'CANCELLED' ? 'bg-[#fef2f2] text-[#ea4d4d]' :
                      'bg-[#eef0fb] text-[#3454d1]'
                    }`}>{o.status}</span>
                  </div>
                  <p className="text-xs text-[#283c50] mt-1 truncate">{o.pickupAddress} → {o.dropoffAddress}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#6b7885]">{formatNaira(o.totalKobo)}</span>
                    {o.earning && (
                      <span className="text-xs text-[#17c666] font-medium">Earned: {formatNaira(o.earning.amountKobo)}</span>
                    )}
                    <span className="text-xs text-[#9ca3af] ml-auto">{formatDateTime(o.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BusinessRidersPage() {
  const { data: session } = useSession()
  const isOwner = session?.admin?.role === 'OWNER'
  const [search, setSearch] = useState('')
  const [showAssign, setShowAssign] = useState(false)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)

  const { data, isLoading } = useGetBusinessRidersQuery({ search: search || undefined })
  const [removeRider] = useRemoveBusinessRiderMutation()
  const riders = data?.data ?? []

  async function handleRemove(riderId: string) {
    if (!confirm('Remove this rider from your business?')) return
    await removeRider(riderId)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#283c50]">Riders</h1>
        {isOwner && (
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: '#3454d1' }}
          >
            <Plus className="w-4 h-4" /> Assign Rider
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
          </div>
        ) : riders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#6b7885]">No riders found.</p>
            {isOwner && (
              <button
                onClick={() => setShowAssign(true)}
                className="mt-3 text-sm text-[#3454d1] hover:underline"
              >
                Assign your first rider
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] border-b border-[#f3f4f6]">
                <th className="px-5 py-3 text-left">Rider</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Vehicle</th>
                <th className="px-5 py-3 text-left">KYC</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {riders.map((r) => (
                <tr key={r.id} className="hover:bg-[#f9fafb] cursor-pointer" onClick={() => setSelectedRider(r)}>
                  <td className="px-5 py-3 font-medium text-[#283c50]">{r.firstName} {r.lastName}</td>
                  <td className="px-5 py-3 text-[#6b7885]">{r.phone}</td>
                  <td className="px-5 py-3 text-[#6b7885]">{r.vehicleType ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.kycStatus === 'VERIFIED' ? 'bg-[#e8faf0] text-[#17c666]' :
                      r.kycStatus === 'SUBMITTED' ? 'bg-[#eef0fb] text-[#3454d1]' :
                      r.kycStatus === 'REJECTED' ? 'bg-[#fef2f2] text-[#ea4d4d]' :
                      'bg-[#f3f4f6] text-[#6b7885]'
                    }`}>{r.kycStatus}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#e8faf0] text-[#17c666]' : 'bg-[#fef2f2] text-[#ea4d4d]'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#283c50] font-medium">{r._count?.orders ?? 0}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedRider(r)}
                        className="p-1.5 rounded hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#3454d1]"
                        title="View orders"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(r.id)}
                          className="p-1.5 rounded hover:bg-[#fef2f2] text-[#9ca3af] hover:text-[#ea4d4d]"
                          title="Remove from business"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAssign && <AssignRiderModal onClose={() => setShowAssign(false)} />}
      {selectedRider && <RiderOrdersDrawer rider={selectedRider} onClose={() => setSelectedRider(null)} />}
    </div>
  )
}
