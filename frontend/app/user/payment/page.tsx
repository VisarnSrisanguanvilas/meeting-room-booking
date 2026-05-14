"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import type { UserInfo } from "@/app/types/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

export default function TopupPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [amount, setAmount] = useState<number>(100)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(
          "http://127.0.0.1:8000/users/dashboard-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setUser(res.data.user)

      } catch (err) {
        console.error("Load user failed:", err)
        toast.error(err instanceof Error ? err.message : "Load user failed")
      }
    }

    fetchUser()
  }, [])


  const topup = async () => {
    if (amount <= 0) return alert("Invalid amount")

    try {
      setLoading(true)

      const token = localStorage.getItem("token")

      const res = await axios.post(
        "http://127.0.0.1:8000/users/topup",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUser((prev) =>
        prev ? { ...prev, wallet: res.data.wallet } : prev
      )
      toast.success("Topup successful")

    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Topup failed"
        : "Topup failed"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }



  if (!user) return <p className="p-10">Loading...</p>

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-10 flex items-center justify-center">

      <Card className="w-full max-w-md rounded-2xl shadow-xl">

        <CardHeader>
          <CardTitle className="text-center text-xl">
            Wallet Top-up
          </CardTitle>
        </CardHeader>


        <CardContent className="space-y-6">

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Current Balance
            </p>

            <p className="text-4xl font-bold text-indigo-600">
              ฿ {user.wallet.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`p-2 rounded-xl border transition
                  ${amount === v
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-100"
                  }`}
              >
                ฿ {v}
              </button>
            ))}
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded-xl p-3 text-center"
            placeholder="Enter amount"
          />

          <button
            onClick={topup}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Top-up Now"}
          </button>

        </CardContent>
      </Card>
    </div>
  )
}
