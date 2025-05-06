"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/_components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/_components/ui/form";
import { Textarea } from "@/app/_components/ui/textarea";
import { api } from "@/trpc/react";

const schema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	email: z.string().email({ message: "Invalid email address" }),
	image: z.string(),
	homeOwnerProfile: z.object({
		address: z.string().optional(),
		preferences: z.string().optional(),
		isVerified: z.boolean().optional(),
	}),
});

export function ProfileHomeOwnerForm() {
	const [user] = api.profile.get.useSuspenseQuery();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const updateHomeOwnerProfileMutation =
		api.profile.updateHomeOwnerProfile.useMutation({
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
		});

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: user.name ?? "",
			email: user.email ?? "",
			image: user.image ?? "",
			homeOwnerProfile: {
				address: user.HomeOwnerProfile?.address ?? "",
				preferences: user.HomeOwnerProfile?.preferences ?? "",
				isVerified: user.HomeOwnerProfile?.isVerified,
			},
		},
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);
		try {
			await updateHomeOwnerProfileMutation.mutateAsync(values.homeOwnerProfile);
		} catch (error) {
			console.log("[CLIENT] Error updating profile:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={void form.handleSubmit(onSubmit)} className="space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Home Owner Details</CardTitle>
						<CardDescription>Manage your profile information</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="homeOwnerProfile.address"
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
								name="homeOwnerProfile.preferences"
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
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
