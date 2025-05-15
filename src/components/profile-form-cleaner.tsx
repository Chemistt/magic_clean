"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const schema = z.object({
	bio: z.string().optional(),
	yearsExperience: z.number().int().min(0).optional(),
	askingPrice: z.number().positive().optional(), // For Decimal in Prisma
	avalibility: z.string().optional(),
	age: z.number().int().positive().optional(),
});

export function ProfileCleanerForm() {
	const [user] = api.profile.getCurrentUserProfile.useSuspenseQuery();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const updateCleanerProfileMutation =
		api.profile.upsertCleanerProfile.useMutation({
			onSuccess: () => {
				toast("Profile updated", {
					description: "Your cleaner profile has been updated successfully.",
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
			bio: user.CleanerProfile?.bio ?? "",
			yearsExperience: user.CleanerProfile?.yearsExperience ?? 0,
			askingPrice: user.CleanerProfile?.askingPrice
				? Number(user.CleanerProfile.askingPrice)
				: 0,
			avalibility: user.CleanerProfile?.avalibility ?? "",
			age: user.CleanerProfile?.age ?? 0,
		},
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);
		try {
			await updateCleanerProfileMutation.mutateAsync({
				...values,
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
				className="space-y-8"
			>
				<Card>
					<CardHeader>
						<CardTitle>Cleaner Details</CardTitle>
						<CardDescription>Manage your job details here</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bio</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell clients about yourself and your cleaning experience"
												className="min-h-[100px]"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="yearsExperience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Years of Experience</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													{...field}
													value={field.value ?? 0}
													onChange={(error) => {
														field.onChange(Number.parseInt(error.target.value));
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="askingPrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hourly Rate ($)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													step="0.01"
													{...field}
													value={field.value ?? 0}
													onChange={(error) => {
														field.onChange(
															Number.parseFloat(error.target.value)
														);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="avalibility"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Availability</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Provide your general availability (e.g., weekdays 9-5, weekends only, etc.)"
												className="min-h-[80px]"
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
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Age</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="18"
												{...field}
												value={field.value ?? ""}
												onChange={(error) => {
													field.onChange(
														Number.parseInt(error.target.value) || undefined
													);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end border-t pt-6">
						<Button type="submit" className="" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
