'use client'

import { useState } from 'react'
import { Search, Plus, Trash2, ChevronRight, Loader2, X, Download } from 'lucide-react'
import {
  useGetBusinessRidersQuery,
  useAssignBusinessRiderMutation,
  useRemoveBusinessRiderMutation,
  useGetBusinessRiderOrdersQuery,
} from '@/store/services/businessApi'
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'
import { formatNaira, formatDateTime } from '@/lib/utils'
import { exportToCsv } from '@/lib/exportCsv'
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
          <h2 className="text-base font-bold text-[#0D1426]">Assign Rider</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426]"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Rider ID</label>
            <input
              value={riderId}
              onChange={(e) => setRiderId(e.target.value)}
              placeholder="Enter rider ID"
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
            />
            <p className="text-[11px] text-[#9AA1B4] mt-1">Ask the rider for their Godrop Rider ID from the app.</p>
          </div>
          {error && (
            <p className="text-xs text-[#FF3B30]">{(error as any)?.data?.error ?? 'Failed to assign rider'}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#525A72] hover:bg-[#EDF0F6] rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#1E5FFF' }}
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
        <div className="px-5 py-4 border-b border-[#E7EAF1] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0D1426]">{rider.firstName} {rider.lastName}</h2>
            <p className="text-xs text-[#525A72] mt-0.5">{rider.phone}</p>
          </div>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426]"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-sm text-[#525A72] py-16">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[#EDF0F6]">
              {orders.map((o: any) => (
                <div key={o.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#1E5FFF]">{o.trackingCode}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      o.status === 'DELIVERED' ? 'bg-[#DFF5EC] text-[#1DB980]' :
                      o.status === 'CANCELLED' ? 'bg-[#FFE3E1] text-[#FF3B30]' :
                      'bg-[#E7EEFF] text-[#1E5FFF]'
                    }`}>{o.status}</span>
                  </div>
                  <p className="text-xs text-[#0D1426] mt-1 truncate">{o.pickupAddress} → {o.dropoffAddress}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#525A72]">{formatNaira(o.totalKobo)}</span>
                    {o.earning && (
                      <span className="text-xs text-[#1DB980] font-medium">Earned: {formatNaira(o.earning.amountKobo)}</span>
                    )}
                    <span className="text-xs text-[#9AA1B4] ml-auto">{formatDateTime(o.createdAt)}</span>
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
  const isOwner = hasPermission(session, 'riders:write')
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
        <h1 className="text-xl font-bold text-[#0D1426]">Riders</h1>
        {isOwner && (
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: '#1E5FFF' }}
          >
            <Plus className="w-4 h-4" /> Assign Rider
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA1B4]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E7EAF1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
          />
        </div>
        <button
          type="button"
          onClick={() => exportToCsv('business-riders', riders, [
            { header: 'Name', value: (r) => `${r.firstName} ${r.lastName}` },
            { header: 'Phone', value: (r) => r.phone },
            { header: 'Vehicle', value: (r) => r.vehicleType ?? '' },
            { header: 'KYC', value: (r) => r.kycStatus },
            { header: 'Status', value: (r) => r.isActive ? 'Active' : 'Inactive' },
            { header: 'Orders', value: (r) => r._count?.orders ?? 0 },
          ])}
          className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded-lg px-3 py-2.5 hover:bg-[#F7F9FC] shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : riders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#525A72]">No riders found.</p>
            {isOwner && (
              <button
                onClick={() => setShowAssign(true)}
                className="mt-3 text-sm text-[#1E5FFF] hover:underline"
              >
                Assign your first rider
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] border-b border-[#EDF0F6]">
                <th className="px-5 py-3 text-left">Rider</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Vehicle</th>
                <th className="px-5 py-3 text-left">KYC</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F6]">
              {riders.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7F9FC] cursor-pointer" onClick={() => setSelectedRider(r)}>
                  <td className="px-5 py-3 font-medium text-[#0D1426]">{r.firstName} {r.lastName}</td>
                  <td className="px-5 py-3 text-[#525A72]">{r.phone}</td>
                  <td className="px-5 py-3 text-[#525A72]">{r.vehicleType ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.kycStatus === 'VERIFIED' ? 'bg-[#DFF5EC] text-[#1DB980]' :
                      r.kycStatus === 'SUBMITTED' ? 'bg-[#E7EEFF] text-[#1E5FFF]' :
                      r.kycStatus === 'REJECTED' ? 'bg-[#FFE3E1] text-[#FF3B30]' :
                      'bg-[#EDF0F6] text-[#525A72]'
                    }`}>{r.kycStatus}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#FFE3E1] text-[#FF3B30]'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#0D1426] font-medium">{r._count?.orders ?? 0}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedRider(r)}
                        className="p-1.5 rounded hover:bg-[#EDF0F6] text-[#9AA1B4] hover:text-[#1E5FFF]"
                        title="View orders"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(r.id)}
                          className="p-1.5 rounded hover:bg-[#FFE3E1] text-[#9AA1B4] hover:text-[#FF3B30]"
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
