"use client";

import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import type { z } from "zod";

import type { BookingSchema } from "@/components/booking-datatable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/react";

type BookingType = z.infer<typeof BookingSchema>;

type BookingDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: BookingType;
	role: Role;
};

export function BookingDrawer({
	open,
	onOpenChange,
	data,
	role,
}: BookingDrawerProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [error, setError] = useState<string | undefined>();

	const updateBookingStatus = useMutation(
		trpc.booking.updateBookingStatus.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.booking.getBookings.queryFilter()
				);
				onOpenChange(false);
			},
			onError: (error_) => {
				setError(error_ instanceof Error ? error_.message : "Unknown error");
			},
		})
	);

	const handleStatus = (status: BookingStatus) => {
		setError(undefined);
		updateBookingStatus.mutate({
			bookingId: data.id,
			status,
		});
	};
	const handlePayment = (paymentStatus: PaymentStatus) => {
		setError(undefined);
		updateBookingStatus.mutate({
			bookingId: data.id,
			paymentStatus,
		});
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="min-w-full py-5 transition-all md:min-w-2/5">
				<DrawerHeader className="px-10">
					<DrawerTitle>Booking Details</DrawerTitle>
				</DrawerHeader>
				<div className="px-10 pb-8">
					<Table>
						<TableBody>
							<TableRow>
								<TableHead>Booking Date</TableHead>
								<TableCell>
									{format(new Date(data.bookingTime), "PPP p")}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Status</TableHead>
								<TableCell>
									<Badge>{data.status}</Badge>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Payment Status</TableHead>
								<TableCell>
									<Badge>{data.paymentStatus}</Badge>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Price at Booking</TableHead>
								<TableCell>{data.priceAtBooking}</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Duration (minutes)</TableHead>
								<TableCell>{data.durationMinutes}</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Notes</TableHead>
								<TableCell>
									{data.notes ?? (
										<span className="text-muted-foreground">N/A</span>
									)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Created At</TableHead>
								<TableCell>
									{format(new Date(data.createdAt), "PPP p")}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Updated At</TableHead>
								<TableCell>
									{format(new Date(data.updatedAt), "PPP p")}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>
									{role === Role.HOME_OWNER ? "Cleaner" : "Home Owner"}
								</TableHead>
								<TableCell>
									{data.opposingUser.name} (ID: {data.opposingUser.id})
								</TableCell>
							</TableRow>
							<TableRow>
								<TableHead>Service</TableHead>
								<TableCell>
									<div>
										<strong>{data.service.name}</strong>
									</div>
									<div className="text-muted-foreground text-xs">
										{data.service.description ?? "No description"}
									</div>
									<div className="text-muted-foreground text-xs">
										Category: {data.service.category.name}
									</div>
								</TableCell>
							</TableRow>
							{role === Role.HOME_OWNER &&
								data.status === BookingStatus.COMPLETED && (
									<TableRow>
										<TableHead>Rebook Cleaner</TableHead>
										<TableCell>
											<Button size="sm" asChild>
												<Link
													href={`/dashboard/bookings/new?cleanerId=${data.opposingUser.id}`}
												>
													Rebook
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								)}
						</TableBody>
					</Table>

					{/* Action Buttons */}
					<div className="mt-6 flex flex-wrap gap-2">
						{/* Cleaner Actions */}
						{role === Role.CLEANER && data.status === BookingStatus.PENDING && (
							<>
								<Button
									onClick={() => {
										handleStatus(BookingStatus.CONFIRMED);
									}}
									disabled={updateBookingStatus.isPending}
								>
									Confirm
								</Button>
								<Button
									variant="destructive"
									onClick={() => {
										handleStatus(BookingStatus.REJECTED);
									}}
									disabled={updateBookingStatus.isPending}
								>
									Reject
								</Button>
							</>
						)}
						{role === Role.CLEANER &&
							data.status === BookingStatus.CONFIRMED && (
								<>
									<Button
										onClick={() => {
											handleStatus(BookingStatus.COMPLETED);
										}}
										disabled={updateBookingStatus.isPending}
									>
										Complete
									</Button>
									<Button
										variant="destructive"
										onClick={() => {
											handleStatus(BookingStatus.CANCELLED_BY_CLEANER);
										}}
										disabled={updateBookingStatus.isPending}
									>
										Cancel as Cleaner
									</Button>
								</>
							)}
						{/* Home Owner Actions */}
						{role === Role.HOME_OWNER &&
							data.status === BookingStatus.CONFIRMED && (
								<Button
									variant="destructive"
									onClick={() => {
										handleStatus(BookingStatus.CANCELLED_BY_OWNER);
									}}
									disabled={updateBookingStatus.isPending}
								>
									Cancel as Owner
								</Button>
							)}
						{role === Role.HOME_OWNER &&
							data.paymentStatus === PaymentStatus.PENDING && (
								<>
									<Button
										onClick={() => {
											handlePayment(PaymentStatus.PAID);
										}}
										disabled={updateBookingStatus.isPending}
									>
										Mark as Paid
									</Button>
									<Button
										onClick={() => {
											handlePayment(PaymentStatus.FAILED);
										}}
										disabled={updateBookingStatus.isPending}
									>
										Mark as Failed
									</Button>
									<Button
										onClick={() => {
											handlePayment(PaymentStatus.REFUNDED);
										}}
										disabled={updateBookingStatus.isPending}
									>
										Mark as Refunded
									</Button>
								</>
							)}
					</div>
					{updateBookingStatus.isPending && (
						<div className="text-muted-foreground mt-2">Updating...</div>
					)}
					{error && <div className="text-destructive mt-2">{error}</div>}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
