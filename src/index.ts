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
import { Context, Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { validator } from 'hono/validator';
import { addPark, addParkSchema } from './addPark';

interface WorkerEnv extends Env {
	API_KEY: string;
}

const getDB = (ctx: Context<{ Bindings: WorkerEnv }>) => {
	const adapter = new PrismaD1(ctx.env.DB);
	return new PrismaClient({ adapter });
};

const app = new Hono<{ Bindings: WorkerEnv }>();

app.use(prettyJSON());
app.use(logger());

// TODO: Uncomment to enable auth
// app.use(async (ctx, next) => {
// 	const auth = bearerAuth({ token: ctx.env.API_KEY });
// 	return auth(ctx, next);
// });

app.get('/parks', async (ctx) => {
	const db = getDB(ctx);

	const parks = await db.park.findMany({
		include: { coasters: true },
	});

	return ctx.json(parks);
});

app.get('/parks/:id', async (ctx) => {
	const db = getDB(ctx);

	const id = ctx.req.param('id');
	const park = await db.park.findUnique({
		where: { id },
		include: { coasters: true },
	});

	return ctx.json(park);
});

app.post(
	'/parks/add',
	validator('json', (value, ctx) => {
		const parsed = addParkSchema.safeParse(value);
		if (!parsed.success) {
			return ctx.json(parsed.error, 401);
		}
		return parsed.data;
	}),
	async (ctx) => {
		const db = getDB(ctx);
		const input = ctx.req.valid('json');

		const result = await addPark(input, db);

		return ctx.json(result);
	}
);

app.get('/coasters', async (ctx) => {
	const db = getDB(ctx);

	const coasters = await db.coaster.findMany();
	return ctx.json(coasters);
});

export default app;
