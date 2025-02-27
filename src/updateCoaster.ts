import { z } from 'zod';
import { addCoasterSchema } from './addCoaster';
import { PrismaClient } from '@prisma/client';

export const updateCoasterSchema = addCoasterSchema
	.omit({
		parkId: true,
	})
	.extend({
		riddenDate: z.nullable(z.string().date()),
	})
	.partial();

type UpdateCoasterInput = z.infer<typeof updateCoasterSchema>;

export const updateCoaster = async (coasterId: number, input: UpdateCoasterInput, db: PrismaClient) => {
	const result = await db.coaster.update({
		where: {
			id: coasterId,
		},
		data: {
			...input,
		},
	});

	return result;
};
