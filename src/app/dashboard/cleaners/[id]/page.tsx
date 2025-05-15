import { Suspense } from "react";

import { ViewCleanerProfile } from "@/components/profile-view-cleaner";
import { api, HydrateClient } from "@/trpc/server";

type CleanerProfileProps = {
	params: Promise<{ id: string }>;
};

export default async function CleanerProfilePage({
	params,
}: CleanerProfileProps) {
	const { id } = await params;

	void api.profile.getSpecificCleanerProfile.prefetch({ id });

	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-3xl">
				<Suspense fallback={<p>Loading...</p>}>
					<ViewCleanerProfile cleanerId={id} />
				</Suspense>
			</div>
		</HydrateClient>
	);
}
