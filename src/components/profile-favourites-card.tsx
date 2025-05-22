import { ProfileFavouritesDataTable } from "@/components/profile-favourites-datatable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api, HydrateClient, prefetch } from "@/trpc/server";

export function ProfileFavouritesCard() {
	prefetch(api.favourites.getCurrentUserFavourites.queryOptions());

	return (
		<HydrateClient>
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
		</HydrateClient>
	);
}
