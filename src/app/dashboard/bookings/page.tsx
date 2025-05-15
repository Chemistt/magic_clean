import { ProfileCleanerList } from "@/components/profile-cleaner-list";
import { api, HydrateClient } from "@/trpc/server";

export default function BookingsPage() {
	void api.profile.getAllCleaners.prefetch();

	return (
		<HydrateClient>
			<ProfileCleanerList />
		</HydrateClient>
	);
}
