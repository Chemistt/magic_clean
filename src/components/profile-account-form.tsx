"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
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
import { getAvatarInitials } from "@/lib/utils";
import { api } from "@/trpc/react";

const schema = z.object({
	name: z.string(),
	email: z.string(),
	image: z.string(),
});

export function ProfileAccountForm() {
	const [user] = api.profile.getCurrentUserProfile.useSuspenseQuery();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: user.name ?? "",
			email: user.email ?? "",
			image: user.image ?? "",
		},
	});

	const initials = getAvatarInitials(user.name);
	return (
		<Form {...form}>
			<form className="space-y-8">
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
											<Input placeholder="Your name" {...field} readOnly />
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
											<Input
												placeholder="your.email@example.com"
												{...field}
												readOnly
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div>
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
												readOnly
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="text-muted-foreground text-sm">
							Note: Basic user information are readonly and not editable.
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
}
