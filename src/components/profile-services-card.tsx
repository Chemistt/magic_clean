"use client";

import { PlusIcon } from "lucide-react";

import { NewServiceForm } from "@/components/profile-new-service-form";
import {
	ProfileServiceDataTable,
	ServiceSchema,
} from "@/components/profile-services-datatable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
			<CardHeader className="flex items-center justify-between">
				<div>
					<CardTitle>Services Offered</CardTitle>
					<CardDescription>Manage your services here</CardDescription>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="icon">
							<PlusIcon className="size-4" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Service</DialogTitle>
							<DialogDescription>
								Add a new service/specialty to your profile.
							</DialogDescription>
						</DialogHeader>
						<NewServiceForm />
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<ProfileServiceDataTable services={services} />
			</CardContent>
		</Card>
	);
}
