import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const markRiddenSchema = z.object({
	coasters: z.array(z.number().int()),
	includeDate: z.boolean().optional(),
});

type MarkRiddenInput = z.infer<typeof markRiddenSchema>;

export const markRidden = async (input: MarkRiddenInput, db: PrismaClient) => {
	const date = new Date().toISOString().slice(0, 10);

	const result = await db.coaster.updateMany({
		where: { id: { in: input.coasters } },
		data: {
			ridden: true,
			riddenDate: input.includeDate ? date : undefined,
		},
	});

	return result;
};
