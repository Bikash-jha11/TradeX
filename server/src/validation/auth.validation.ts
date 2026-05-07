import * as z from "zod";


export const UserValidation = z.object({
    username: z.string().min(5,"Username should be alteast 5 letter"),
    password: z.string().min(5,"Username should be alteast 5 letter"),

})