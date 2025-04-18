"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
// import {
// 	type CleanerProfile,
// 	type HomeOwnerProfile,
// 	type User,
// } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/trpc/react";

const schema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	email: z.string().email({ message: "Invalid email address" }),
	image: z.string(),
	cleanerProfile: z.object({
		bio: z.string().optional(),
		yearsExperience: z.number().int().min(0).optional(),
		hourlyRate: z.number().int().positive().optional(),
	}),
});

// type UserWithProfile = User & {
// 	HomeOwnerProfile: HomeOwnerProfile | null;
// 	CleanerProfile: CleanerProfile | null;
// };

export function ProfileCleanerForm() {
	const [user] = api.profile.get.useSuspenseQuery();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const updateCleanerProfileMutation =
		api.profile.updateCleanerProfile.useMutation({
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
			name: user.name ?? "",
			email: user.email ?? "",
			image: user.image ?? "",
			cleanerProfile: {
				bio: user.CleanerProfile?.bio ?? "",
				yearsExperience: user.CleanerProfile?.yearsExperience ?? 0,
				hourlyRate: user.CleanerProfile?.hourlyRate ?? 0,
			},
		},
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);

		try {
			await updateCleanerProfileMutation.mutateAsync(values.cleanerProfile);

			// Note: Basic user info (name, email) would need a separate mutation
			// which isn't in the provided tRPC router
		} catch (error) {
			console.log("[CLIENT] Error updating profile:", error);
			// Error handling is done in the mutation callbacks
		} finally {
			setIsLoading(false);
		}
	}

	const initials = user.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
		: "U";

	return (
		<Form {...form}>
			{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>Update your personal information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-6">
							<Avatar className="h-20 w-20">
								<AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
								<AvatarFallback className="text-lg">{initials}</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="text-lg font-medium">{user.name}</h3>
								<p className="text-muted-foreground text-sm">{user.role}</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Your name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="your.email@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Profile Image URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/image.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Enter a URL for your profile image
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="text-muted-foreground text-sm">
							Note: Basic user information updates are not currently supported
							through this form.
						</div>
					</CardContent>

					<CardContent className="border-t pt-6">
						<h3 className="mb-4 text-lg font-medium">Cleaner Details</h3>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="cleanerProfile.bio"
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
									name="cleanerProfile.yearsExperience"
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
									name="cleanerProfile.hourlyRate"
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
