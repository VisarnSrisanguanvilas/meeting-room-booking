"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
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
import { getPayloadFromToken } from "@/lib/jwt"
import { toast } from "sonner"

export default function LoginCard() {
    const API = "http://127.0.0.1:8000"
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [loading, setLoading] = useState(false)

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const PASSWORD_REGEX = /^.{6,}$/

    useEffect(() => {
        const payload = getPayloadFromToken()
        if (!payload) return
        router.push(payload.role === "admin" ? "/admin" : "/user")
    }, [router])

    const isFormValid =
        EMAIL_REGEX.test(email) && PASSWORD_REGEX.test(password)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid || loading) return

        setLoading(true)
        try {
            const res = await axios.post(API + "/login", {
                email,
                password,
            })

            const token = res.data.access_token
            if (!token) throw new Error("Login failed")

            localStorage.setItem("token", token)
            axios.defaults.headers.common["Authorization"] = token

            toast.success("Login Successful", {
                description: "เข้าสู่ระบบสำเร็จ",
            })

            const payload = getPayloadFromToken()
            if (!payload) throw new Error("Invalid token")

            router.push(payload.role === "admin" ? "/admin" : "/user")
        } catch {
            toast.error("Login failed", {
                description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100 p-4">
            <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/40">
                <div className="w-full md:w-1/2 p-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-black">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-sm text-black">
                                Sign in to continue to your account
                            </CardDescription>
                            <CardAction>
                                <Button
                                    variant="link"
                                    onClick={() => router.push("/signin")}
                                    className="px-0 text-sm font-medium text-indigo-600 cursor-pointer"
                                >
                                    Sign Up
                                </Button>
                            </CardAction>
                        </CardHeader>

                        <CardContent>
                            <form
                                className="space-y-5 text-black"
                                onSubmit={handleLogin}
                            >
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={email}
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
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            setPassword(v)
                                            setPasswordError(
                                                v && !PASSWORD_REGEX.test(v)
                                                    ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
                                                    : ""
                                            )
                                        }}
                                    />
                                    <p className="text-xs min-h-4 text-red-600 transition-opacity">
                                        {passwordError}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className="w-full h-11 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white cursor-pointer"
                                >
                                    {loading ? "Loading..." : "Login"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter />
                    </Card>
                </div>
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
            </div>
        </div>
    )
}
