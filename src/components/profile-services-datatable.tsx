"use client";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const ServiceSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	isActive: z.boolean(),
	category: z.object({
		id: z.number(),
		name: z.string(),
	}),
});

type ServiceType = z.infer<typeof ServiceSchema>;

type ProfileServiceDataTableProps = {
	services: ServiceType[];
};

export function ProfileServiceDataTable({
	services,
}: ProfileServiceDataTableProps) {
	const columnHelper = createColumnHelper<ServiceType>();

	const columns = [
		columnHelper.accessor("name", {
			header: "Name",
			cell: (props) => props.getValue(),
		}),
		columnHelper.accessor("isActive", {
			header: "Active",
		}),
		columnHelper.accessor("category.name", {
			header: "Category",
		}),
		columnHelper.display({
			id: "actions",
			cell: () => {
				return <Button>Edit</Button>;
			},
		}),
	];

	const table = useReactTable({
		data: services,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="w-full py-2">
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
		</div>
	);
}
