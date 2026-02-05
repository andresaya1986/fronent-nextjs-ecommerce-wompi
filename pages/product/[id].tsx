import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useState } from 'react'
import PaymentModal from '../../components/PaymentModal'

export default function ProductPage() {
  const router = useRouter()
  const { id } = router.query
  const product = useAppSelector((s) => s.products.items.find((p) => String(p.id) === String(id)))
  const dispatch = useAppDispatch()
  const [show, setShow] = useState(false)

  if (!product) return <div className="container-mobile">Cargando...</div>

  const handleBuy = () => {
    setShow(true)
  }

  return (
    <div className="container-mobile">
      <Link href="/">← Volver</Link>
      <h2 className="text-lg font-semibold my-2">{product.title}</h2>
      <p className="mb-4">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">${product.price}</span>
        <button onClick={handleBuy} className="bg-blue-600 text-white px-4 py-2 rounded">
          Pagar con tarjeta
        </button>
      </div>

      {show && <PaymentModal product={product} onClose={() => setShow(false)} />}
    </div>
  )
}
