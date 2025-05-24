"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
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
	data?: z.infer<typeof ServiceSchema>;
};

export function ProfileServiceDialog({ data }: ProfileServiceDialogProps) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" size="icon">
					{data ? (
						<PencilIcon className="size-4" />
					) : (
						<PlusIcon className="size-4" />
					)}
				</Button>
			</DialogTrigger>
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
