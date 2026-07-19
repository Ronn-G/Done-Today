import { z } from 'zod';
export const localDateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const workStatusSchema = z.enum(['completed','in_progress','postponed','cancelled']);
export type WorkStatus = z.infer<typeof workStatusSchema>;
export const workItemSchema = z.object({
  id:z.string(), dailyLogId:z.string(), task:z.string().max(500), result:z.string().max(2000),
  nextAction:z.string().max(1000), status:workStatusSchema, position:z.number().int().nonnegative(),
  categoryId:z.string().nullable(),
  createdAt:z.string(), updatedAt:z.string(),
});
export type WorkItem = z.infer<typeof workItemSchema>;
export const updateWorkItemSchema=workItemSchema.pick({
  id:true,task:true,result:true,nextAction:true,status:true,
});
export type UpdateWorkItem=z.infer<typeof updateWorkItemSchema>;
export const dailyLogSchema = z.object({
  id:z.string(), logDate:localDateSchema,
  createdAt:z.string(), updatedAt:z.string(), items:z.array(workItemSchema),
});
export type DailyLog = z.infer<typeof dailyLogSchema>;
export const dailyLogSummarySchema=z.object({
  id:z.string(),logDate:localDateSchema,totalItems:z.number().int().nonnegative(),
  completedItems:z.number().int().nonnegative(),percentage:z.number().min(0).max(100),
  previewTasks:z.array(z.string()).max(3),updatedAt:z.string(),
});
export type DailyLogSummary=z.infer<typeof dailyLogSummarySchema>;
export const historyPageSchema=z.object({
  items:z.array(dailyLogSummarySchema),page:z.number().int().positive(),
  pageSize:z.number().int().positive(),hasMore:z.boolean(),
});
export type HistoryPage=z.infer<typeof historyPageSchema>;
