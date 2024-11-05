import { useNavigation } from "@remix-run/react"

import Spinner from "~/components/spinner"

export default function LoadingIndicator() {
  const navigation = useNavigation()

  if (navigation.state === "loading") {
    return (
      <span>
        <Spinner className="size-4" />
      </span>
    )
  }

  return null
}
