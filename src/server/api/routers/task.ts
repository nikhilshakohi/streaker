import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Type checking while creating task
const createTaskSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  streak: z.number().min(0).optional(),
});

export const taskRouter = createTRPCRouter({
  // Get all tasks of the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      orderBy: { startDate: "desc" },
      where: { userId: ctx.session.user.id },
    });
    return tasks ?? null;
  }),
  // Create new task
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, startDate, endDate, streak } = input;
      return ctx.db.task.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          streak: streak ?? 0,
          userId: ctx.session.user.id,
        },
      });
    }),
});
