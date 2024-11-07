import type { _optimisticTaskSchema } from "~/lib/validations"
import type { z } from "zod"

import { LRUCache } from "lru-cache"

export const taskCache = new LRUCache<string, Array<z.infer<typeof _optimisticTaskSchema>>>({
  max: 20,
  ttl: 1000 * 60 * 60, // 1 hour
})
