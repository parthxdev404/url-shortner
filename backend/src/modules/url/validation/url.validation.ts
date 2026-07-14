import z from 'zod/v3'

export const createShortUrlSchema = z.object({
    body : z.object({
        originalUrl : z
        .string()
        .trim()
        .url("Please provide a valid Url")
        .max(2040 , 'Url is too long'),

        customAlias: z
        .string()
        .trim()
        .min(4)
        .max(30)
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Alias can only contain letters, numbers, '-' and '_'"
        )
        .optional(),

    }),
})

export const redirectSchema = z.object({
    params : z.object({
        shortCode : z
        .string()
        .trim()
        .min(6)
        .max(12)
    }),
})

export const urlIdSchema = z.object({
    params : z.object({
        id : z
            .string()
            .trim()
            .regex(/^[0-9-a-fA-F]{24}$/,'Invalid MongoDB ObjectId')
    })
})

export type createShortUrlInput = z.infer<typeof createShortUrlSchema>;
export type RedirectInput = z.infer<typeof redirectSchema>;
export type UrlIdInput = z.infer<typeof urlIdSchema>;