"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";

export function ProfileCleanerList() {
	const [cleaners] = api.profile.getAllCleaners.useSuspenseQuery();
	const [categories] = api.service.getCategories.useSuspenseQuery();

	const [selectedCategory, setSelectedCategory] = useState<string>("");

	// Filter cleaners by selected category
	const filteredCleaners = useMemo(() => {
		if (selectedCategory) {
			return cleaners.filter((cleaner) =>
				cleaner.CleanerProfile?.servicesOffered.some(
					(service) => service.category.name === selectedCategory
				)
			);
		}
		return cleaners;
	}, [cleaners, selectedCategory]);

	return (
		<section className="bg-background mx-auto min-h-screen max-w-7xl">
			<div className="container mx-auto">
				<h1 className="text-foreground text-3xl font-extrabold">
					Available Cleaners
				</h1>
				<p className="text-muted-foreground mb-4 max-w-2xl text-lg">
					Browse our trusted, experienced cleaners. Click a card to view more
					details and book your preferred cleaner.
				</p>

				{/* Category Filter Bar */}
				<div className="mb-6 flex flex-wrap items-center gap-2">
					<Button
						onClick={() => {
							setSelectedCategory("");
						}}
						variant={selectedCategory === "" ? "default" : "outline"}
						className={
							`rounded-full px-3 py-1 text-sm font-medium transition-colors` +
							(selectedCategory === ""
								? " border-primary"
								: " border-border text-foreground bg-card hover:bg-muted")
						}
					>
						All
					</Button>
					{categories.map((category) => (
						<Button
							key={category.id}
							onClick={() => {
								setSelectedCategory(category.name);
							}}
							variant={
								selectedCategory === category.name ? "default" : "outline"
							}
							className={
								`rounded-full px-3 py-1 text-sm font-medium transition-colors` +
								(selectedCategory === category.name
									? " border-primary"
									: " border-border text-foreground bg-card hover:bg-muted")
							}
						>
							{category.name}
						</Button>
					))}
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{filteredCleaners.map((cleaner) => (
						<Link
							key={cleaner.id}
							href={`/dashboard/cleaners/${cleaner.id}`}
							className="block h-full"
						>
							<Card className="group border-border bg-card focus:ring-primary flex cursor-pointer flex-col items-center rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:ring-2 focus:outline-none">
								<div className="border-secondary group-hover:border-secondary-foreground relative mb-2 size-24 overflow-hidden rounded-full border-4 transition-all">
									<Image
										src={cleaner.image ?? "/default-avatar.png"}
										alt={cleaner.name ?? "Cleaner"}
										fill
										className="object-cover"
										priority
									/>
								</div>
								<h2 className="text-card-foreground w-full truncate text-center text-lg font-semibold">
									{cleaner.name}
								</h2>
								{cleaner.CleanerProfile && (
									<div className="text-muted-foreground flex w-full flex-col items-center text-sm">
										<p className="mb-1">
											Experience:{" "}
											<span className="text-foreground font-medium">
												{cleaner.CleanerProfile.yearsExperience} years
											</span>
										</p>
										<p className="mb-2">
											Rate:{" "}
											<span className="text-primary font-semibold">
												${cleaner.CleanerProfile.askingPrice.toString()}/hr
											</span>
										</p>
										<div className="flex flex-wrap justify-center gap-2">
											{cleaner.CleanerProfile.servicesOffered
												.map((service) => service.category.name)
												.filter(
													(name, index, self) => self.indexOf(name) === index
												)
												.map((name) => (
													<Badge
														key={name}
														variant="outline"
														className="border-primary text-primary bg-primary-foreground/10 px-2 py-1 text-xs"
													>
														{name}
													</Badge>
												))}
										</div>
									</div>
								)}
							</Card>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
