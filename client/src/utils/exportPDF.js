import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

export async function exportToPDF(elementId, filename = 'analytics-report') {
  const el = document.getElementById(elementId)
  if (!el) {
    toast.error('Could not find content to export')
    return
  }

  const toastId = toast.loading('Generating PDF...')

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0a0a0f',
      logging: false,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add branding header
    pdf.setFillColor(10, 10, 15)
    pdf.rect(0, 0, pageWidth, 12, 'F')
    pdf.setTextColor(124, 58, 237)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CodePulse Analytics Report', 10, 8)
    pdf.setFontSize(8)
    pdf.setTextColor(156, 163, 175)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 10, 8, { align: 'right' })

    position = 15
    heightLeft -= pageHeight - 15

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF exported successfully!', { id: toastId })
  } catch (err) {
    console.error('PDF export failed:', err)
    toast.error('Failed to export PDF', { id: toastId })
  }
}
