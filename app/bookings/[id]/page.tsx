import BookingDetail from './BookingDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return <BookingDetail bookingId={params.id} />;
}