"use client";

import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/react";

type DataTableToolbarProps<TData> = {
	table: Table<TData>;
	role: Role;
};

export function DataTableToolbar<TData>({
	table,
	role,
}: DataTableToolbarProps<TData>) {
	const trpc = useTRPC();
	const { data: categories } = useSuspenseQuery(
		trpc.service.getCategories.queryOptions()
	);

	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder={
						role === Role.HOME_OWNER
							? "Filter cleaners..."
							: "Filter home owners..."
					}
					value={
						table.getColumn("opposingUser.name")?.getFilterValue() as string
					}
					onChange={(event) =>
						table
							.getColumn("opposingUser.name")
							?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{table.getColumn("status") && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={Object.values(BookingStatus).map((status) => ({
							label: status,
							value: status,
						}))}
					/>
				)}
				{table.getColumn("paymentStatus") && (
					<DataTableFacetedFilter
						column={table.getColumn("paymentStatus")}
						title="Payment"
						options={Object.values(PaymentStatus).map((status) => ({
							label: status,
							value: status,
						}))}
					/>
				)}
				{table.getColumn("service.category.name") && (
					<DataTableFacetedFilter
						column={table.getColumn("service.category.name")}
						title="Service"
						options={categories.map((category) => ({
							label: category.name,
							value: category.name,
						}))}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
						}}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<X />
					</Button>
				)}
			</div>
		</div>
	);
}
