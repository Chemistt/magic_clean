"use client";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
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
import { api } from "@/trpc/react";

export const FavouriteSchema = z.object({
	id: z.number(),
	createdAt: z.string().datetime(),
	cleaner: z.object({
		id: z.string(),
		name: z.string(),
	}),
});

type FavouritesType = z.infer<typeof FavouriteSchema>;

export function ProfileFavouritesDataTable() {
	const [favourites] =
		api.favourites.getCurrentUserFavourites.useSuspenseQuery();

	const columnHelper = createColumnHelper<FavouritesType>();

	const columns = [
		columnHelper.accessor("cleaner.name", {
			header: "Cleaner Name",
			cell: (props) => props.getValue(),
		}),
		columnHelper.accessor("createdAt", {
			header: "Added On",
			cell: (props) => props.getValue(),
		}),
		columnHelper.display({
			id: "actions",
			header: "Action",
			cell: (props) => {
				const cleanerId = props.row.original.cleaner.id;
				return (
					<Button asChild>
						<Link href={`/dashboard/cleaners/${cleanerId}`}>
							<EyeIcon className="size-4" />
							View
						</Link>
					</Button>
				);
			},
		}),
	];

	const table = useReactTable({
		data: favourites,
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
