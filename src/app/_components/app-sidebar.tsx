import { NavUser } from "@components/nav-user";
import { ModeToggle } from "@components/theme-dropdown";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@components/ui/sidebar";
import { Command, Home, Settings, UserPen } from "lucide-react";
import Link from "next/link";

import { auth } from "@/server/auth";
const items = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "Profile",
		url: "/dashboard/profile",
		icon: UserPen,
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings,
	},
];

export async function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const session = await auth();
	const userProperty = session
		? {
				name: session.user.name ?? "User",
				email: session.user.email ?? "",
				avatar: session.user.image ?? "",
			}
		: undefined;
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">Magiclean</span>
									<span className="truncate text-xs">
										World class cleaning service
									</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigations</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon />
											{item.title}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<ModeToggle />
				<NavUser user={userProperty} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
