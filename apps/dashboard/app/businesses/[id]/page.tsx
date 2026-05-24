import BusinessDetailPage from '@/features/businesses/BusinessDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <BusinessDetailPage businessId={params.id} />
}
