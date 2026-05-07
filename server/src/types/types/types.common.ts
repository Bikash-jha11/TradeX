import * as z from "zod";
import { UserValidation } from "validation/auth.validation";

export type User = z.infer<typeof UserValidation>;
