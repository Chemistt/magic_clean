"use client";

import { Calendar, Home, UserPen, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type Session } from "next-auth";

import { NavUser } from "@/components/nav-user";
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
} from "@/components/ui/sidebar";

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
		title: "Cleaners",
		url: "/dashboard/cleaners",
		icon: Users,
	},
	{
		title: "Bookings",
		url: "/dashboard/bookings",
		icon: Calendar,
	},
];

type AppSidebarProps = {
	session: Session | null;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ session, ...props }: AppSidebarProps) {
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
									<Image
										src="/favicon.ico"
										alt="Magiclean"
										width={20}
										height={20}
									/>
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
				<NavUser user={userProperty} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
