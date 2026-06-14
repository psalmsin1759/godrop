'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetCustomerQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerWalletTransactionsQuery,
  useUpdateCustomerStatusMutation,
} from '../store/customersApi'
import type { CustomerStatus, OrderStatus, WalletTransactionType } from '@/types/api'
import { formatNaira, formatAmount, formatAmountFull, formatDate, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  Wallet, ShoppingBag, User, Shield, ShieldOff, UserX,
  CheckCircle, AlertCircle, Phone, Mail, Calendar,
  ArrowUpCircle, ArrowDownCircle, RefreshCw,
} from 'lucide-react'

const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  ACTIVE:      { bg: '#DFF5EC', text: '#1DB980', label: 'Active',      icon: <CheckCircle className="w-3 h-3" /> },
  SUSPENDED:   { bg: '#FBEDD7', text: '#E8930C', label: 'Suspended',   icon: <ShieldOff className="w-3 h-3" /> },
  DEACTIVATED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Deactivated', icon: <UserX className="w-3 h-3" /> },
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING:          { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  ACCEPTED:         { bg: '#FFEAE1', text: '#FF6A2C', label: 'Accepted' },
  PREPARING:        { bg: '#F0EAFA', text: '#7A5AE0', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP:        { bg: '#FBEDD7', text: '#E8930C', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  DELIVERED:        { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  CANCELLED:        { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
  FAILED:           { bg: '#EDF0F6', text: '#9AA1B4', label: 'Failed' },
}

const TX_CONFIG: Record<WalletTransactionType, { icon: React.ReactNode; color: string; label: string }> = {
  TOPUP:   { icon: <ArrowUpCircle className="w-4 h-4" />,   color: '#1DB980', label: 'Top-up' },
  PAYMENT: { icon: <ArrowDownCircle className="w-4 h-4" />, color: '#FF3B30', label: 'Payment' },
  REFUND:  { icon: <RefreshCw className="w-4 h-4" />,       color: '#1E5FFF', label: 'Refund' },
}

function ChangeStatusDialog({
  currentStatus,
  onConfirm,
  onClose,
  loading,
}: {
  currentStatus: CustomerStatus
  onConfirm: (status: CustomerStatus) => void
  onClose: () => void
  loading: boolean
}) {
  const options: CustomerStatus[] = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED']
  const [selected, setSelected] = useState<CustomerStatus>(currentStatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-80 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0D1426]">Change Account Status</h3>
        <div className="space-y-2">
          {options.map((s) => {
            const cfg = CUSTOMER_STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  selected === s
                    ? 'border-[#1E5FFF] bg-[#E7EEFF]'
                    : 'border-[#E7EAF1] hover:border-[#1E5FFF]/40'
                }`}
              >
                <span style={{ color: cfg.text }}>{cfg.icon}</span>
                <span className="text-xs font-semibold text-[#0D1426]">{cfg.label}</span>
                {s === currentStatus && (
                  <span className="ml-auto text-[10px] text-[#9AA1B4]">current</span>
                )}
              </button>
            )
          })}
        </div>
        {selected === 'DEACTIVATED' && selected !== currentStatus && (
          <div className="flex gap-2 p-2.5 bg-[#FFE3E1] rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#FF3B30]">Deactivation permanently closes the account.</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-xs py-2 rounded-lg border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={loading || selected === currentStatus}
            className="flex-1 text-xs py-2 rounded-lg bg-[#1E5FFF] text-white font-semibold disabled:opacity-40 hover:bg-[#0A3FD1] transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomerDetailPage({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [ordersPage, setOrdersPage] = useState(1)
  const [txPage, setTxPage] = useState(1)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const { data: customer, isLoading: customerLoading } = useGetCustomerQuery(customerId)
  const { data: ordersData, isLoading: ordersLoading } = useGetCustomerOrdersQuery({
    id: customerId,
    page: ordersPage,
    limit: 10,
  })
  const { data: txData, isLoading: txLoading } = useGetCustomerWalletTransactionsQuery({
    id: customerId,
    page: txPage,
    limit: 10,
  })
  const [updateStatus] = useUpdateCustomerStatusMutation()

  async function handleStatusChange(status: CustomerStatus) {
    setStatusLoading(true)
    try {
      await updateStatus({ id: customerId, status }).unwrap()
      setShowStatusDialog(false)
    } finally {
      setStatusLoading(false)
    }
  }

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="w-8 h-8 text-[#FF3B30]" />
        <p className="text-sm text-[#525A72]">Customer not found</p>
      </div>
    )
  }

  const sc = CUSTOMER_STATUS_CONFIG[customer.status]
  const orders = ordersData?.data ?? []
  const ordersMeta = ordersData?.meta
  const txs = txData?.data ?? []
  const txMeta = txData?.meta

  return (
    <>
      {showStatusDialog && (
        <ChangeStatusDialog
          currentStatus={customer.status}
          onConfirm={handleStatusChange}
          onClose={() => setShowStatusDialog(false)}
          loading={statusLoading}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/customers')}
            className="p-1.5 rounded-lg hover:bg-[#EDF0F6] text-[#9AA1B4] hover:text-[#0D1426] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0D1426]">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-xs text-[#9AA1B4] mt-0.5">Customer profile</p>
          </div>
        </div>

        {/* Profile + Wallet + Status */}
        <div className="grid grid-cols-3 gap-4">
          {/* Profile card */}
          <div className="card p-4 space-y-3 col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E7EEFF] flex items-center justify-center text-base font-bold text-[#1E5FFF] shrink-0">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1426]">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[11px] font-medium rounded-full px-2 py-0.5 flex items-center gap-1"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {sc.icon}
                      {sc.label}
                    </span>
                    {customer.isVerified && (
                      <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-[#E7EEFF] text-[#1E5FFF] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowStatusDialog(true)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-[#E7EAF1] text-[#525A72] hover:border-[#1E5FFF] hover:text-[#1E5FFF] transition-colors font-medium flex items-center gap-1.5"
              >
                <Shield className="w-3 h-3" />
                Change Status
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#525A72]">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#9AA1B4]" />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-xs text-[#525A72]">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-[#9AA1B4]" />
                  {customer.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-[#525A72]">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#9AA1B4]" />
                Joined {formatDate(customer.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#525A72]">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-[#9AA1B4]" />
                {customer._count.orders} orders · {customer._count.addresses} addresses
              </div>
              {customer.referralCode && (
                <div className="flex items-center gap-2 text-xs text-[#525A72]">
                  <User className="w-3.5 h-3.5 shrink-0 text-[#9AA1B4]" />
                  Referral code: <span className="font-mono font-semibold text-[#0D1426]">{customer.referralCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wallet card */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#525A72] uppercase tracking-wide">
              <Wallet className="w-3.5 h-3.5" />
              Wallet Balance
            </div>
            {customer.wallet ? (
              <>
                <p className="text-2xl font-bold text-[#0D1426] mt-3">
                  {formatAmount(customer.wallet.balance)}
                </p>
                <p className="text-[10px] text-[#9AA1B4] mt-1">
                  {formatAmountFull(customer.wallet.balance)} · since {formatDate(customer.wallet.createdAt)}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#9AA1B4] mt-3">No wallet yet</p>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EDF0F6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0D1426] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#1E5FFF]" />
              Order History
            </h2>
            {ordersMeta && (
              <span className="text-[11px] text-[#9AA1B4]">{ordersMeta.total} orders</span>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin text-[#1E5FFF]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-[#9AA1B4]">
              No orders yet
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FC] border-b border-[#EDF0F6]">
                    <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Tracking</th>
                    <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Type</th>
                    <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Status</th>
                    <th className="text-right text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Total</th>
                    <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF0F6]">
                  {orders.map((o) => {
                    const osc = ORDER_STATUS_CONFIG[o.status]
                    return (
                      <tr key={o.id} className="hover:bg-[#F7F9FC] cursor-pointer" onClick={() => router.push(`/orders/${o.id}`)}>
                        <td className="px-4 py-2.5 font-mono text-xs font-medium text-[#0D1426]">{o.trackingCode}</td>
                        <td className="px-4 py-2.5 text-xs text-[#525A72]">{o.type}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={{ backgroundColor: osc.bg, color: osc.text }}
                          >
                            {osc.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-[#0D1426]">
                          {formatNaira(o.totalKobo)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-[#9AA1B4]">{formatDateTime(o.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {ordersMeta && ordersMeta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EDF0F6]">
                  <p className="text-[11px] text-[#9AA1B4]">
                    Page {ordersMeta.page} of {ordersMeta.totalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={ordersPage === 1}
                      className="p-1 rounded border border-[#E7EAF1] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setOrdersPage((p) => Math.min(ordersMeta.totalPages, p + 1))}
                      disabled={ordersPage === ordersMeta.totalPages}
                      className="p-1 rounded border border-[#E7EAF1] disabled:opacity-40"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wallet Transactions */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EDF0F6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0D1426] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#1E5FFF]" />
              Wallet Transactions
            </h2>
            {txMeta && (
              <span className="text-[11px] text-[#9AA1B4]">{txMeta.total} transactions</span>
            )}
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin text-[#1E5FFF]" />
            </div>
          ) : txs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-[#9AA1B4]">
              No wallet transactions
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#EDF0F6]">
                {txs.map((tx) => {
                  const cfg = TX_CONFIG[tx.type]
                  const isCredit = tx.type === 'TOPUP' || tx.type === 'REFUND'
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FC]">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cfg.color + '18', color: cfg.color }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0D1426]">{cfg.label}</p>
                        {tx.description && (
                          <p className="text-[11px] text-[#9AA1B4] truncate">{tx.description}</p>
                        )}
                        {tx.reference && (
                          <p className="text-[10px] font-mono text-[#9AA1B4]">{tx.reference}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-xs font-bold"
                          style={{ color: isCredit ? '#1DB980' : '#FF3B30' }}
                        >
                          {isCredit ? '+' : '-'}{formatAmount(tx.amount)}
                        </p>
                        <p className="text-[10px] text-[#9AA1B4]">{formatDateTime(tx.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {txMeta && txMeta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EDF0F6]">
                  <p className="text-[11px] text-[#9AA1B4]">
                    Page {txMeta.page} of {txMeta.totalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      className="p-1 rounded border border-[#E7EAF1] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setTxPage((p) => Math.min(txMeta.totalPages, p + 1))}
                      disabled={txPage === txMeta.totalPages}
                      className="p-1 rounded border border-[#E7EAF1] disabled:opacity-40"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
