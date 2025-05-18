import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { auth } from "@/server/auth";

export default async function Dashboard() {
	const session = await auth();

	// TODO: Move to middleware
	if (!session) {
		redirect("/");
	}

	return (
		<main>
			<div className="relative flex items-center justify-center overflow-hidden py-12 md:py-24">
				<div className="relative z-[1] max-w-screen-md text-center">
					<h1 className="mt-6 font-serif text-4xl !leading-[1.2] font-bold tracking-tight italic sm:text-5xl md:text-6xl">
						Magiclean
					</h1>
					<p className="mt-6 text-[17px] md:text-lg">
						World class cleaning services for your home and office. If your
						world is only in SIM UOW campus.
					</p>
					<div className="mt-12 flex flex-col items-center justify-center gap-y-2 sm:flex-row sm:items-center sm:gap-x-3">
						<span className="text-sm text-neutral-400">Logged in as:</span>
						<span className="font-medium text-white">
							{session.user.name ?? "Valued User"}
						</span>
						<Badge
							variant="secondary"
							className="rounded-full px-3 py-1 text-xs"
						>
							{session.user.role}
						</Badge>
					</div>
				</div>
			</div>
		</main>
	);
}
