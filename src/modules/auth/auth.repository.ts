// src/modules/auth/auth.repository.ts

import { getDb } from "@/lib/db/mongodb";

export const authRepository = {
  async findUserByUsername(username: string) {
    const db = await getDb();

    return db.collection("User").findOne({ username });
  },
};