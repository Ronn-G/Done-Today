import { z } from 'zod';
import {
  isValidDayThemeId,
  isValidDayThemeVersion,
} from '../day-theme/validation';
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export type LocalDateKey = string;
export const journalActivityDatesSchema = z.array(z.string());
export const workStatusSchema = z.enum([
  'completed',
  'in_progress',
  'postponed',
  'cancelled',
]);
export type WorkStatus = z.infer<typeof workStatusSchema>;
export const workItemSchema = z.object({
  id: z.string(),
  dailyLogId: z.string(),
  task: z.string().max(500),
  result: z.string().max(2000),
  nextAction: z.string().max(1000),
  status: workStatusSchema,
  position: z.number().int().nonnegative(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WorkItem = z.infer<typeof workItemSchema>;
export const updateWorkItemSchema = workItemSchema.pick({
  id: true,
  task: true,
  result: true,
  nextAction: true,
  status: true,
});
export type UpdateWorkItem = z.infer<typeof updateWorkItemSchema>;
export const dayThemeMetadataSchema = z
  .object({
    themeId: z.string().refine(isValidDayThemeId).nullable(),
    themeVersion: z.number().refine(isValidDayThemeVersion).nullable(),
  })
  .superRefine((value, context) => {
    if ((value.themeId === null) !== (value.themeVersion === null)) {
      context.addIssue({
        code: 'custom',
        path: ['themeId'],
        message: 'Day Theme metadata must be a complete pair.',
      });
    }
  });
export type DayThemeMetadata = z.infer<typeof dayThemeMetadataSchema>;
export const updateDayThemeMetadataSchema = dayThemeMetadataSchema.extend({
  dailyLogId: z.string().trim().min(1),
});
export const dailyLogSchema = z
  .object({
    id: z.string(),
    logDate: localDateSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    items: z.array(workItemSchema),
    themeId: z.string().refine(isValidDayThemeId).nullable(),
    themeVersion: z.number().refine(isValidDayThemeVersion).nullable(),
  })
  .superRefine((value, context) => {
    if ((value.themeId === null) !== (value.themeVersion === null)) {
      context.addIssue({
        code: 'custom',
        path: ['themeId'],
        message: 'Day Theme metadata must be a complete pair.',
      });
    }
  });
export type DailyLog = z.infer<typeof dailyLogSchema>;
export const dailyLogSummarySchema = z.object({
  id: z.string(),
  logDate: localDateSchema,
  totalItems: z.number().int().nonnegative(),
  completedItems: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  previewTasks: z.array(z.string()).max(3),
  updatedAt: z.string(),
});
export type DailyLogSummary = z.infer<typeof dailyLogSummarySchema>;
export const historyPageSchema = z.object({
  items: z.array(dailyLogSummarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  hasMore: z.boolean(),
});
export type HistoryPage = z.infer<typeof historyPageSchema>;
