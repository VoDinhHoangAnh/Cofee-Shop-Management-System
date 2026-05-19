// src/modules/auth/auth.service.ts

import { getSession, login, logout } from "@/lib/auth/auth";
import { RouteError } from "@/lib/http/route-error";
import bcrypt from "bcryptjs";
import type { LoginDto } from "./dto/login.dto";
import { authRepository } from "./auth.repository";
import type { LoginUserView } from "./auth.types";

export const authService = {
  async login(dto: LoginDto): Promise<{ user: LoginUserView }> {
    if (!dto.username || !dto.password) {
      throw new RouteError("Username and password are required", 400);
    }

    const user = await authRepository.findUserByUsername(dto.username);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new RouteError("Invalid username or password", 401);
    }

    const loginUser: LoginUserView = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      name: user.name,
    };

    await login(loginUser);

    return { user: loginUser };
  },

  async logout() {
    await logout();
  },

  async getCurrentSession() {
    const session = await getSession();

    return { user: session };
  },
};