import express, { Request, Response } from "express";
import { User } from "@/types/types/types.common";
import { AuthRepository } from "../repository/auth.repository";

export class AuthService {
  public authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async createUser(data: User) {
    try {
      const newUser = await this.authRepository.create({
        username: data.username,
        password: data.password,
      });
      return newUser;
    } catch (error) {
      return error;
    }
  }

  async findUnique({ username }: Omit<User, "password">) {
    try {
      const user = await this.authRepository.findOne({ username });
      return user;
    } catch (error) {
      return error;
    }
  }
}
