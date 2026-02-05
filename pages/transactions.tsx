import Link from 'next/link'
import { useAppSelector } from '../store/hooks'
import { useAppDispatch } from '../store/hooks'
import { updateTransactionStatus } from '../store/slices/transactionsSlice'

export default function Transactions() {
  const transactions = useAppSelector((s) => s.transactions.items)
  const dispatch = useAppDispatch()

  const handleSimulate = (id: string) => {
    // simulate a successful payment
    dispatch<any>(updateTransactionStatus(id, 'paid'))
  }

  return (
    <div className="container-mobile">
      <Link href="/">← Volver</Link>
      <h2 className="text-lg font-semibold my-2">Transacciones</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id} className="border p-3 mb-2 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Producto: {t.productId}</div>
                <div className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${t.amount}</div>
                <div className="text-sm" style={{ color: t.status === 'paid' ? '#16a34a' : '#f59e0b' }}>{t.status}</div>
                {t.status !== 'paid' && (
                  <button onClick={() => handleSimulate(t.id)} className="px-4 py-2 mt-2 bg-blue-600 text-white rounded">
                    Simular Pago
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
