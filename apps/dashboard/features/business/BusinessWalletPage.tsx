'use client'

import { Wallet, Loader2 } from 'lucide-react'
import { useGetBusinessWalletQuery, useGetBusinessWalletTransactionsQuery } from '@/store/services/businessApi'
import { formatNaira, formatDateTime } from '@/lib/utils'
import type { BusinessWalletTxType } from '@/types/api'

const TX_LABEL: Record<BusinessWalletTxType, string> = {
  RIDER_EARNING: 'Rider Earning',
  WITHDRAWAL: 'Withdrawal',
}

const TX_COLOR: Record<BusinessWalletTxType, string> = {
  RIDER_EARNING: '#1DB980',
  WITHDRAWAL: '#FF3B30',
}

export default function BusinessWalletPage() {
  const { data: wallet, isLoading: walletLoading } = useGetBusinessWalletQuery()
  const { data: txData, isLoading: txLoading } = useGetBusinessWalletTransactionsQuery({ limit: 50 })
  const transactions = txData?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0D1426]">Wallet</h1>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0D1426, #1E5FFF)' }}
      >
        <div className="flex items-center gap-2 mb-3 opacity-70">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">Business Wallet Balance</span>
        </div>
        {walletLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <p className="text-3xl font-bold">{formatNaira(wallet?.balanceKobo ?? 0)}</p>
        )}
        <p className="text-xs mt-1 opacity-60">Accumulated from all rider earnings</p>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7EAF1]">
          <h2 className="text-sm font-semibold text-[#0D1426]">Transaction History</h2>
        </div>
        {txLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-[#525A72] py-12">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-[#EDF0F6]">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0D1426]">
                    {TX_LABEL[tx.type] ?? tx.type}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-[#525A72] mt-0.5">{tx.description}</p>
                  )}
                  <p className="text-[11px] text-[#9AA1B4] mt-0.5">{formatDateTime(tx.createdAt)}</p>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: TX_COLOR[tx.type] ?? '#0D1426' }}
                >
                  {tx.type === 'WITHDRAWAL' ? '-' : '+'}{formatNaira(tx.amountKobo)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
