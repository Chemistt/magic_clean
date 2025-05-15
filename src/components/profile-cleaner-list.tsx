"use client";

import Image from "next/image";

import { api } from "@/trpc/react";

export function ProfileCleanerList() {
	const [cleaners] = api.profile.getAllCleaners.useSuspenseQuery();

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-6 text-2xl font-bold">Available Cleaners</h1>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{cleaners.map((cleaner) => (
					<div
						key={cleaner.id}
						className="flex flex-col items-center rounded-lg border p-4 shadow-sm"
					>
						<div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full">
							<Image
								src={cleaner.image ?? "/default-avatar.png"}
								alt={cleaner.name ?? "Cleaner"}
								fill
								className="object-cover"
							/>
						</div>
						<h2 className="text-lg font-semibold">{cleaner.name}</h2>
						{cleaner.CleanerProfile && (
							<div className="mt-2 text-sm text-gray-600">
								<p>
									Experience: {cleaner.CleanerProfile.yearsExperience} years
								</p>
								<p>Rate: ${cleaner.CleanerProfile.askingPrice.toString()}/hr</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
