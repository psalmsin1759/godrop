import CustomerDetailPage from '@/features/customers/components/CustomerDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerDetailPage customerId={params.id} />
}
