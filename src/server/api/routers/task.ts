import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Type checking while creating task
const createTaskSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  streak: z.number().min(0).optional(),
});

// Define a schema for editing a task
const editTaskSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export const taskRouter = createTRPCRouter({
  // Get all tasks of the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      orderBy: { id: "desc" },
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
          startDate: startDate.toString(),
          endDate: endDate.toString(),
          streak: streak ?? 0,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Edit an existing task
  edit: protectedProcedure
    .input(editTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;
      return ctx.db.task.update({
        where: { id },
        data: { name },
      });
    }),

  // Delete a task
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      // Delete all logs associated with the task
      await ctx.db.log.deleteMany({
        where: { taskId: id, userId: ctx.session.user.id },
      });
      // Delete the task
      return ctx.db.task.delete({
        where: { id },
      });
    }),
});
