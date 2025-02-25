import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { addCoasterSchema } from './addCoaster';

export const addParkSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	name: z.string(),
	country: z.string(),
	coasters: z.optional(z.array(addCoasterSchema.omit({ parkId: true }))),
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
					id: coaster.id,
					name: coaster.name,
					ridden: coaster.ridden ?? false,
					opened: coaster.opened,
					closed: coaster.closed,
					latitude: coaster.latitude,
					longitude: coaster.longitude,
				})),
			},
		},
		include: {
			coasters: true,
		},
	});

	return result;
};
