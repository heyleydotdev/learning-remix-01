import { useFetchers, useNavigation } from "@remix-run/react"

import Spinner from "~/components/spinner"
import { _intentSchema } from "~/lib/validations"

export default function LoadingIndicator() {
  const navigation = useNavigation()
  const isPageLoading = navigation.state === "loading"
  const isOptimisticSubmission = useOptimisticSubmissions()

  if (isPageLoading || isOptimisticSubmission) {
    return (
      <span>
        <Spinner className="size-4" />
      </span>
    )
  }

  return null
}

function useOptimisticSubmissions() {
  return useFetchers()
    .filter((f) => _intentSchema.safeParse(f.formData?.get("intent")).success)
    .some((f) => Boolean(f))
}
