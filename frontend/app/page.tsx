"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPayloadFromToken } from "@/lib/jwt"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
  const payload = getPayloadFromToken()

  if (!payload) {
    router.replace("/login")
    return
  }

  switch (payload.role) {
    case "user":
      router.replace("/user")
      break
    case "admin":
      router.replace("/admin")
      break
    default:
      router.replace("/login")
  }
}, [router])


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1> Loading ...</h1>
    </div>
  )
}
