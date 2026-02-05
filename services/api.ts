import axios from 'axios'

const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: base,
  timeout: 5000,
})

export default api

export const createTransactionApi = async (body: any) => {
  const res = await api.post('/transactions', body)
  return res.data?.value ?? res.data
}

export const getTransactionApi = async (id: string) => {
  const res = await api.get(`/transactions/${id}`)
  return res.data?.value ?? res.data
}

export const getProductApi = async (id: number | string) => {
  const res = await api.get(`/products/${id}`)
  return res.data?.value ?? res.data
}
