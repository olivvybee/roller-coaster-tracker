/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const parks = await prisma.park.findMany();
		const result = JSON.stringify(parks);
		return new Response(result);
	},
} satisfies ExportedHandler<Env>;
