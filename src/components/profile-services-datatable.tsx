"use client";
import { useMutation } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ProfileServiceDialog } from "@/components/profile-service-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/react";

export const ServiceSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
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
	const [deleteDialogId, setDeleteDialogId] = React.useState<
		number | undefined
	>();
	const trpc = useTRPC();
	const deleteServiceMutation = useMutation(
		trpc.service.deleteService.mutationOptions({
			onSuccess: () => {
				toast.success("Service deleted successfully.");
			},
			onError: (error) => {
				toast.error(error.message || "Something went wrong. Please try again.");
			},
		})
	);
	const columnHelper = createColumnHelper<ServiceType>();

	const columns = [
		columnHelper.accessor("name", {
			header: "Name",
			cell: (props) => props.getValue(),
		}),
		columnHelper.accessor("isActive", {
			header: "Active",
			cell: (props) => {
				return props.getValue() ? (
					<CheckIcon className="size-4 text-green-500" />
				) : (
					<XIcon className="size-4 text-red-500" />
				);
			},
		}),
		columnHelper.accessor("category.name", {
			header: "Category",
			cell: (props) => <Badge>{props.getValue()}</Badge>,
		}),
		columnHelper.display({
			id: "actions",
			header: "Actions",
			cell: (props) => {
				const serviceId = props.row.original.id;
				return (
					<div className="flex items-center gap-2">
						<ProfileServiceDialog
							data={props.row.original}
							trigger={
								<Button variant="outline" size="icon">
									<PencilIcon className="size-4" />
								</Button>
							}
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
								setDeleteDialogId(serviceId);
							}}
						>
							<TrashIcon className="size-4" />
						</Button>
						<Dialog
							open={deleteDialogId === serviceId}
							onOpenChange={(open) => {
								if (!open) setDeleteDialogId(undefined);
							}}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Delete Service</DialogTitle>
									<DialogDescription>
										Sorry! This feature is not available yet.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											deleteServiceMutation.mutate({ id: serviceId });
										}}
									>
										Delete
									</Button>
									<DialogClose asChild>
										<Button variant="outline">Close</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				);
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
									No services found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
