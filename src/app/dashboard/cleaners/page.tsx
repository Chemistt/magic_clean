import { Suspense } from "react";

import { ProfileCleanerList } from "@/components/profile-cleaner-list";
import { Skeleton } from "@/components/ui/skeleton";
import { api, HydrateClient } from "@/trpc/server";

export default function CleanerListPage() {
	void api.profile.getAllCleaners.prefetch();

	return (
		<HydrateClient>
			<Suspense fallback={<Skeleton className="h-full w-full" />}>
				<ProfileCleanerList />
			</Suspense>
		</HydrateClient>
	);
}
