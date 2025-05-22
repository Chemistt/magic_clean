"use client";

import { PlusIcon } from "lucide-react";
import type { z } from "zod";

import { ServiceForm } from "@/components/profile-service-form";
import type { ServiceSchema } from "@/components/profile-services-datatable";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type ProfileServiceDialogProps = {
	trigger?: React.ReactNode;
	data?: z.infer<typeof ServiceSchema>;
};

export function ProfileServiceDialog({
	trigger,
	data,
}: ProfileServiceDialogProps) {
	return (
		<Dialog>
			{trigger ?? (
				<DialogTrigger asChild>
					<Button variant="outline" size="icon">
						<PlusIcon className="size-4" />
					</Button>
				</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{data ? "Edit Service" : "Add Service"}</DialogTitle>
					<DialogDescription>
						{data
							? "Edit your service details."
							: "Add a new service/specialty to your profile."}
					</DialogDescription>
				</DialogHeader>
				<ServiceForm service={data} />
			</DialogContent>
		</Dialog>
	);
}
