import { z } from "zod";
import { USER_ROLES } from "../../constants/roles";

const publicRoles = USER_ROLES.filter((r) => r !== "ADMIN");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().min(6).optional(),
    role: z.enum(publicRoles as ["TENANT", "LANDLORD"]).default("TENANT")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

