import React, { useState, useEffect } from 'react'
import { createTransactionApi, getTransactionApi, getProductApi } from '../services/api'
import { useAppDispatch } from '../store/hooks'
import { upsertTransaction } from '../store/slices/transactionsSlice'

function luhnCheck(cardNumber: string) {
  const s = cardNumber.replace(/\D/g, '')
  if (!s || s.length < 13) return false
  let sum = 0
  let shouldDouble = false
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = parseInt(s.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export default function PaymentModal({ product, onClose }: any) {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<'form'|'summary'|'processing'|'result'>('form')
  const [error, setError] = useState<string | null>(null)
  const [tx, setTx] = useState<any>(null)

  const [form, setForm] = useState({
    quantity: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    cardNumber: '',
    cardExp: '',
    cardCvc: ''
  })

  const baseFee = 1.50
  const shipping = 5.00

  const amount = Number(product.price) * form.quantity
  const total = Number((amount + baseFee + shipping).toFixed(2))

  const validateForm = () => {
    // name + email
    if (!form.customerName || !form.customerEmail) {
      setError('Nombre y email son requeridos')
      return false
    }
    // basic email format
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRe.test(form.customerEmail)) {
      setError('Email inválido')
      return false
    }
    // quantity
    if (!form.quantity || form.quantity < 1) {
      setError('Cantidad inválida')
      return false
    }
    // card number (luhn)
    if (!luhnCheck(form.cardNumber)) { setError('Número de tarjeta inválido'); return false }
    // expiry MM/YY and not expired
    if (!/^\d{2}\/\d{2}$/.test(form.cardExp)) { setError('Fecha de expiración inválida (MM/YY)'); return false }
    const [mmStr, yyStr] = form.cardExp.split('/')
    const mm = Number(mmStr)
    const yy = Number(yyStr)
    if (Number.isNaN(mm) || Number.isNaN(yy) || mm < 1 || mm > 12) { setError('Fecha de expiración inválida'); return false }
    const now = new Date()
    const expYear = 2000 + yy
    // last moment of expiration month
    const expLast = new Date(expYear, mm, 0, 23, 59, 59, 999)
    if (expLast < now) { setError('Tarjeta expirada'); return false }
    // cvc
    if (!/^[0-9]{3,4}$/.test(form.cardCvc)) { setError('CVC inválido'); return false }
    return true
  }

  const handleCreate = async () => {
    setError(null)
    if (!validateForm()) return
    setStep('processing')
    try {
      const body = {
        productId: product.id,
        quantity: form.quantity,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress
      }
      // guard: product must be available before creating transaction
      if (product.available === false) {
        setError('Producto no disponible')
        setStep('form')
        return
      }
      const created = await createTransactionApi(body)
      // backend may return { isOk: false, error: '...' }
      if (created && created.isOk === false) {
        setError(created.error || 'Error del servidor')
        setStep('form')
        return
      }
      // determine id from response (backend may name it differently)
      const txId = created?.id || created?.transactionId || created?.txId || created?.data?.id || created?.transaction?.id
      if (!txId) {
        setError('Respuesta inválida del servidor: transaction id no encontrado')
        setStep('form')
        return
      }
      // debug: show raw response in console
      console.log('createTransaction response', created)
      // store in redux (ensure id present)
      const createdWithId = { ...(created as any), id: txId }
      console.log('resolved tx id', txId)
      dispatch(upsertTransaction(createdWithId))
      setTx(createdWithId)

      // poll for status
      // Stop when transaction reaches a terminal status reported by the backend (or Wompi).
      // Common terminal statuses: APPROVED, DECLINED, FAILED, CANCELLED, EXPIRED, ERROR
      const terminalStatuses = ['APPROVED', 'DECLINED', 'FAILED', 'CANCELLED', 'EXPIRED', 'ERROR']
      const pollIntervalMs = 2000
      const maxAttempts = 30 // safety timeout: 30 attempts * 2s = ~1 minute
      let attempts = 0
      const poll = setInterval(async () => {
        attempts += 1
        try {
          const statusTx = await getTransactionApi(txId)
          dispatch(upsertTransaction(statusTx))
          const status = (statusTx?.status || '').toString().toUpperCase()
          if (terminalStatuses.includes(status)) {
            clearInterval(poll)
            setTx(statusTx)
            setStep('result')
            // refresh product stock
            await getProductApi(product.id)
            return
          }
          if (attempts >= maxAttempts) {
            clearInterval(poll)
            setError('Tiempo de espera agotado; por favor verifica en Transacciones más tarde')
            setStep('form')
            return
          }
        } catch (err) {
          console.error('poll err', err)
          // on repeated unexpected errors, stop polling to avoid infinite loops
          if (attempts >= maxAttempts) {
            clearInterval(poll)
            setError('Error al consultar el estado de la transacción')
            setStep('form')
          }
        }
      }, pollIntervalMs)

    } catch (err: any) {
      setError(err?.response?.data?.error || String(err))
      setStep('form')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '92%', maxWidth: 420, background: '#fff', borderRadius: 8, padding: 16 }}>
        <button onClick={onClose} style={{ float: 'right' }}>Cerrar</button>
        <h3 style={{ marginTop: 4 }}>{product.name}</h3>
        {step === 'form' && (
          <div>
            <label className="text-sm">Nombre</label>
            <input value={form.customerName} onChange={(e)=>setForm({...form, customerName:e.target.value})} className="p-2 block w-full mb-2 border border-gray-300 rounded" />
            <label className="text-sm">Email</label>
            <input value={form.customerEmail} onChange={(e)=>setForm({...form, customerEmail:e.target.value})} className="p-2 block w-full mb-2 border border-gray-300 rounded" />
            <label className="text-sm">Teléfono</label>
            <input value={form.customerPhone} onChange={(e)=>setForm({...form, customerPhone:e.target.value})} className="p-2 block w-full mb-2 border border-gray-300 rounded" placeholder="+57 300 000 0000" />
            <label className="text-sm">Dirección</label>
            <input value={form.deliveryAddress} onChange={(e)=>setForm({...form, deliveryAddress:e.target.value})} className="p-2 block w-full mb-2 border border-gray-300 rounded" />
            <label className="text-sm">Cantidad</label>
            <input type="number" min={1} value={form.quantity} onChange={(e)=>setForm({...form, quantity: Number(e.target.value)})} className="p-2 block w-full mb-2 border border-gray-300 rounded" />
            <label className="text-sm">Número de tarjeta</label>
            <input
              value={form.cardNumber}
              onChange={(e)=>{
                // Allow only digits, max 19 (for some cards), and format in groups of 4
                const raw = e.target.value.replace(/\D/g, '').slice(0,19)
                const grouped = raw.replace(/(.{4})/g, '$1 ').trim()
                setForm({...form, cardNumber: grouped})
              }}
              className="p-2 block w-full mb-2 border border-gray-300 rounded"
              placeholder="4111 1111 1111 1111"
            />
            <div style={{display:'flex', gap:8}}>
              <input
                placeholder="MM/YY"
                value={form.cardExp}
                onChange={(e)=>{
                  // format as MM/YY
                  const digits = e.target.value.replace(/\D/g, '').slice(0,4)
                  let v = digits
                  if (digits.length > 2) v = digits.slice(0,2) + '/' + digits.slice(2)
                  setForm({...form, cardExp: v})
                }}
                className="p-2 block w-1/2 mb-2 border border-gray-300 rounded"
              />
              <input
                placeholder="CVC"
                value={form.cardCvc}
                onChange={(e)=>{
                  const digits = e.target.value.replace(/\D/g, '').slice(0,4)
                  setForm({...form, cardCvc: digits})
                }}
                className="p-2 block w-1/2 mb-2 border border-gray-300 rounded"
              />
            </div>
            {error && <div style={{color:'red'}}>{error}</div>}
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button onClick={()=>{ setError(null); if (product.available === false) { setError('Producto no disponible'); return } if (validateForm()) setStep('summary') }} className="px-4 py-2 bg-blue-600 text-white rounded">Siguiente</button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div>
            <h4>Resumen</h4>
            <div>Producto: {product.name}</div>
            <div>Subtotal: ${amount.toFixed(2)}</div>
            <div>Base Fee: ${baseFee.toFixed(2)}</div>
            <div>Envío: ${shipping.toFixed(2)}</div>
            <div className="font-bold">Total: ${total.toFixed(2)}</div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button onClick={()=>setStep('form')} className="px-4 py-2">Volver</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Pagar</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div>
            <h4>Procesando pago...</h4>
            <p>Pendiente de confirmación. Esto puede tardar unos segundos.</p>
          </div>
        )}

        {step === 'result' && tx && (
          <div>
            <h4>Resultado: {tx.status}</h4>
            <div>ID: {tx.id}</div>
            <div>Monto: ${tx.amountTotal ?? total}</div>
            <div style={{marginTop:8}}>
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
