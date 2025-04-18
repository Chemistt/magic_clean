import type { ReactNode } from "react";

type ProfileProps = {
	children: ReactNode;
};
export default function ProfileLayout({ children }: ProfileProps) {
	return (
		<main className="flex size-full flex-col items-center gap-y-12 overflow-y-auto p-12">
			{children}
		</main>
	);
}
