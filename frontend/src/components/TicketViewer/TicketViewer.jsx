import { useParams } from 'react-router-dom'
import { getApiUrl } from '../../config'

export default function TicketViewer() {
  const { publicId } = useParams()
  const pdfUrl = `${getApiUrl()}/api/service/public/${publicId}/print-ticket`

  return (
    <iframe
      src={pdfUrl}
      title="Comprobante PDF"
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        display: 'block',
      }}
    />
  )
}
