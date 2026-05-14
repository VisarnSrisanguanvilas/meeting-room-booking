"use client"

import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterCard() {
  const router = useRouter()
  const API = "http://127.0.0.1:8000"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [loading, setLoading] = useState(false)

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const PASSWORD_REGEX = /^.{6,}$/

  const isFormValid =
    EMAIL_REGEX.test(email) &&
    PASSWORD_REGEX.test(password) &&
    password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || loading) return

    try {
      setLoading(true)

      await axios.post(API + "/users/user", {
        email,
        password,
      })

      toast.success("Signin Successful", {
        description: "สามารถเข้าสู่ระบบได้ทันที",
      })

      router.push("/login")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Signin failed"
        : "Signin failed"

      toast.error("สมัครสมาชิกไม่สำเร็จ", {
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/40">

        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/images/room.png"
            alt="Sudoku"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-br from-black/30 to-transparent" />
        </div>
        <div className="w-full md:w-1/2 p-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-black">
                Create account
              </CardTitle>
              <CardDescription className="text-sm text-black/70">
                Enter your information to create an account
              </CardDescription>
              <CardAction>
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="px-0 text-sm font-medium text-indigo-600 cursor-pointer"
                >
                  Login
                </Button>
              </CardAction>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-black">
                  <Label>Email</Label>
                  <Input
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => {
                      const v = e.target.value
                      setEmail(v)
                      setEmailError(
                        v && !EMAIL_REGEX.test(v)
                          ? "รูปแบบอีเมลไม่ถูกต้อง"
                          : ""
                      )
                    }}
                  />
                  <p className="text-xs min-h-4 text-red-600 transition-opacity">
                    {emailError}
                  </p>
                </div>
                <div className="space-y-2 text-black">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => {
                      const v = e.target.value
                      setPassword(v)
                      setPasswordError(
                        v && !PASSWORD_REGEX.test(v)
                          ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
                          : ""
                      )

                      if (confirmPassword && v !== confirmPassword) {
                        setConfirmError("รหัสผ่านไม่ตรงกัน")
                      } else {
                        setConfirmError("")
                      }
                    }}
                  />
                  <p className="text-xs min-h-4 text-red-600 transition-opacity">
                    {passwordError}
                  </p>
                </div>
                <div className="space-y-2 text-black">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    placeholder="Confirm your password"
                    onChange={(e) => {
                      const v = e.target.value
                      setConfirmPassword(v)
                      setConfirmError(
                        v && v !== password ? "รหัสผ่านไม่ตรงกัน" : ""
                      )
                    }}
                  />
                  <p className="text-xs min-h-4 text-red-600 transition-opacity">
                    {confirmError}
                  </p>
                </div>

              </CardContent>

              <CardFooter className="mt-5">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="h-11 w-full rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:opacity-90 cursor-pointer"
                >
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
