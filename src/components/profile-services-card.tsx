"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

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
import { useTRPC } from "@/trpc/react";
import { prefetch } from "@/trpc/server";

export function ProfileServicesCard() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.service.getCurrentUserServices.queryOptions()
	);
	prefetch(trpc.service.getCategories.queryOptions());

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
