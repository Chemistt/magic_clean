"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LoginButton() {
	return (
		<Button
			onClick={() => {
				void signIn("discord");
			}}
		>
			Login
		</Button>
	);
}
