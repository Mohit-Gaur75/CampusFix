import { z } from 'zod';
import { ROLES } from '../utils/constants.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    rollNo: z.string().regex(/^[a-zA-Z]{2}\d{2}[a-zA-Z]\d{3}$/, "Roll No must be in format like cs24b016")
  })
}).refine((data) => {
  const expectedEmail = `${data.body.rollNo.toLowerCase()}@gmail.com`;
  return data.body.email.toLowerCase() === expectedEmail;
}, {
  message: "Email must be in the format rollno@gmail.com",
  path: ["body", "email"]
});

export const demoLoginSchema = z.object({
  body: z.object({
    role: z.enum([ROLES.STUDENT, ROLES.AUTHORITY])
  })
});
