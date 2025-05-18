import { Role } from "@prisma/client";
import { Suspense } from "react";

import { ViewCleanerProfile } from "@/components/profile-cleaner-details";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

type CleanerProfileProps = {
	params: Promise<{ id: string }>;
};

export default async function CleanerProfilePage({
	params,
}: CleanerProfileProps) {
	const { id } = await params;

	void api.profile.getSpecificCleanerProfile.prefetch({ id });
	void api.service.getCategories.prefetch();

	const session = await auth();
	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-3xl">
				<Suspense fallback={<p>Loading...</p>}>
					<ViewCleanerProfile
						cleanerId={id}
						user={{
							id: session?.user.id ?? "",
							role: session?.user.role ?? Role.HOME_OWNER,
						}}
					/>
				</Suspense>
			</div>
		</HydrateClient>
	);
}
