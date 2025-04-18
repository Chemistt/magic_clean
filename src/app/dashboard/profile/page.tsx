import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
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
			<main>
				<h1>Profile</h1>
				<p>Welcome, {session.user.name}!</p>
				<p>Your email: {session.user.email}</p>
				<Avatar>
					<AvatarImage src={session.user.image ?? undefined} />
					<AvatarFallback>{session.user.name?.slice(0, 1)}</AvatarFallback>
				</Avatar>
				{session.user.role === Role.CLEANER ? (
					<p>You are a cleaner.</p>
				) : session.user.role === Role.HOME_OWNER ? (
					<p>You are a home owner.</p>
				) : (
					<p>Your role is not recognized.</p>
				)}
			</main>
		</HydrateClient>
	);
}
