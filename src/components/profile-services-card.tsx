"use client";

import { ProfileServiceDialog } from "@/components/profile-service-dialog";
import {
	ProfileServiceDataTable,
	ServiceSchema,
} from "@/components/profile-services-datatable";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";

export function ProfileServicesCard() {
	const [data] = api.service.getCurrentUserServices.useSuspenseQuery();
	api.service.getCategories.usePrefetchQuery();

	const services = ServiceSchema.array().parse(data);

	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div>
					<CardTitle>Services Offered</CardTitle>
					<CardDescription>Manage your services here</CardDescription>
				</div>
				<ProfileServiceDialog />
			</CardHeader>
			<CardContent>
				<ProfileServiceDataTable services={services} />
			</CardContent>
		</Card>
	);
}
