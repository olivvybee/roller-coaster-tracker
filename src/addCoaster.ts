import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const dateRegex = /^\d{4}(-\d{2})?(-\d{2})?$/;

export const addCoasterSchema = z.object({
	parkId: z.string(),
	id: z.number(),
	name: z.string(),
	ridden: z.optional(z.boolean()),
	riddenDate: z.optional(z.string().regex(dateRegex)),
	opened: z.string().regex(dateRegex),
	closed: z.optional(z.string().regex(dateRegex)),
	latitude: z.number(),
	longitude: z.number(),
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
			id: input.id,
			name: input.name,
			ridden: input.ridden ?? false,
			opened: input.opened,
			closed: input.closed,
			latitude: input.latitude,
			longitude: input.longitude,
		},
	});

	return result;
};
