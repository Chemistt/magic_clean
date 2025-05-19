"use client";

import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	BanknoteArrowDownIcon,
	BanknoteArrowUpIcon,
	BanknoteXIcon,
	CheckIcon,
	LoaderIcon,
	TimerIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { DataTablePagination } from "@/components/booking-datatable-pagination";
import { DataTableToolbar } from "@/components/booking-datatable-toolbar";
import { BookingDrawer } from "@/components/booking-details-drawer";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
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
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "bookingTime",
			desc: true,
		},
	]);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<BookingType>();

	const columnHelper = createColumnHelper<BookingType>();
	const columns = [
		columnHelper.accessor("id", {
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="ID" />
			),
			enableSorting: true,
			cell: (props) => props.getValue(),
		}),
		columnHelper.accessor("bookingTime", {
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date" />
			),
			enableSorting: true,
			cell: (props) => format(new Date(props.getValue()), "PPP p"),
		}),
		columnHelper.accessor((row) => row.opposingUser.name, {
			id: "opposingUser.name",
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title={role === Role.HOME_OWNER ? "Cleaner" : "Home Owner"}
				/>
			),
			enableSorting: true,
			cell: (props) =>
				props.getValue() || <span className="text-muted-foreground">N/A</span>,
		}),
		columnHelper.accessor((row) => row.service.category.name, {
			id: "service.category.name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Service" />
			),
			enableSorting: true,
			cell: (props) =>
				props.getValue() || <span className="text-muted-foreground">N/A</span>,
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor("status", {
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			enableSorting: true,
			cell: (props) => getStatusDisplay(props.getValue() as BookingStatus),
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
		columnHelper.accessor("paymentStatus", {
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Payment Status" />
			),
			enableSorting: true,
			cell: (props) =>
				getPaymentStatusDisplay(props.getValue() as PaymentStatus),
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.getValue(id));
			},
		}),
	];

	const table = useReactTable({
		data: bookings,
		columns,
		state: {
			sorting,
			columnFilters,
		},
		enableRowSelection: true,

		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,

		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
									No bookings found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
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

const getStatusDisplay = (status: BookingStatus) => {
	switch (status) {
		case BookingStatus.PENDING: {
			return (
				<div className="flex items-center">
					<TimerIcon className="text-muted-foreground mr-2 h-4 w-4" />
					<span>PENDING</span>
				</div>
			);
		}
		case BookingStatus.CONFIRMED: {
			return (
				<div className="flex items-center">
					<CheckIcon className="mr-2 h-4 w-4 text-green-500" />
					<span>CONFIRMED</span>
				</div>
			);
		}
		case BookingStatus.REJECTED: {
			return (
				<div className="flex items-center">
					<XIcon className="text-destructive mr-2 h-4 w-4" />
					<span>REJECTED</span>
				</div>
			);
		}
		case BookingStatus.COMPLETED: {
			return (
				<div className="flex items-center">
					<CheckIcon className="mr-2 h-4 w-4 text-green-500" />
					<span>COMPLETED</span>
				</div>
			);
		}
		case BookingStatus.CANCELLED_BY_OWNER: {
			return (
				<div className="flex items-center">
					<XIcon className="text-destructive mr-2 h-4 w-4" />
					<span>CANCELLED BY OWNER</span>
				</div>
			);
		}
		case BookingStatus.CANCELLED_BY_CLEANER: {
			return (
				<div className="flex items-center">
					<XIcon className="text-destructive mr-2 h-4 w-4" />
					<span>CANCELLED BY CLEANER</span>
				</div>
			);
		}
		case BookingStatus.IN_PROGRESS: {
			return (
				<div className="flex items-center">
					<LoaderIcon className="text-muted-foreground mr-2 h-4 w-4" />
					<span>IN PROGRESS</span>
				</div>
			);
		}
	}
};

const getPaymentStatusDisplay = (paymentStatus: PaymentStatus) => {
	switch (paymentStatus) {
		case PaymentStatus.PENDING: {
			return (
				<div className="flex items-center">
					<TimerIcon className="text-muted-foreground mr-2 h-4 w-4" />
					<span>PENDING</span>
				</div>
			);
		}
		case PaymentStatus.PAID: {
			return (
				<div className="flex items-center">
					<BanknoteArrowUpIcon className="mr-2 h-4 w-4 text-green-500" />
					<span>PAID</span>
				</div>
			);
		}
		case PaymentStatus.FAILED: {
			return (
				<div className="flex items-center">
					<BanknoteXIcon className="text-destructive mr-2 h-4 w-4" />
					<span>FAILED</span>
				</div>
			);
		}
		case PaymentStatus.REFUNDED: {
			return (
				<div className="flex items-center">
					<BanknoteArrowDownIcon className="mr-2 h-4 w-4 text-yellow-500" />
					<span>REFUNDED</span>
				</div>
			);
		}
	}
};
