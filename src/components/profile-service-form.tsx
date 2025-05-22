"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
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
import { useTRPC } from "@/trpc/react";

const schema = z.object({
	name: z.string(),
	description: z.string(),
	categoryId: z.string(),
});

type ServiceFormProps = {
	service?: z.infer<typeof ServiceSchema>;
};

export function ServiceForm({ service }: ServiceFormProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: categories } = useSuspenseQuery(
		trpc.service.getCategories.queryOptions()
	);

	const { mutateAsync: updateService, isPending } = useMutation(
		trpc.service.upsertService.mutationOptions({
			onSuccess: async () => {
				toast("Service updated", {
					description: "Your service has been updated successfully.",
				});
				await queryClient.invalidateQueries(
					trpc.service.getCurrentUserServices.queryFilter()
				);
			},
			onError: (error) => {
				toast.error(error.message || "Something went wrong. Please try again.");
			},
		})
	);
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: service
			? {
					name: service.name,
					description: service.description ?? "",
					categoryId: service.category.id.toString(),
				}
			: undefined,
	});

	return (
		<Form {...form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit(
						async (values: z.infer<typeof schema>) =>
							await updateService({
								...values,
								categoryId: Number(values.categoryId),
								...(service && { id: service.id }),
							})
					)(event);
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
						<Button type="submit" className="" disabled={isPending}>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
