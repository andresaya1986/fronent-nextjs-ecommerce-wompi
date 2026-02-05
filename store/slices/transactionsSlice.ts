import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Transaction = {
  id: string
  productId: number | string
  amount: number
  status: string
  createdAt: string
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { items: [] as Transaction[] },
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.items.unshift(action.payload)
    },
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload
    },
    upsertTransaction(state, action: PayloadAction<Transaction>) {
      const idx = state.items.findIndex((t) => t.id === action.payload.id)
      if (idx === -1) state.items.unshift(action.payload)
      else state.items[idx] = action.payload
    }
  }
})

export const { addTransaction, setTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer

// extra action to update status
export const { upsertTransaction } = transactionsSlice.actions

export const updateTransactionStatus = (id: string, status: string) => (dispatch: any, getState: any) => {
  const state = getState()
  const items: Transaction[] = state.transactions.items.map((t: Transaction) => t.id === id ? { ...t, status } : t)
  dispatch(setTransactions(items))
}
