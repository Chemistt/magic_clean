"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/react";

const schema = z.object({
	address: z.string().optional(),
	preferences: z.string().optional(),
});

export function ProfileHomeOwnerForm() {
	const trpc = useTRPC();
	const { data: user } = useSuspenseQuery(
		trpc.profile.getCurrentUserProfile.queryOptions()
	);
	const router = useRouter();

	const { mutateAsync: updateHomeOwnerProfile, isPending } = useMutation(
		trpc.profile.upsertHomeOwnerProfile.mutationOptions({
			onSuccess: () => {
				toast("Profile updated", {
					description: "Your home owner profile has been updated successfully.",
				});
				router.refresh();
			},
			onError: (error) => {
				toast("Error", {
					description:
						error.message || "Something went wrong. Please try again.",
				});
			},
		})
	);

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			address: user.HomeOwnerProfile?.address ?? "",
			preferences: user.HomeOwnerProfile?.preferences ?? "",
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit(
						async (values: z.infer<typeof schema>) =>
							await updateHomeOwnerProfile({
								...values,
							})
					)(event);
				}}
				className="space-y-8"
			>
				<Card>
					<CardHeader>
						<CardTitle>Home Owner Details</CardTitle>
						<CardDescription>Manage your profile information</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Your home address"
												className="min-h-[75px]"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="preferences"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Cleaning Preferences</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe your cleaning preferences (e.g., eco-friendly products, specific areas that need attention)"
												className="min-h-[100px]"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>

					<CardFooter className="border-t pt-6">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
