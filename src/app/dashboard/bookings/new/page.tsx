import { BookingForm } from "@/components/booking-form";
import { api, HydrateClient } from "@/trpc/server";

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

	void api.profile.getSpecificCleanerProfile.prefetch({ id: cleanerId });

	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-3xl">
				<BookingForm cleanerId={cleanerId} />
			</div>
		</HydrateClient>
	);
}
