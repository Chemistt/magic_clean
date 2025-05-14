import Image from "next/image";
import Link from "next/link";

import { auth } from "@/server/auth";

export default async function Home() {
	const session = await auth();

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<div>
					<Image
						src="https://media.discordapp.net/attachments/882342363882721320/1363851033784094752/wuthering-waves-announcement-regarding-the-player-v0-pxymmudlj6we1.png?ex=680b7d41&is=680a2bc1&hm=4e6d07334c895fbc7e6dae6eb0a26cc3ffb36a50da1a54f3787f03490958e005&=&format=webp&quality=lossless&width=576&height=261"
						alt="test image"
						width={576}
						height={261}
					/>
				</div>
				<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
					Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
				</h1>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
					<Link
						className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
						href="https://create.t3.gg/en/usage/first-steps"
						target="_blank"
					>
						<h3 className="text-2xl font-bold">First Steps →</h3>
						<div className="text-lg">
							Just the basics - Everything you need to know to set up your
							database and authentication.
						</div>
					</Link>
					<Link
						className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
						href="https://create.t3.gg/en/introduction"
						target="_blank"
					>
						<h3 className="text-2xl font-bold">Documentation →</h3>
						<div className="text-lg">
							Learn more about Create T3 App, the libraries it uses, and how to
							deploy it.
						</div>
					</Link>
				</div>
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center justify-center gap-4">
						<p className="text-center text-2xl text-white">
							{session && <span>Logged in as {session.user.name ?? "?"}</span>}
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
