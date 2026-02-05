import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  const res = await axios.get(`${base}/products`)
  return res.data
})

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [] as any[] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      // backend returns { id, name, description, price, available }
      state.items = action.payload.map((p: any) => ({
        id: p.id,
        title: p.name ?? p.title,
        description: p.description,
        price: p.price,
        available: p.available ?? true,
      }))
    })
  }
})

export default productsSlice.reducer
