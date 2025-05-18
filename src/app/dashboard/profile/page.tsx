import { Role } from "@prisma/client";

import { ProfileAccountForm } from "@/components/profile-account-form";
import { ProfileFavouritesCard } from "@/components/profile-favourites-card";
import { ProfileCleanerForm } from "@/components/profile-form-cleaner";
import { ProfileHomeOwnerForm } from "@/components/profile-form-homeowner";
import { ProfileServicesCard } from "@/components/profile-services-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

type ProfilePageProps = {
	searchParams: Promise<{ tab: string | undefined }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
	const search = await searchParams;
	const tabParameter = search.tab ?? "account";
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

	const accountTabs = [
		{
			value: "account",
			label: "Account",
		},
	];
	const cleanerTabs = [
		{
			value: "cleaner",
			label: "Cleaner",
		},
		{
			value: "services",
			label: "Services",
		},
	];
	const homeOwnerTabs = [
		{
			value: "home_owner",
			label: "Home Owner",
		},
		{
			value: "favourites",
			label: "Favourites",
		},
	];

	const tabs = [
		...accountTabs,
		...(shouldShowCleanerForm ? cleanerTabs : []),
		...(shouldShowHomeOwnerForm ? homeOwnerTabs : []),
	];

	return (
		<HydrateClient>
			<div className="mx-auto w-full max-w-3xl">
				<Tabs defaultValue={tabParameter} className="justify-center gap-4">
					<TabsList
						className={cn(
							"grid w-full",
							tabs.length === 1 && "grid-cols-1",
							tabs.length === 2 && "grid-cols-2",
							tabs.length === 3 && "grid-cols-3",
							tabs.length === 4 && "grid-cols-4"
						)}
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
							{tab.value === "favourites" && <ProfileFavouritesCard />}
						</TabsContent>
					))}
				</Tabs>
			</div>
		</HydrateClient>
	);
}
