import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const addParkSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	name: z.string(),
	country: z.string(),
	coasters: z.optional(
		z.array(
			z.object({
				name: z.string(),
				ridden: z.optional(z.boolean()),
				opened: z.string().date(),
				closed: z.optional(z.string().date()),
				latitude: z.number(),
				longitude: z.number(),
				rcdb: z.string(),
			})
		)
	),
});

type AddParkInput = z.infer<typeof addParkSchema>;

export const addPark = async (input: AddParkInput, db: PrismaClient) => {
	const coasters = input.coasters || [];

	const result = await db.park.create({
		data: {
			id: input.id,
			name: input.name,
			country: input.country,
			coasters: {
				create: coasters.map((coaster) => ({
					name: coaster.name,
					ridden: coaster.ridden ?? false,
					opened: new Date(coaster.opened),
					closed: coaster.closed ? new Date(coaster.closed) : undefined,
					latitude: coaster.latitude,
					longitude: coaster.longitude,
					rcdb: coaster.rcdb,
				})),
			},
		},
		include: {
			coasters: true,
		},
	});

	return result;
};