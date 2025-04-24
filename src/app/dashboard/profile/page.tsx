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

	const shouldShowCleanerForm = session.user.role === Role.CLEANER;
	const shouldShowHomeOwnerForm = session.user.role === Role.HOME_OWNER;
	const shouldShowAdminForm = session.user.role === Role.ADMIN;
	const shouldShowPlatformManagerForm =
		session.user.role === Role.PLATFORM_MANAGER;
	return (
		<HydrateClient>
			<>
				{shouldShowCleanerForm && <ProfileCleanerForm />}
				{shouldShowHomeOwnerForm && <p>You are a home owner.</p>}
				{shouldShowAdminForm && <p>You are an admin.</p>}
				{shouldShowPlatformManagerForm && <p>You are a platform manager.</p>}
			</>
		</HydrateClient>
	);
}
