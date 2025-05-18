import { Suspense } from "react";

import { ProfileCleanerList } from "@/components/profile-cleaner-list";
import { api, HydrateClient } from "@/trpc/server";

export default function CleanerListPage() {
	void api.profile.getAllCleaners.prefetch();

	return (
		<HydrateClient>
			<Suspense fallback={<p>Loading cleaners...</p>}>
				<ProfileCleanerList />
			</Suspense>
		</HydrateClient>
	);
}
