import { redirect } from "next/navigation";

import Landing from "@/components/landing";
import { auth } from "@/server/auth";

export default async function Home() {
	const session = await auth();

	if (session) {
		redirect("/dashboard");
	}

	return (
		<main>
			<Landing />
		</main>
	);
}
