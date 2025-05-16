import { Role } from "@prisma/client";

import { ProfileAccountForm } from "@/components/profile-account-form";
import { ProfileCleanerForm } from "@/components/profile-form-cleaner";
import { ProfileHomeOwnerForm } from "@/components/profile-form-homeowner";
import { ProfileServicesCard } from "@/components/profile-services-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
	void api.profile.getCurrentUserProfile.prefetch();

	const shouldShowCleanerForm = session.user.role === Role.CLEANER;
	const shouldShowHomeOwnerForm = session.user.role === Role.HOME_OWNER;
	// const shouldShowAdminForm = session.user.role === Role.ADMIN;
	// const shouldShowPlatformManagerForm =
	// 	session.user.role === Role.PLATFORM_MANAGER;
	// const shouldShowUnknownForm = session.user.role === Role.UNKNOWN;

	const tabs = [
		{
			value: "account",
			label: "Account",
		},
	];

	if (shouldShowCleanerForm) {
		tabs.push(
			{
				value: "cleaner",
				label: "Cleaner",
			},
			{
				value: "services",
				label: "Services",
			}
		);
	}
	if (shouldShowHomeOwnerForm) {
		tabs.push({
			value: "home_owner",
			label: "Home Owner",
		});
	}

	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-3xl">
				<Tabs
					defaultValue="account"
					orientation="vertical"
					className="justify-center gap-4"
				>
					<TabsList
						className={cn("grid w-full", `grid-cols-${String(tabs.length)}`)}
					>
						{tabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{tabs.map((tab) => (
						<TabsContent key={tab.value} value={tab.value}>
							{tab.value === "account" && <ProfileAccountForm />}
							{tab.value === "cleaner" && <ProfileCleanerForm />}
							{tab.value === "services" && <ProfileServicesCard />}
							{tab.value === "home_owner" && <ProfileHomeOwnerForm />}
						</TabsContent>
					))}
				</Tabs>
			</div>
		</HydrateClient>
	);
}
