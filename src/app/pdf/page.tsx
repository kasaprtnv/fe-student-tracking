import ViewPdf from '@/components/view-pdf';

export default function PdfViewer() {
  return (
    <div>
      <ViewPdf url="/pdfName.pdf" filename="pdfName.pdf" />
    </div>
  );
}
