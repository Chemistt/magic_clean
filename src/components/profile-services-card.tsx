"use client";

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
	const [user] = api.profile.getCurrentUserProfile.useSuspenseQuery();

	const rawServices = user.CleanerProfile?.servicesOffered.map((service) => ({
		id: service.id,
		name: service.name,
		description: service.description ?? "",
		isActive: service.isActive,
		category: {
			id: service.category.id,
			name: service.category.name,
		},
	}));

	const services = ServiceSchema.array().parse(rawServices ?? []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Services Offered</CardTitle>
				<CardDescription>Manage your services here</CardDescription>
			</CardHeader>
			<CardContent>
				<ProfileServiceDataTable services={services} />
			</CardContent>
		</Card>
	);
}
