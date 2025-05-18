/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "media.discordapp.net",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "cdn.jsdelivr.net",
				port: "",
				pathname: "/**",
			},
		],
	},
	experimental: {
		reactCompiler: false,
		ppr: false,
		authInterrupts: true,
	},
};

export default config;
