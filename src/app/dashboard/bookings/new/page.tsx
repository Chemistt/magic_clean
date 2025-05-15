// import NewBookingForm from "@/components/booking-form"; // Assuming this path for the form component

type NewBookingPageProps = {
	searchParams: Promise<{
		cleanerId?: string | undefined;
	}>;
};

export default async function NewBookingPage({
	searchParams,
}: NewBookingPageProps) {
	const searchParameters = await searchParams;
	const cleanerId = searchParameters.cleanerId ?? "";

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-4 text-2xl font-bold">Create New Booking</h1>
			<p>{cleanerId}</p>
			{/* <NewBookingForm initialCleanerId={cleanerId} /> */}
		</div>
	);
}
