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
import { formatNaira, formatNairaFull, formatDate, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  Wallet, ShoppingBag, User, Shield, ShieldOff, UserX,
  CheckCircle, AlertCircle, Phone, Mail, Calendar,
  ArrowUpCircle, ArrowDownCircle, RefreshCw,
} from 'lucide-react'

const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  ACTIVE:      { bg: '#e8faf2', text: '#17c666', label: 'Active',      icon: <CheckCircle className="w-3 h-3" /> },
  SUSPENDED:   { bg: '#fff6e8', text: '#ffa21d', label: 'Suspended',   icon: <ShieldOff className="w-3 h-3" /> },
  DEACTIVATED: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Deactivated', icon: <UserX className="w-3 h-3" /> },
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING:          { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  ACCEPTED:         { bg: '#e0f9f7', text: '#3dc7be', label: 'Accepted' },
  PREPARING:        { bg: '#f3eeff', text: '#8b5cf6', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP:        { bg: '#fef3c7', text: '#f59e0b', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  DELIVERED:        { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  CANCELLED:        { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
  FAILED:           { bg: '#f3f4f6', text: '#6b7280', label: 'Failed' },
}

const TX_CONFIG: Record<WalletTransactionType, { icon: React.ReactNode; color: string; label: string }> = {
  TOPUP:   { icon: <ArrowUpCircle className="w-4 h-4" />,   color: '#17c666', label: 'Top-up' },
  PAYMENT: { icon: <ArrowDownCircle className="w-4 h-4" />, color: '#ea4d4d', label: 'Payment' },
  REFUND:  { icon: <RefreshCw className="w-4 h-4" />,       color: '#3454d1', label: 'Refund' },
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
        <h3 className="text-sm font-bold text-[#283c50]">Change Account Status</h3>
        <div className="space-y-2">
          {options.map((s) => {
            const cfg = CUSTOMER_STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  selected === s
                    ? 'border-[#3454d1] bg-[#eef1fb]'
                    : 'border-[#e5e7eb] hover:border-[#3454d1]/40'
                }`}
              >
                <span style={{ color: cfg.text }}>{cfg.icon}</span>
                <span className="text-xs font-semibold text-[#283c50]">{cfg.label}</span>
                {s === currentStatus && (
                  <span className="ml-auto text-[10px] text-[#9ca3af]">current</span>
                )}
              </button>
            )
          })}
        </div>
        {selected === 'DEACTIVATED' && selected !== currentStatus && (
          <div className="flex gap-2 p-2.5 bg-[#fdf0f0] rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-[#ea4d4d] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#ea4d4d]">Deactivation permanently closes the account.</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-xs py-2 rounded-lg border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={loading || selected === currentStatus}
            className="flex-1 text-xs py-2 rounded-lg bg-[#3454d1] text-white font-semibold disabled:opacity-40 hover:bg-[#2a44b8] transition-colors"
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
        <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="w-8 h-8 text-[#ea4d4d]" />
        <p className="text-sm text-[#6b7885]">Customer not found</p>
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
            className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#9ca3af] hover:text-[#283c50] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#283c50]">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-xs text-[#9ca3af] mt-0.5">Customer profile</p>
          </div>
        </div>

        {/* Profile + Wallet + Status */}
        <div className="grid grid-cols-3 gap-4">
          {/* Profile card */}
          <div className="card p-4 space-y-3 col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#eef1fb] flex items-center justify-center text-base font-bold text-[#3454d1] shrink-0">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#283c50]">
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
                      <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-[#eef1fb] text-[#3454d1] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowStatusDialog(true)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7885] hover:border-[#3454d1] hover:text-[#3454d1] transition-colors font-medium flex items-center gap-1.5"
              >
                <Shield className="w-3 h-3" />
                Change Status
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#6b7885]">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#9ca3af]" />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-xs text-[#6b7885]">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-[#9ca3af]" />
                  {customer.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-[#6b7885]">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#9ca3af]" />
                Joined {formatDate(customer.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b7885]">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-[#9ca3af]" />
                {customer._count.orders} orders · {customer._count.addresses} addresses
              </div>
              {customer.referralCode && (
                <div className="flex items-center gap-2 text-xs text-[#6b7885]">
                  <User className="w-3.5 h-3.5 shrink-0 text-[#9ca3af]" />
                  Referral code: <span className="font-mono font-semibold text-[#283c50]">{customer.referralCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wallet card */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6b7885] uppercase tracking-wide">
              <Wallet className="w-3.5 h-3.5" />
              Wallet Balance
            </div>
            {customer.wallet ? (
              <>
                <p className="text-2xl font-bold text-[#283c50] mt-3">
                  {formatNaira(customer.wallet.balanceKobo)}
                </p>
                <p className="text-[10px] text-[#9ca3af] mt-1">
                  {formatNairaFull(customer.wallet.balanceKobo)} · since {formatDate(customer.wallet.createdAt)}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#9ca3af] mt-3">No wallet yet</p>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#283c50] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#3454d1]" />
              Order History
            </h2>
            {ordersMeta && (
              <span className="text-[11px] text-[#9ca3af]">{ordersMeta.total} orders</span>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-[#9ca3af]">
              No orders yet
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-[#f3f4f6]">
                    <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Tracking</th>
                    <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Type</th>
                    <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Status</th>
                    <th className="text-right text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Total</th>
                    <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {orders.map((o) => {
                    const osc = ORDER_STATUS_CONFIG[o.status]
                    return (
                      <tr key={o.id} className="hover:bg-[#fafafa] cursor-pointer" onClick={() => router.push(`/orders/${o.id}`)}>
                        <td className="px-4 py-2.5 font-mono text-xs font-medium text-[#283c50]">{o.trackingCode}</td>
                        <td className="px-4 py-2.5 text-xs text-[#6b7885]">{o.type}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className="text-[11px] font-medium rounded-full px-2 py-0.5"
                            style={{ backgroundColor: osc.bg, color: osc.text }}
                          >
                            {osc.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-[#283c50]">
                          {formatNaira(o.totalKobo)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-[#9ca3af]">{formatDateTime(o.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {ordersMeta && ordersMeta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f3f4f6]">
                  <p className="text-[11px] text-[#9ca3af]">
                    Page {ordersMeta.page} of {ordersMeta.totalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={ordersPage === 1}
                      className="p-1 rounded border border-[#e5e7eb] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setOrdersPage((p) => Math.min(ordersMeta.totalPages, p + 1))}
                      disabled={ordersPage === ordersMeta.totalPages}
                      className="p-1 rounded border border-[#e5e7eb] disabled:opacity-40"
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
          <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#283c50] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#3454d1]" />
              Wallet Transactions
            </h2>
            {txMeta && (
              <span className="text-[11px] text-[#9ca3af]">{txMeta.total} transactions</span>
            )}
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" />
            </div>
          ) : txs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-[#9ca3af]">
              No wallet transactions
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#f3f4f6]">
                {txs.map((tx) => {
                  const cfg = TX_CONFIG[tx.type]
                  const isCredit = tx.type === 'TOPUP' || tx.type === 'REFUND'
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cfg.color + '18', color: cfg.color }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#283c50]">{cfg.label}</p>
                        {tx.description && (
                          <p className="text-[11px] text-[#9ca3af] truncate">{tx.description}</p>
                        )}
                        {tx.reference && (
                          <p className="text-[10px] font-mono text-[#9ca3af]">{tx.reference}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-xs font-bold"
                          style={{ color: isCredit ? '#17c666' : '#ea4d4d' }}
                        >
                          {isCredit ? '+' : '-'}{formatNaira(tx.amountKobo)}
                        </p>
                        <p className="text-[10px] text-[#9ca3af]">{formatDateTime(tx.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {txMeta && txMeta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f3f4f6]">
                  <p className="text-[11px] text-[#9ca3af]">
                    Page {txMeta.page} of {txMeta.totalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      className="p-1 rounded border border-[#e5e7eb] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setTxPage((p) => Math.min(txMeta.totalPages, p + 1))}
                      disabled={txPage === txMeta.totalPages}
                      className="p-1 rounded border border-[#e5e7eb] disabled:opacity-40"
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
