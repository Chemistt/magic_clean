import { Role } from "@prisma/client";

import { BookingList } from "@/components/booking-datatable";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/server/auth";
import { api, HydrateClient, prefetch } from "@/trpc/server";

export default async function BookingsPage() {
	prefetch(api.booking.getBookings.queryOptions());
	const session = await auth();
	return (
		<div className="mx-auto w-full max-w-6xl">
			<h1 className="text-foreground text-3xl font-extrabold">
				Bookings{" "}
				<Badge variant="outline" className="text-muted-foreground text-sm">
					{session?.user.role === Role.HOME_OWNER ? "HOME OWNER" : "CLEANER"}
				</Badge>
			</h1>
			<p className="text-muted-foreground mb-4 max-w-2xl text-lg">
				Browse your bookings.
			</p>
			<HydrateClient>
				<BookingList role={session?.user.role ?? Role.HOME_OWNER} />
			</HydrateClient>
		</div>
	);
}
