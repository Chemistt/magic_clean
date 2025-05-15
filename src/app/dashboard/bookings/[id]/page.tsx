type BookingDetailsProps = {
	params: Promise<{ id: string }>;
};

export default async function BookingDetailsPage({
	params,
}: BookingDetailsProps) {
	const { id } = await params;
	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-4 text-2xl font-bold">Booking Details: {id}</h1>
		</div>
	);
}
