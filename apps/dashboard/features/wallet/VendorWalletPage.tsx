'use client'

import { useState } from 'react'
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft, Building2, CheckCircle2 } from 'lucide-react'
import {
  useGetVendorWalletQuery,
  useGetVendorWalletTransactionsQuery,
  useGetVendorBankAccountQuery,
  useSaveVendorBankAccountMutation,
  useWithdrawVendorWalletMutation,
  type VendorWalletTx,
} from '@/store/services/vendorWalletApi'
import { formatNaira, formatDateTime } from '@/lib/utils'

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#e8faf2] flex items-center justify-center text-[#17c666]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#9ca3af]">{label}</p>
        <p className="text-lg font-bold text-[#283c50]">{value}</p>
      </div>
    </div>
  )
}

function TxRow({ tx }: { tx: VendorWalletTx }) {
  const isCredit = tx.type === 'CREDIT'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#f9fafb] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? 'bg-[#e8faf2]' : 'bg-[#fdf0f0]'}`}>
        {isCredit
          ? <ArrowDownLeft className="w-4 h-4 text-[#17c666]" />
          : <ArrowUpRight className="w-4 h-4 text-[#ea4d4d]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#283c50] truncate">{tx.description ?? tx.type}</p>
        <p className="text-[11px] text-[#9ca3af]">{formatDateTime(tx.createdAt)}</p>
      </div>
      <span className={`text-xs font-semibold ${isCredit ? 'text-[#17c666]' : 'text-[#ea4d4d]'}`}>
        {isCredit ? '+' : '-'}{formatNaira(tx.amountKobo)}
      </span>
    </div>
  )
}

function BankAccountSection() {
  const { data, isLoading } = useGetVendorBankAccountQuery()
  const [save, { isLoading: saving }] = useSaveVendorBankAccountMutation()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ bankName: '', bankCode: '', accountNumber: '', accountName: '' })
  const [editing, setEditing] = useState(false)

  const account = data?.account

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await save(form).unwrap()
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-[#9ca3af]" /></div>

  if (account && !editing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[['Bank', account.bankName], ['Account Number', account.accountNumber], ['Account Name', account.accountName]].map(([l, v]) => (
            <div key={l}>
              <p className="text-[11px] text-[#9ca3af]">{l}</p>
              <p className="text-xs font-semibold text-[#283c50] font-mono">{v}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setForm({ bankName: account.bankName, bankCode: account.bankCode, accountNumber: account.accountNumber, accountName: account.accountName }); setEditing(true) }}
          className="text-xs text-[#3454d1] hover:underline"
        >
          Edit bank account
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {[
        { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. Access Bank' },
        { key: 'bankCode', label: 'Bank Code', placeholder: 'e.g. 044' },
        { key: 'accountNumber', label: 'Account Number', placeholder: '10-digit NUBAN' },
        { key: 'accountName', label: 'Account Name', placeholder: 'As on bank records' },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-[#4b5563] mb-1">{label}</label>
          <input
            required
            type="text"
            placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
          />
        </div>
      ))}
      <div className="flex gap-2">
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885]">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded text-white font-medium disabled:opacity-60"
          style={{ backgroundColor: saved ? '#17c666' : '#283c50' }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3" /> : null}
          {saved ? 'Saved!' : 'Save Bank Account'}
        </button>
      </div>
    </form>
  )
}

function WithdrawSection({ balanceKobo }: { balanceKobo: number }) {
  const [withdraw, { isLoading }] = useWithdrawVendorWalletMutation()
  const [amountNaira, setAmountNaira] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const naira = parseFloat(amountNaira)
    if (isNaN(naira) || naira < 100) { setError('Minimum withdrawal is ₦100'); return }
    const kobo = Math.round(naira * 100)
    if (kobo > balanceKobo) { setError('Insufficient balance'); return }
    try {
      await withdraw({ amountKobo: kobo }).unwrap()
      setDone(true)
      setAmountNaira('')
      setTimeout(() => setDone(false), 3000)
    } catch (err: any) {
      setError(err?.data?.error ?? 'Withdrawal failed')
    }
  }

  return (
    <form onSubmit={handleWithdraw} className="space-y-3">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
      {done && <p className="text-xs text-[#17c666] bg-[#e8faf2] border border-[#86efac] rounded px-3 py-2">Withdrawal request submitted successfully!</p>}
      <div>
        <label className="block text-xs font-medium text-[#4b5563] mb-1">Amount (₦)</label>
        <input
          type="number"
          min={100}
          step={50}
          value={amountNaira}
          onChange={(e) => setAmountNaira(e.target.value)}
          placeholder="Enter amount in Naira"
          className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
        />
        <p className="text-[11px] text-[#9ca3af] mt-1">Available: {formatNaira(balanceKobo)}</p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !amountNaira}
        className="w-full flex items-center justify-center gap-1.5 text-xs py-2.5 rounded text-white font-medium disabled:opacity-60 bg-[#283c50]"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
        Request Withdrawal
      </button>
    </form>
  )
}

export default function VendorWalletPage() {
  const { data: wallet, isLoading: walletLoading } = useGetVendorWalletQuery()
  const { data: txData, isLoading: txLoading } = useGetVendorWalletTransactionsQuery()

  const balanceKobo = wallet?.balanceKobo ?? 0
  const transactions = txData?.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Wallet</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">View your earnings, transactions, and withdraw funds.</p>
      </div>

      {walletLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-[#9ca3af]" />
        </div>
      ) : (
        <>
          <StatCard label="Wallet Balance" value={formatNaira(balanceKobo)} icon={<Wallet className="w-5 h-5" />} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Transactions */}
            <div className="card p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#283c50]">Recent Transactions</h2>
              {txLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-[#9ca3af]" /></div>
              ) : transactions.length === 0 ? (
                <p className="text-xs text-[#9ca3af] py-4 text-center">No transactions yet</p>
              ) : (
                <div>{transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}</div>
              )}
            </div>

            {/* Bank account + Withdraw */}
            <div className="space-y-5">
              <div className="card p-4 space-y-3">
                <h2 className="text-sm font-semibold text-[#283c50] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#17c666]" /> Bank Account
                </h2>
                <BankAccountSection />
              </div>

              <div className="card p-4 space-y-3">
                <h2 className="text-sm font-semibold text-[#283c50] flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-[#3454d1]" /> Withdraw
                </h2>
                <WithdrawSection balanceKobo={balanceKobo} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
