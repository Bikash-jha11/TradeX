import { Request, Response, NextFunction } from "express";
import { User } from "@/types/types/types.common";
import { UserValidation } from "validation/auth.validation";
import { AuthService } from "../service/auth.service";
import * as z from "zod";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //create instance of authservice;
    const authService = new AuthService();

    //Get req.body and validate user.
    const { username, password }: User = req.body;
    const validationResponse = UserValidation.parse(req.body);

    //Check if user already exist
    const user = await authService.findUnique({ username });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exist.Please create new" });
    };

    
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
    }
  }
}
