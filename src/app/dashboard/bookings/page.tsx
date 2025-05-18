import { BookingList } from "@/components/booking-datatable";
import { api, HydrateClient } from "@/trpc/server";

export default function BookingsPage() {
	void api.booking.getBookings.prefetch();
	return (
		<div className="mx-auto w-full max-w-6xl">
			<h1 className="text-foreground text-3xl font-extrabold">Bookings</h1>
			<p className="text-muted-foreground mb-4 max-w-2xl text-lg">
				Browse your bookings.
			</p>
			<HydrateClient>
				<BookingList />
			</HydrateClient>
		</div>
	);
}
