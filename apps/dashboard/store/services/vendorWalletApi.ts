import { api } from '@/store/baseApi'

export interface VendorWalletTx {
  id: string
  type: string
  amountKobo: number
  reference: string | null
  description: string | null
  createdAt: string
}

export interface VendorBankAccount {
  id: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const vendorWalletApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVendorWallet: build.query<{ balanceKobo: number }, void>({
      query: () => '/vendor-admin/wallet',
      providesTags: ['VendorWallet'],
    }),

    getVendorWalletTransactions: build.query<{ data: VendorWalletTx[]; meta: Pagination }, { page?: number; limit?: number } | void>({
      query: (p) => ({ url: '/vendor-admin/wallet/transactions', params: { page: p?.page ?? 1, limit: p?.limit ?? 20 } }),
      providesTags: ['VendorWallet'],
    }),

    getVendorBankAccount: build.query<{ account: VendorBankAccount | null }, void>({
      query: () => '/vendor-admin/wallet/bank-account',
      providesTags: ['VendorWallet'],
    }),

    saveVendorBankAccount: build.mutation<{ account: VendorBankAccount }, { bankName: string; bankCode: string; accountNumber: string; accountName: string }>({
      query: (body) => ({ url: '/vendor-admin/wallet/bank-account', method: 'POST', body }),
      invalidatesTags: ['VendorWallet'],
    }),

    withdrawVendorWallet: build.mutation<{ message: string }, { amountKobo: number }>({
      query: (body) => ({ url: '/vendor-admin/wallet/withdraw', method: 'POST', body }),
      invalidatesTags: ['VendorWallet'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVendorWalletQuery,
  useGetVendorWalletTransactionsQuery,
  useGetVendorBankAccountQuery,
  useSaveVendorBankAccountMutation,
  useWithdrawVendorWalletMutation,
} = vendorWalletApi
