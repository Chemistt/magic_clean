import { Role } from "@prisma/client";
import { Suspense } from "react";

import { ViewCleanerProfile } from "@/components/profile-cleaner-details";
import { Skeleton } from "@/components/ui/skeleton";
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
			<Suspense fallback={<Skeleton className="h-full w-full" />}>
				<div className="mx-auto w-full max-w-3xl">
					<ViewCleanerProfile
						cleanerId={id}
						user={{
							id: session?.user.id ?? "",
							role: session?.user.role ?? Role.HOME_OWNER,
						}}
					/>
				</div>
			</Suspense>
		</HydrateClient>
	);
}
