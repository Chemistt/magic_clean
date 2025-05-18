import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/server/auth";

type AuthenticatedProps = {
	children: ReactNode;
};
export default async function AuthenticatedLayout({
	children,
}: AuthenticatedProps) {
	const session = await auth();

	return (
		<SidebarProvider>
			<AppSidebar session={session} />
			<SidebarInset>
				<SiteHeader />
				<main className="flex size-full flex-col items-center gap-y-12 overflow-y-auto p-12">
					{children}
				</main>
				<Toaster expand richColors />
			</SidebarInset>
		</SidebarProvider>
	);
}
