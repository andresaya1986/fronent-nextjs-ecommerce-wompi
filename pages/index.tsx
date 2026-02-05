import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProducts } from '../store/slices/productsSlice'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const dispatch = useAppDispatch()
  const products = useAppSelector((s) => s.products.items)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="container-mobile">
      <Head>
        <title>Wompi Demo</title>
      </Head>
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tienda</h1>
        <Link href="/transactions">
          <a className="text-sm text-blue-600">Transacciones</a>
        </Link>
      </header>

      <main>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
    </div>
  )
}
