import Link from 'next/link'

export default function ProductCard({ product }: any) {
  return (
    <Link href={`/product/${product.id}`}>
      <a className="block border rounded p-2 bg-white">
        <div className="h-28 bg-gray-100 mb-2 flex items-center justify-center">Imagen</div>
        <h3 className="text-sm font-medium">{product.title}</h3>
        <div className="text-xs text-gray-600">${product.price}</div>
      </a>
    </Link>
  )
}
