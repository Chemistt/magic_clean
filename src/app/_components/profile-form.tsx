// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
// import { Button } from "@components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@components/ui/card";
// import {
// 	Form,
// 	FormControl,
// 	FormDescription,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from "@components/ui/form";
// import { Input } from "@components/ui/input";
// import { Textarea } from "@components/ui/textarea";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
// 	type CleanerProfile,
// 	type HomeOwnerProfile,
// 	Role,
// 	type User,
// } from "@prisma/client";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";

// import { api } from "@/trpc/react";

// // Base user form schema
// const userFormSchema = z.object({
// 	name: z.string().min(2, { message: "Name must be at least 2 characters." }),
// 	email: z.string().email({ message: "Please enter a valid email address." }),
// 	image: z.string().optional(),
// });

// // Home owner specific schema - using the same schema from the tRPC router
// const homeOwnerSchema = z.object({
// 	address: z.string().optional(),
// 	preferences: z.string().optional(),
// });

// // Cleaner specific schema - using the same schema from the tRPC router
// const cleanerSchema = z.object({
// 	bio: z.string().optional(),
// 	yearsExperience: z.number().int().min(0).optional(),
// 	hourlyRate: z.number().positive().optional(),
// });

// // Combined schemas based on role
// const homeOwnerFormSchema = userFormSchema.extend({
// 	homeOwnerProfile: homeOwnerSchema,
// });

// const cleanerFormSchema = userFormSchema.extend({
// 	cleanerProfile: cleanerSchema,
// });

// type UserWithProfile = User & {
// 	HomeOwnerProfile: HomeOwnerProfile | null;
// 	CleanerProfile: CleanerProfile | null;
// };

// export function ProfileForm({ user }: { user: UserWithProfile }) {
// 	const router = useRouter();
// 	const [isLoading, setIsLoading] = useState(false);

// 	// tRPC mutations
// 	const updateCleanerProfileMutation =
// 		api.profile.updateCleanerProfile.useMutation({
// 			onSuccess: () => {
// 				toast("Profile updated", {
// 					description: "Your cleaner profile has been updated successfully.",
// 				});
// 				router.refresh();
// 			},
// 			onError: (error) => {
// 				toast("Error", {
// 					description:
// 						error.message || "Something went wrong. Please try again.",
// 				});
// 			},
// 		});

// 	const updateHomeOwnerProfileMutation =
// 		api.profile.updateHomeOwnerProfile.useMutation({
// 			onSuccess: () => {
// 				toast("Profile updated", {
// 					description: "Your home owner profile has been updated successfully.",
// 				});
// 				router.refresh();
// 			},
// 			onError: (error) => {
// 				toast("Error", {
// 					description:
// 						error.message || "Something went wrong. Please try again.",
// 				});
// 			},
// 		});

// 	// Determine which schema to use based on user role
// 	const formSchema =
// 		user.role === Role.CLEANER ? cleanerFormSchema : homeOwnerFormSchema;

// 	// Set up the form with the appropriate schema
// 	const form = useForm<z.infer<typeof formSchema>>({
// 		resolver: zodResolver(formSchema),
// 		defaultValues: {
// 			name: user.name ?? "",
// 			email: user.email ?? "",
// 			image: user.image ?? "",
// 			...(user.role === Role.HOME_OWNER && {
// 				homeOwnerProfile: {
// 					address: user.HomeOwnerProfile?.address ?? "",
// 					preferences: user.HomeOwnerProfile?.preferences ?? "",
// 				},
// 			}),
// 			...(user.role === Role.CLEANER && {
// 				cleanerProfile: {
// 					bio: user.CleanerProfile?.bio ?? "",
// 					yearsExperience: user.CleanerProfile?.yearsExperience ?? 0,
// 					hourlyRate: user.CleanerProfile?.hourlyRate
// 						? Number(user.CleanerProfile.hourlyRate)
// 						: 0,
// 				},
// 			}),
// 		},
// 	});
// 	async function onSubmit(values: z.infer<typeof formSchema>) {
// 		setIsLoading(true);

// 		try {
// 			// Update user profile based on role
// 			if (user.role === Role.CLEANER && "cleanerProfile" in values) {
// 				await updateCleanerProfileMutation.mutateAsync(values.cleanerProfile);
// 			} else if (
// 				user.role === Role.HOME_OWNER &&
// 				"homeOwnerProfile" in values
// 			) {
// 				await updateHomeOwnerProfileMutation.mutateAsync(
// 					values.homeOwnerProfile
// 				);
// 			}

// 			// Note: Basic user info (name, email) would need a separate mutation
// 			// which isn't in the provided tRPC router
// 		} catch (error) {
// 			// Error handling is done in the mutation callbacks
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	}

// 	const initials = user.name
// 		? user.name
// 				.split(" ")
// 				.map((n) => n[0])
// 				.join("")
// 		: "U";

// 	return (
// 		<Form {...form}>
// 			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
// 				<Card>
// 					<CardHeader>
// 						<CardTitle>Basic Information</CardTitle>
// 						<CardDescription>Update your personal information</CardDescription>
// 					</CardHeader>
// 					<CardContent className="space-y-6">
// 						<div className="flex items-center gap-6">
// 							<Avatar className="h-20 w-20">
// 								<AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
// 								<AvatarFallback className="text-lg">{initials}</AvatarFallback>
// 							</Avatar>
// 							<div>
// 								<h3 className="text-lg font-medium">{user.name}</h3>
// 								<p className="text-muted-foreground text-sm">{user.role}</p>
// 							</div>
// 						</div>

// 						<div className="grid gap-4 md:grid-cols-2">
// 							<FormField
// 								control={form.control}
// 								name="name"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel>Name</FormLabel>
// 										<FormControl>
// 											<Input placeholder="Your name" {...field} />
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>

// 							<FormField
// 								control={form.control}
// 								name="email"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel>Email</FormLabel>
// 										<FormControl>
// 											<Input placeholder="your.email@example.com" {...field} />
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>

// 							<FormField
// 								control={form.control}
// 								name="image"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel>Profile Image URL</FormLabel>
// 										<FormControl>
// 											<Input
// 												placeholder="https://example.com/image.jpg"
// 												{...field}
// 											/>
// 										</FormControl>
// 										<FormDescription>
// 											Enter a URL for your profile image
// 										</FormDescription>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>
// 						</div>
// 						<div className="text-muted-foreground text-sm">
// 							Note: Basic user information updates are not currently supported
// 							through this form.
// 						</div>
// 					</CardContent>

// 					{user.role === Role.HOME_OWNER && (
// 						<CardContent className="border-t pt-6">
// 							<h3 className="mb-4 text-lg font-medium">Home Owner Details</h3>
// 							<div className="grid gap-4">
// 								<FormField
// 									control={form.control}
// 									name="homeOwnerProfile.address"
// 									render={({ field }) => (
// 										<FormItem>
// 											<FormLabel>Address</FormLabel>
// 											<FormControl>
// 												<Input
// 													placeholder="Your address"
// 													{...field}
// 													value={field.value ?? ""}
// 												/>
// 											</FormControl>
// 											<FormMessage />
// 										</FormItem>
// 									)}
// 								/>

// 								<FormField
// 									control={form.control}
// 									name="homeOwnerProfile.preferences"
// 									render={({ field }) => (
// 										<FormItem>
// 											<FormLabel>Cleaning Preferences</FormLabel>
// 											<FormControl>
// 												<Textarea
// 													placeholder="E.g., pet friendly, specific cleaning products, etc."
// 													className="min-h-[100px]"
// 													{...field}
// 													value={field.value ?? ""}
// 												/>
// 											</FormControl>
// 											<FormDescription>
// 												Describe any specific preferences for cleaning services
// 											</FormDescription>
// 											<FormMessage />
// 										</FormItem>
// 									)}
// 								/>
// 							</div>
// 						</CardContent>
// 					)}

// 					{user.role === Role.CLEANER && (
// 						<CardContent className="border-t pt-6">
// 							<h3 className="mb-4 text-lg font-medium">Cleaner Details</h3>
// 							<div className="grid gap-4">
// 								<FormField
// 									control={form.control}
// 									name="cleanerProfile.bio"
// 									render={({ field }) => (
// 										<FormItem>
// 											<FormLabel>Bio</FormLabel>
// 											<FormControl>
// 												<Textarea
// 													placeholder="Tell clients about yourself and your cleaning experience"
// 													className="min-h-[100px]"
// 													{...field}
// 													value={field.value ?? ""}
// 												/>
// 											</FormControl>
// 											<FormMessage />
// 										</FormItem>
// 									)}
// 								/>

// 								<div className="grid gap-4 md:grid-cols-2">
// 									<FormField
// 										control={form.control}
// 										name="cleanerProfile.yearsExperience"
// 										render={({ field }) => (
// 											<FormItem>
// 												<FormLabel>Years of Experience</FormLabel>
// 												<FormControl>
// 													<Input
// 														type="number"
// 														min="0"
// 														{...field}
// 														value={field.value ?? 0}
// 														onChange={(e) =>
// 															field.onChange(
// 																Number.parseInt(e.target.value) ?? 0
// 															)
// 														}
// 													/>
// 												</FormControl>
// 												<FormMessage />
// 											</FormItem>
// 										)}
// 									/>

// 									<FormField
// 										control={form.control}
// 										name="cleanerProfile.hourlyRate"
// 										render={({ field }) => (
// 											<FormItem>
// 												<FormLabel>Hourly Rate ($)</FormLabel>
// 												<FormControl>
// 													<Input
// 														type="number"
// 														min="0"
// 														step="0.01"
// 														{...field}
// 														value={field.value ?? 0}
// 														onChange={(error) =>
// 															field.onChange(
// 																Number.parseFloat(error.target.value) ?? 0
// 															)
// 														}
// 													/>
// 												</FormControl>
// 												<FormMessage />
// 											</FormItem>
// 										)}
// 									/>
// 								</div>
// 							</div>
// 						</CardContent>
// 					)}

// 					<CardFooter className="border-t pt-6">
// 						<Button type="submit" disabled={isLoading}>
// 							{isLoading ? "Saving..." : "Save Changes"}
// 						</Button>
// 					</CardFooter>
// 				</Card>
// 			</form>
// 		</Form>
// 	);
// }
// eslint-disable-next-line unicorn/no-empty-file
