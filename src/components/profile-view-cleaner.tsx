"use client";
import {
	CalendarIcon,
	ClockIcon,
	DollarSignIcon,
	HeartIcon,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { getAvatarInitials } from "@/lib/utils";
import { api } from "@/trpc/react";

type CleanerProfileProps = {
	cleanerId: string;
};

export function ViewCleanerProfile({ cleanerId }: CleanerProfileProps) {
	const [cleaner] = api.profile.getSpecificCleanerProfile.useSuspenseQuery({
		id: cleanerId,
	});
	if (!cleaner) {
		return (
			<>
				<div>Cleaner not found</div>
				<Button asChild>
					<Link href="/dashboard/cleaners">Back</Link>
				</Button>
			</>
		);
	}
	const initials = getAvatarInitials(cleaner.name);
	return (
		<div className="space-y-8">
			<Card className="overflow-hidden">
				<CardHeader className="p-6">
					<div className="flex items-start gap-4">
						<Avatar className="h-20 w-20 border">
							<AvatarImage
								src={cleaner.image ?? ""}
								alt={cleaner.name ?? "User"}
							/>
							<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
						</Avatar>
						<div className="grid gap-0.5">
							<CardTitle className="text-2xl">{cleaner.name}</CardTitle>
							<CardDescription className="text-base">
								{cleaner.CleanerProfile?.bio}
							</CardDescription>
							<p className="text-muted-foreground text-sm">{cleaner.role}</p>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="bg-background flex items-center gap-3 rounded-lg border p-3 shadow-sm">
							<CalendarIcon className="text-primary size-5" />
							<div>
								<p className="text-sm font-medium">Experience</p>
								<p className="text-muted-foreground text-sm">
									{cleaner.CleanerProfile?.yearsExperience} years
								</p>
							</div>
						</div>
						<div className="bg-background flex items-center gap-3 rounded-lg border p-3 shadow-sm">
							<DollarSignIcon className="text-primary size-5" />
							<div>
								<p className="text-sm font-medium">Hourly Rate</p>
								<p className="text-muted-foreground text-sm">
									${Number(cleaner.CleanerProfile?.askingPrice)}
								</p>
							</div>
						</div>
						<div className="bg-background flex items-center gap-3 rounded-lg border p-3 shadow-sm">
							<ClockIcon className="text-primary size-5" />
							<div>
								<p className="text-sm font-medium">Availability</p>
								<p className="text-muted-foreground text-sm">
									{cleaner.CleanerProfile?.avalibility}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col justify-end gap-3 p-6 sm:flex-row">
					<Button variant="outline" size="lg">
						<HeartIcon className="mr-2 h-4 w-4" />
						Favourite
					</Button>
					<Button size="lg">
						<CalendarIcon className="mr-2 h-4 w-4" />
						Book Cleaner
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
