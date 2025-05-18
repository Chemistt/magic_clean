import { BookingList } from "@/components/booking-datatable";
import { api, HydrateClient } from "@/trpc/server";

export default function BookingsPage() {
	void api.booking.getBookings.prefetch();
	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-6xl">
				<BookingList />
			</div>
		</HydrateClient>
	);
}
