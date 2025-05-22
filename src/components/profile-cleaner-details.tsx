"use client";
import { Role } from "@prisma/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	CalendarIcon,
	ClockIcon,
	DollarSignIcon,
	HeartIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getAvatarInitials } from "@/lib/utils";
import { useTRPC } from "@/trpc/react";

type CleanerProfileProps = {
	cleanerId: string;
	user: {
		id: string;
		role: Role;
	};
};

export function ViewCleanerProfile({ cleanerId, user }: CleanerProfileProps) {
	const trpc = useTRPC();
	const { data: cleaner } = useSuspenseQuery(
		trpc.profile.getSpecificCleanerProfile.queryOptions({
			id: cleanerId,
		})
	);

	const { data: shortlist } = useSuspenseQuery(
		trpc.favourites.getShortlist.queryOptions()
	);

	const queryClient = useQueryClient();
	const addToShortlist = useMutation(
		trpc.favourites.addToShortlist.mutationOptions({
			onSuccess: () => {
				toast.success("Added to favourites");
				void queryClient.invalidateQueries(
					trpc.favourites.getShortlist.queryFilter()
				);
			},
			onError: (error) =>
				toast.error(error.message || "Failed to add to favourites"),
		})
	);
	const removeFromShortlist = useMutation(
		trpc.favourites.removeFromShortlist.mutationOptions({
			onSuccess: () => {
				toast.success("Removed from favourites");
				void queryClient.invalidateQueries(
					trpc.favourites.getShortlist.queryFilter()
				);
			},
			onError: (error) =>
				toast.error(error.message || "Failed to remove from favourites"),
		})
	);

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

	const selfOrCleaner = cleaner.id === user.id || user.role === Role.CLEANER;
	const isHomeOwner = user.role === Role.HOME_OWNER;
	const isFavourited = isHomeOwner && shortlist.includes(cleanerId);
	const isMutating = addToShortlist.isPending || removeFromShortlist.isPending;

	const handleToggleFavourite = () => {
		if (!isHomeOwner) return;
		if (isFavourited) {
			removeFromShortlist.mutate({ cleanerId });
		} else {
			addToShortlist.mutate({ cleanerId });
		}
	};

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

					{/* Services Section */}
					{cleaner.CleanerProfile?.servicesOffered &&
						cleaner.CleanerProfile.servicesOffered.length > 0 && (
							<div className="mt-8">
								<h1 className="mb-4 font-bold">Services Offered</h1>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{cleaner.CleanerProfile.servicesOffered.map((service) => (
										<div
											key={service.id}
											className="bg-card text-card-foreground flex flex-col rounded-lg border p-5 shadow-md transition-shadow"
										>
											<div className="mb-2 flex items-center gap-3">
												<Badge
													variant="secondary"
													className="text-sm font-semibold"
												>
													{service.category.name}
												</Badge>
												<span className="text-lg font-semibold">
													{service.name}
												</span>
											</div>
											{service.description && (
												<p className="text-muted-foreground text-sm leading-relaxed">
													{service.description}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						)}
				</CardContent>
				<CardFooter className="flex flex-col justify-end gap-3 p-6 sm:flex-row">
					{!selfOrCleaner && isHomeOwner && (
						<Button
							variant={isFavourited ? "default" : "outline"}
							size="lg"
							onClick={handleToggleFavourite}
							disabled={isMutating}
							aria-pressed={isFavourited}
						>
							<HeartIcon
								className={`mr-2 h-4 w-4 ${isFavourited ? "fill-red-500 text-red-500" : ""}`}
							/>
							{isFavourited ? "Favourited" : "Favourite"}
						</Button>
					)}
					{isHomeOwner && (
						<Button size="lg" asChild>
							<Link href={`/dashboard/bookings/new?cleanerId=${cleanerId}`}>
								<CalendarIcon className="mr-2 h-4 w-4" />
								Book Cleaner
							</Link>
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
