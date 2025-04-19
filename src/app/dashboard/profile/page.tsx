import { ProfileCleanerForm } from "@components/profile-form-cleaner";
import { Role } from "@prisma/client";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function ProfilePage() {
	const session = await auth();
	if (!session) {
		return (
			<main>
				<h1>Unauthorized</h1>
				<p>You must be logged in to view this page.</p>
			</main>
		);
	}

	// Prefetch user profile
	void api.profile.get.prefetch();

	return (
		<HydrateClient>
			<>
				{session.user.role === Role.CLEANER ? (
					<ProfileCleanerForm />
				) : session.user.role === Role.HOME_OWNER ? (
					<p>You are a home owner.</p>
				) : (
					<p>Your role is not recognized.</p>
				)}
			</>
		</HydrateClient>
	);
}
