"use client";

import { Role } from "@prisma/client";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { z } from "zod";

import { DataTableToolbar } from "@/components/booking-datatable-toolbar";
import { BookingDrawer } from "@/components/booking-details-drawer";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

export const BookingSchema = z.object({
	id: z.number(),
	bookingTime: z.date(),
	status: z.string(),
	paymentStatus: z.string(),
	priceAtBooking: z.number(),
	durationMinutes: z.number().nullable(),
	notes: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	opposingUser: z.object({
		id: z.string(),
		name: z.string(),
	}),
	service: z.object({
		name: z.string(),
		description: z.string().nullable(),
		category: z.object({
			name: z.string(),
		}),
	}),
});

type BookingType = z.infer<typeof BookingSchema>;

export function BookingList({ role }: { role: Role }) {
	const [bookings] = api.booking.getBookings.useSuspenseQuery();

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<BookingType>();

	const columnHelper = createColumnHelper<BookingType>();
	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (props) => props.getValue(),
		}),
		columnHelper.accessor("bookingTime", {
			header: "Date",
			cell: (props) => format(new Date(props.getValue()), "PPP p"),
		}),
		columnHelper.accessor((row) => row.opposingUser.name, {
			id: "opposingUser.name",
			header: role === Role.HOME_OWNER ? "Cleaner" : "Home Owner",
			cell: (props) =>
				props.getValue() || <span className="text-muted-foreground">N/A</span>,
		}),
		columnHelper.accessor((row) => row.service.category.name, {
			id: "service.category.name",
			header: "Service",
			cell: (props) =>
				props.getValue() || <span className="text-muted-foreground">N/A</span>,
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (props) => <Badge>{props.getValue()}</Badge>,
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor("paymentStatus", {
			header: "Payment Status",
			cell: (props) => <Badge>{props.getValue()}</Badge>,
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
	];

	const table = useReactTable({
		data: bookings,
		columns,
		state: {
			columnFilters,
		},
		enableRowSelection: true,

		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="w-full py-2">
			<div className="mb-2">
				<DataTableToolbar table={table} role={role} />
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-accent text-card-foreground">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="hover:bg-muted cursor-default"
									onClick={() => {
										setDrawerOpen(true);
										setSelectedRow(row.original);
									}}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-min text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{!!selectedRow && (
				<BookingDrawer
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					data={selectedRow}
					role={role}
				/>
			)}
		</div>
	);
}
