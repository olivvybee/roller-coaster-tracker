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
import { Context, Hono, MiddlewareHandler } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { validator } from 'hono/validator';
import { addPark, addParkSchema } from './addPark';
import { addCoaster, addCoasterSchema } from './addCoaster';
import { updateCoaster, updateCoasterSchema } from './updateCoaster';
import { markRidden, markRiddenSchema } from './markRidden';

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

const authMiddleware: MiddlewareHandler = async (ctx, next) => {
	const auth = bearerAuth({ token: ctx.env.API_KEY });
	return auth(ctx, next);
};

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

	if (!park) {
		return ctx.notFound();
	}

	return ctx.json(park);
});

app.post(
	'/parks/add',
	authMiddleware,
	validator('json', (value, ctx) => {
		const parsed = addParkSchema.safeParse(value);
		if (!parsed.success) {
			return ctx.json(parsed.error, 400);
		}
		return parsed.data;
	}),
	async (ctx) => {
		const db = getDB(ctx);
		const input = ctx.req.valid('json');

		const existingPark = await db.park.findUnique({
			where: {
				id: input.id,
			},
		});
		if (existingPark) {
			return ctx.json({ error: `Park with id "${input.id}" already exists` }, 400);
		}

		const result = await addPark(input, db);
		return ctx.json(result);
	}
);

app.get('/coasters', async (ctx) => {
	const db = getDB(ctx);

	const coasters = await db.coaster.findMany();
	return ctx.json(coasters);
});

app.post(
	'/coasters/add',
	authMiddleware,
	validator('json', (value, ctx) => {
		const parsed = addCoasterSchema.safeParse(value);
		if (!parsed.success) {
			return ctx.json(parsed.error, 400);
		}
		return parsed.data;
	}),
	async (ctx) => {
		const db = getDB(ctx);
		const input = ctx.req.valid('json');

		const park = await db.park.findUnique({
			where: {
				id: input.parkId,
			},
		});
		if (!park) {
			return ctx.notFound();
		}

		const result = await addCoaster(input, db);
		return ctx.json(result);
	}
);

app.post(
	'/coasters/:id/update',
	authMiddleware,
	validator('param', (value, ctx) => {
		const parsedId = parseInt(value.id);
		if (isNaN(parsedId)) {
			return ctx.json({ error: 'coaster id must be an integer' }, 400);
		}
		return {
			id: parsedId,
		};
	}),
	validator('json', (value, ctx) => {
		const parsed = updateCoasterSchema.safeParse(value);
		if (!parsed.success) {
			return ctx.json(parsed.error, 400);
		}
		return parsed.data;
	}),
	async (ctx) => {
		const coasterId = ctx.req.valid('param').id;
		const db = getDB(ctx);
		const input = ctx.req.valid('json');

		const coaster = await db.coaster.findUnique({
			where: {
				id: coasterId,
			},
		});
		if (!coaster) {
			return ctx.notFound();
		}

		const result = await updateCoaster(coasterId, input, db);
		return ctx.json(result);
	}
);

app.post(
	'/coasters/markRidden',
	authMiddleware,
	validator('json', (value, ctx) => {
		const parsed = markRiddenSchema.safeParse(value);
		if (!parsed.success) {
			return ctx.json(parsed.error, 400);
		}
		return parsed.data;
	}),
	async (ctx) => {
		const db = getDB(ctx);
		const input = ctx.req.valid('json');

		const coasters = await db.coaster.findMany({
			where: { id: { in: input.coasters } },
			select: { id: true },
		});
		if (coasters.length !== input.coasters.length) {
			const foundIds = coasters.map(({ id }) => id);
			const missingCoasters = input.coasters.filter((id) => !foundIds.includes(id)).join(', ');
			return ctx.json(`Coaster ids not found: [${missingCoasters}]`, 404);
		}

		const result = await markRidden(input, db);
		return ctx.json(result);
	}
);

export default app;
