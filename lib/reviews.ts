import {z} from 'zod';

export const reviewSubmissionSchema=z.object({
 name:z.string().trim().min(2).max(60),
 message:z.string().trim().min(15).max(700),
 rating:z.number().int().min(1).max(5),
 website:z.string().max(120).optional(),
 startedAt:z.number().int().positive(),
}).strict();

export const reviewModerationSchema=z.object({
 id:z.string().uuid(),
 status:z.enum(['approved','rejected']),
}).strict();

export const reviewDeleteSchema=z.object({id:z.string().uuid()}).strict();

export type ReviewSubmission=z.infer<typeof reviewSubmissionSchema>;
export type ReviewStatus='pending'|'approved'|'rejected';
