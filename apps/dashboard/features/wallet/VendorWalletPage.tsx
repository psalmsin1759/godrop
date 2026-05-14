'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft, Building2, CheckCircle2, Search } from 'lucide-react'
import {
  useGetVendorWalletQuery,
  useGetVendorWalletTransactionsQuery,
  useGetVendorBankAccountQuery,
  useSaveVendorBankAccountMutation,
  useWithdrawVendorWalletMutation,
  useGetPaystackBanksQuery,
  useResolveAccountMutation,
  type VendorWalletTx,
  type PaystackBank,
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
  const { data: banksData, isLoading: banksLoading } = useGetPaystackBanksQuery()
  const [save, { isLoading: saving }] = useSaveVendorBankAccountMutation()
  const [resolve, { isLoading: resolving }] = useResolveAccountMutation()

  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [showBankList, setShowBankList] = useState(false)
  const [selectedBank, setSelectedBank] = useState<PaystackBank | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolveError, setResolveError] = useState('')
  const [saveError, setSaveError] = useState('')

  const banks = banksData?.banks ?? []
  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  )
  const account = data?.account

  useEffect(() => {
    setResolvedName('')
    setResolveError('')
  }, [selectedBank, accountNumber])

  async function handleResolve() {
    if (!selectedBank || accountNumber.length !== 10) return
    setResolveError('')
    setResolvedName('')
    try {
      const res = await resolve({ accountNumber, bankCode: selectedBank.code }).unwrap()
      setResolvedName(res.accountName)
    } catch {
      setResolveError('Could not verify account. Check the number and try again.')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    if (!selectedBank) { setSaveError('Please select a bank'); return }
    if (!resolvedName) { setSaveError('Please verify your account number first'); return }
    try {
      await save({
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
        accountNumber,
        accountName: resolvedName,
      }).unwrap()
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err?.data?.error ?? 'Failed to save bank account')
    }
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
          onClick={() => {
            setEditing(true)
            setSelectedBank(null)
            setAccountNumber('')
            setResolvedName('')
            setResolveError('')
            setSaveError('')
            setBankSearch('')
          }}
          className="text-xs text-[#3454d1] hover:underline"
        >
          Edit bank account
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{saveError}</p>}

      {/* Bank picker */}
      <div className="relative">
        <label className="block text-xs font-medium text-[#4b5563] mb-1">Bank <span className="text-[#ea4d4d]">*</span></label>
        <button
          type="button"
          onClick={() => setShowBankList((v) => !v)}
          className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#17c666]"
        >
          <span className={selectedBank ? 'text-[#283c50]' : 'text-[#9ca3af]'}>
            {selectedBank?.name ?? 'Select a bank…'}
          </span>
          <Search className="w-3 h-3 text-[#9ca3af]" />
        </button>
        {showBankList && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-lg">
            <div className="p-2 border-b border-[#f3f4f6]">
              <input
                autoFocus
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search banks…"
                className="w-full px-2 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
              />
            </div>
            <ul className="max-h-44 overflow-y-auto py-1">
              {banksLoading ? (
                <li className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-[#9ca3af]" /></li>
              ) : filteredBanks.length === 0 ? (
                <li className="text-xs text-[#9ca3af] px-3 py-2">No banks found</li>
              ) : filteredBanks.map((bank) => (
                <li key={bank.code}>
                  <button
                    type="button"
                    onClick={() => { setSelectedBank(bank); setShowBankList(false); setBankSearch('') }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f9fafb] transition-colors ${selectedBank?.code === bank.code ? 'text-[#17c666] font-semibold' : 'text-[#283c50]'}`}
                  >
                    {bank.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Account number + verify */}
      <div>
        <label className="block text-xs font-medium text-[#4b5563] mb-1">Account Number <span className="text-[#ea4d4d]">*</span></label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit NUBAN"
            className="flex-1 px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] font-mono focus:outline-none focus:ring-1 focus:ring-[#17c666]"
          />
          <button
            type="button"
            onClick={handleResolve}
            disabled={!selectedBank || accountNumber.length !== 10 || resolving}
            className="px-3 py-2 text-xs rounded border border-[#e5e7eb] text-[#283c50] font-medium disabled:opacity-40 hover:bg-[#f9fafb] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            {resolving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Verify
          </button>
        </div>
        {resolveError && <p className="text-[11px] text-red-600 mt-1">{resolveError}</p>}
      </div>

      {/* Resolved account name */}
      {resolvedName && (
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#86efac] rounded-lg px-3 py-2.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
          <div>
            <p className="text-[11px] text-[#166534]">Account verified</p>
            <p className="text-xs font-semibold text-[#166534]">{resolvedName}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885]">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !resolvedName}
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
    if (kobo > balanceKobo) { setError(`Insufficient balance. Available: ${formatNaira(balanceKobo)}`); return }
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
          max={balanceKobo / 100}
          value={amountNaira}
          onChange={(e) => setAmountNaira(e.target.value)}
          placeholder="Enter amount in Naira"
          className="w-full px-3 py-2 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#17c666]"
        />
        <p className="text-[11px] text-[#9ca3af] mt-1">Available: {formatNaira(balanceKobo)}</p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !amountNaira || balanceKobo === 0}
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
