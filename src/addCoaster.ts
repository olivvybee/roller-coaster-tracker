import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const addCoasterSchema = z.object({
	parkId: z.string(),
	name: z.string(),
	ridden: z.optional(z.boolean()),
	opened: z.string().date(),
	closed: z.optional(z.string().date()),
	latitude: z.number(),
	longitude: z.number(),
	rcdb: z.string(),
});

type AddCoasterInput = z.infer<typeof addCoasterSchema>;

export const addCoaster = async (input: AddCoasterInput, db: PrismaClient) => {
	const result = await db.coaster.create({
		data: {
			park: {
				connect: {
					id: input.parkId,
				},
			},
			name: input.name,
			ridden: input.ridden ?? false,
			opened: input.opened,
			closed: input.closed,
			latitude: input.latitude,
			longitude: input.longitude,
			rcdb: input.rcdb,
		},
	});

	return result;
};
