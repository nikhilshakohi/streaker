import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const logRouter = createTRPCRouter({
  // Get all logs of the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const logs = await ctx.db.log.findMany({
      where: { userId: ctx.session.user.id },
    });
    return logs ?? null;
  }),

  // Create new logs for the user
  create: protectedProcedure
    .input(z.object({ taskId: z.number(), todayDate: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if a log already exists for today
      const existingLog = await ctx.db.log.findFirst({
        where: {
          taskId: input.taskId,
          userId: userId,
          completionDate: input.todayDate,
        },
      });
      if (existingLog) return null;

      // Add Log entry
      await ctx.db.log.create({
        data: {
          taskId: input.taskId,
          userId: userId,
          completionDate: input.todayDate,
        },
      });

      // Update Task streak
      await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          streak: {
            increment: 1,
          },
        },
      });
    }),

  // Delete log of the use
  delete: protectedProcedure
    .input(z.object({ taskId: z.number(), todayDate: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if a log already exists for today
      const existingLog = await ctx.db.log.findFirst({
        where: {
          taskId: input.taskId,
          userId: userId,
          completionDate: input.todayDate,
        },
      });
      if (!existingLog) return null;

      // Delete the log entry
      await ctx.db.log.deleteMany({
        where: {
          taskId: input.taskId,
          userId: userId,
          completionDate: input.todayDate,
        },
      });

      // Update task streak
      await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          streak: {
            decrement: 1,
          },
        },
      });
    }),
});
