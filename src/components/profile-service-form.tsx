"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { ServiceSchema } from "@/components/profile-services-datatable";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const schema = z.object({
	name: z.string(),
	description: z.string(),
	categoryId: z.string(),
});

type ServiceFormProps = {
	service?: z.infer<typeof ServiceSchema>;
};

export function ServiceForm({ service }: ServiceFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const utils = api.useUtils();

	const [categories] = api.service.getCategories.useSuspenseQuery();

	const updateServiceMutation = api.service.upsertService.useMutation({
		onSuccess: async () => {
			toast("Service updated", {
				description: "Your service has been updated successfully.",
			});

			// TODO: Fix datatable not showing latest data
			await utils.service.getCurrentUserServices.invalidate();
		},
		onError: (error) => {
			toast("Error", {
				description: error.message || "Something went wrong. Please try again.",
			});
		},
	});

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: service
			? {
					name: service.name,
					description: service.description,
					categoryId: service.category.id.toString(),
				}
			: undefined,
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);
		try {
			await updateServiceMutation.mutateAsync({
				...values,
				categoryId: Number(values.categoryId),
				...(service && { id: service.id }),
			});
		} catch (error) {
			console.log("[CLIENT] Error updating profile:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit(onSubmit)(event);
				}}
				className="space-y-10"
			>
				<div className="grid gap-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} placeholder="e.g. Carpet Cleaning" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="e.g. We clean carpets using a steam cleaner"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Category</FormLabel>
								<FormControl>
									<Select
										name={field.name}
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a Category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.id.toString()}
												>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="submit" className="" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
