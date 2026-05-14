import { jwtDecode } from "jwt-decode"
import { TokenPayload } from "@/app/types/types"

export const getPayloadFromToken = (): TokenPayload | null => {
  /* ✅ ป้องกัน SSR */
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}
