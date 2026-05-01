import OrderDetailPage from '@/features/orders/OrderDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <OrderDetailPage orderId={params.id} />
}
