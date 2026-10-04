import PageHeader from '@/components/ui/PageHeader'
import QRScanner from '@/components/admin/QRScanner'

export default function ScanPage() {
  return (
    <>
      <PageHeader title="Scan masuk" subtitle="Scan QR dari halaman check-in member." />
      <div className="px-5"><QRScanner /></div>
    </>
  )
}
