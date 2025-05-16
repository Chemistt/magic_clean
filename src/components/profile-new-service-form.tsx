"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const schema = z.object({
	name: z.string(),
	description: z.string(),
	isActive: z.boolean(),
	categoryId: z.string(),
});

export function NewServiceForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [categories] = api.service.getCategories.useSuspenseQuery();

	const updateServiceMutation = api.service.upsertService.useMutation({
		onSuccess: () => {
			toast("Service updated", {
				description: "Your service has been updated successfully.",
			});
			router.refresh();
		},
		onError: (error) => {
			toast("Error", {
				description: error.message || "Something went wrong. Please try again.",
			});
		},
	});

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			description: "",
			isActive: true,
			categoryId: undefined,
		},
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);
		try {
			await updateServiceMutation.mutateAsync({
				...values,
				categoryId: Number(values.categoryId),
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
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
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
								<Textarea {...field} />
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
										field.onChange(Number(value));
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Category</SelectLabel>
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.id.toString()}
												>
													{category.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</FormControl>
						</FormItem>
					)}
				/>
				<DialogFooter>
					<Button type="submit" className="" disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
