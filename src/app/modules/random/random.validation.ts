import { z } from 'zod';
      
const createRandomZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error:"title is required", invalid_type_error:"title should be type string" }),
      products: z.array(z.string({required_error:"products is required", invalid_type_error:"products array item should have type string" })),
      arrString: z.array(z.string({  invalid_type_error:"arrString array item should have type string" }).optional()),
      arrdate: z.array(z.date({ required_error:"arrdate is required", invalid_type_error:"arrdate array item should have type date" })),
      number: z.number({ required_error:"number is required", invalid_type_error:"number should be type number" })
  }),
});

const updateRandomZodSchema = z.object({
  body: z.object({
    title: z.string({ invalid_type_error:"title should be type string" }).optional(),
      products: z.array(z.string({ invalid_type_error:"products array item should have type string" })).optional(),
      arrString: z.array(z.string({ invalid_type_error:"arrString array item should have type string" })).optional(),
      arrdate: z.array(z.date({ invalid_type_error:"arrdate array item should have type date" })).optional(),
      number: z.number({ invalid_type_error:"number should be type number" }).optional()
  }),
});

export const RandomValidation = {
  createRandomZodSchema,
  updateRandomZodSchema
};
