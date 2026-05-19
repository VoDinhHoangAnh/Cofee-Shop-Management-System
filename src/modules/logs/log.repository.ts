// src/modules/logs/log.repository.ts

import { getDb } from "@/lib/db/mongodb";

export const logRepository = {
  async findRecentLogs() {
    const db = await getDb();

    return db
      .collection("AuditLog")
      .aggregate([
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            id: { $toString: "$_id" },
            action: 1,
            target: 1,
            timestamp: 1,
            user: { name: 1, username: 1 },
          },
        },
        { $sort: { timestamp: -1 } },
        { $limit: 100 },
      ])
      .toArray();
  },
};