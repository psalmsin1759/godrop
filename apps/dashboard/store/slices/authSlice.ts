import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AdminUser } from '@/types/api'

interface AuthState {
  token: string | null
  admin: AdminUser | null
}

const initialState: AuthState = {
  token: null,
  admin: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }: PayloadAction<{ token: string; admin: AdminUser }>) {
      state.token = payload.token
      state.admin = payload.admin
    },
    clearCredentials(state) {
      state.token = null
      state.admin = null
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
