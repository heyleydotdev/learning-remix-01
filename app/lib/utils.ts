import type { ZodError } from "zod"

import { cx } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs))

export const flattenZodFieldErrors = (error: ZodError) =>
  Object.entries(error.flatten().fieldErrors).reduce<Record<string, string>>((acc, [key, errors]) => {
    if (errors?.[0]) {
      acc[key] = errors[0]
    }
    return acc
  }, {})

export const omitKey = <T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _, ...rest } = obj
  return rest
}

export const objectToFormData = (object: Record<string, string>, formData?: FormData) => {
  formData ??= new FormData()
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key]!
      formData.set(key, element)
    }
  }
  return formData
}

export function timeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }

  for (const unit in intervals) {
    const interval = intervals[unit]
    if (interval) {
      const count = Math.floor(seconds / interval)
      if (count > 0) {
        return `${count} ${unit}${count !== 1 ? "s" : ""} ago`
      }
    }
  }

  return "just now"
}
