import { z } from 'zod';
export const workStatusSchema = z.enum(['completed','in_progress','postponed','cancelled']);
export type WorkStatus = z.infer<typeof workStatusSchema>;
export const workItemSchema = z.object({
  id:z.string(), dailyLogId:z.string(), task:z.string(), result:z.string(),
  nextAction:z.string(), status:workStatusSchema, position:z.number().int(),
  createdAt:z.string(), updatedAt:z.string(),
});
export type WorkItem = z.infer<typeof workItemSchema>;
export const dailyLogSchema = z.object({
  id:z.string(), logDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt:z.string(), updatedAt:z.string(), items:z.array(workItemSchema),
});
export type DailyLog = z.infer<typeof dailyLogSchema>;
