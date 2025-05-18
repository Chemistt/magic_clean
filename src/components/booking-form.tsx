"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	CalendarIcon,
	ClockIcon,
	SparklesIcon,
	StickyNoteIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getAvatarInitials } from "@/lib/utils";
import { api } from "@/trpc/react";

const schema = z.object({
	bookingTime: z.date({ message: "Booking time is required" }),
	priceAtBooking: z.number().positive({ message: "Price must be positive" }),
	durationMinutes: z.number().int().min(1, "Duration is required"),
	notes: z.string().optional(),

	serviceId: z.string({ message: "Service is required" }),
});

type BookingFormProps = {
	cleanerId: string;
};

export function BookingForm({ cleanerId }: BookingFormProps) {
	const [cleanerProfile] =
		api.profile.getSpecificCleanerProfile.useSuspenseQuery({
			id: cleanerId,
		});
	const services = cleanerProfile?.CleanerProfile?.servicesOffered ?? [];
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const createBookingMutation = api.booking.createBooking.useMutation({
		onSuccess: () => {
			toast("Booking created", {
				description: "Your booking has been submitted successfully.",
			});
			router.push(`/dashboard/bookings`);
		},
		onError: (error) => {
			toast("Error", {
				description: error.message || "Something went wrong. Please try again.",
			});
		},
	});

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			serviceId: undefined,
			bookingTime: undefined,
			durationMinutes: 60,
			notes: "",
			priceAtBooking: 0,
		},
	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setIsLoading(true);
		try {
			await createBookingMutation.mutateAsync({
				...values,
				serviceId: Number(values.serviceId),
				bookingTime: values.bookingTime.toISOString(),
				cleanerId,
			});
		} catch (error) {
			console.error("[CLIENT] Error creating booking:", error);
		} finally {
			setIsLoading(false);
		}
	}
	function handleTimeChange(type: "hour" | "minute", value: string) {
		const currentTime = form.getValues("bookingTime");
		const newDate = new Date(currentTime);
		if (type === "hour") {
			const hour = Number.parseInt(value, 10);
			newDate.setHours(hour);
		} else {
			newDate.setMinutes(Number.parseInt(value, 10));
		}

		form.setValue("bookingTime", newDate);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit(onSubmit)(event);
				}}
				className="space-y-8"
			>
				<Card className="border p-2 shadow-lg md:p-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-2xl font-bold">
							Book a Cleaning
						</CardTitle>
						<CardDescription>
							Select a service, date, and provide details for your booking.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-8">
						{cleanerProfile && (
							<section>
								<div className="flex items-center gap-4">
									<Avatar className="h-16 w-16 border">
										<AvatarImage
											src={cleanerProfile.image ?? ""}
											alt={cleanerProfile.name ?? "Cleaner"}
										/>
										<AvatarFallback className="text-xl">
											{getAvatarInitials(cleanerProfile.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="text-lg font-semibold">
											{cleanerProfile.name}
										</div>
										<div className="text-muted-foreground text-sm">
											{cleanerProfile.CleanerProfile?.bio}
										</div>
									</div>
								</div>
								<Separator className="mt-4" />
							</section>
						)}

						<section>
							<h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
								<SparklesIcon className="text-primary size-5" /> Service Details
							</h2>
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="serviceId"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													name={field.name}
													value={field.value}
													onValueChange={(value) => {
														field.onChange(value);
													}}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a Service" />
													</SelectTrigger>
													<SelectContent>
														{services.map((service) => (
															<SelectItem
																key={service.id}
																value={service.id.toString()}
															>
																{service.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
						<Separator className="mt-2 mb-4" />
						<section>
							<h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
								<CalendarIcon className="text-primary size-5" /> Date & Time
							</h2>
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="bookingTime"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-[240px] pl-3 text-left font-normal",
																// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
																!field.value && "text-muted-foreground"
															)}
														>
															{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
															{field.value ? (
																format(field.value, "MM/dd/yyyy HH:mm")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<div className="sm:flex">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															disabled={(date) => date <= new Date()}
															initialFocus
														/>
														<div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
															<ScrollArea className="w-64 sm:w-auto">
																<div className="flex p-2 sm:flex-col">
																	{Array.from(
																		{ length: 24 },
																		(_, index) => index
																	)
																		.reverse()
																		.map((hour) => (
																			<Button
																				key={hour}
																				size="icon"
																				variant={
																					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
																					field.value &&
																					field.value.getHours() === hour
																						? "default"
																						: "ghost"
																				}
																				className="aspect-square shrink-0 sm:w-full"
																				onClick={() => {
																					handleTimeChange(
																						"hour",
																						hour.toString()
																					);
																				}}
																			>
																				{hour}
																			</Button>
																		))}
																</div>
																<ScrollBar
																	orientation="horizontal"
																	className="sm:hidden"
																/>
															</ScrollArea>
															<ScrollArea className="w-64 sm:w-auto">
																<div className="flex p-2 sm:flex-col">
																	{Array.from(
																		{ length: 12 },
																		(_, index) => index * 5
																	).map((minute) => (
																		<Button
																			key={minute}
																			size="icon"
																			variant={
																				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
																				field.value &&
																				field.value.getMinutes() === minute
																					? "default"
																					: "ghost"
																			}
																			className="aspect-square shrink-0 sm:w-full"
																			onClick={() => {
																				handleTimeChange(
																					"minute",
																					minute.toString()
																				);
																			}}
																		>
																			{minute.toString().padStart(2, "0")}
																		</Button>
																	))}
																</div>
																<ScrollBar
																	orientation="horizontal"
																	className="sm:hidden"
																/>
															</ScrollArea>
														</div>
													</div>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
						<Separator className="my-2 mb-4" />
						<section>
							<h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
								<ClockIcon className="text-primary size-5" /> Duration & Price
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="durationMinutes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes)</FormLabel>
											<FormControl>
												<Input type="number" min="1" step="1" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="priceAtBooking"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price ($)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													step="0.01"
													{...field}
													value={field.value}
													onChange={(event) => {
														field.onChange(Number(event.target.value));
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
						<Separator className="my-2" />
						<section>
							<h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
								<StickyNoteIcon className="text-primary size-5" /> Notes
							</h2>
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Textarea
													placeholder="Add any special instructions or notes for the cleaner"
													className="min-h-[80px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>
					</CardContent>
					<CardFooter className="flex justify-end p-4 md:p-6">
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Booking..." : "Book Now"}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
