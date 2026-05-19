// src/modules/logs/log.service.ts

import { logRepository } from "./log.repository";

export const logService = {
  async findRecentLogs() {
    return logRepository.findRecentLogs();
  },
};