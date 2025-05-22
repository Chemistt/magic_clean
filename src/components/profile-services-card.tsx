import { ProfileServiceDialog } from "@/components/profile-service-dialog";
import { ProfileServiceDataTable } from "@/components/profile-services-datatable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api, HydrateClient, prefetch } from "@/trpc/server";

export function ProfileServicesCard() {
	prefetch(api.service.getCurrentUserServices.queryOptions());
	prefetch(api.service.getCategories.queryOptions());
	return (
		<HydrateClient>
			<Card>
				<CardHeader className="flex items-center justify-between">
					<div>
						<CardTitle>Services Offered</CardTitle>
						<CardDescription>Manage your services here</CardDescription>
					</div>
					<ProfileServiceDialog />
				</CardHeader>
				<CardContent>
					<ProfileServiceDataTable />
				</CardContent>
			</Card>
		</HydrateClient>
	);
}
