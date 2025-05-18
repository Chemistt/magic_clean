"use client";

import { ProfileFavouritesDataTable } from "@/components/profile-favourites-datatable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";

export function ProfileFavouritesCard() {
	api.favourites.getCurrentUserFavourites.usePrefetchQuery();

	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div>
					<CardTitle>Favourites</CardTitle>
					<CardDescription>Manage your favourites here</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<ProfileFavouritesDataTable />
			</CardContent>
		</Card>
	);
}
