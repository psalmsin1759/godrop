import VendorDetailPage from '@/features/vendors/VendorDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <VendorDetailPage vendorId={params.id} />
}
