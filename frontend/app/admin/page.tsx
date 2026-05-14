"use client"

import { useEffect, useState, ReactNode } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Home,
  Calendar,
  Wallet,
  Check,
  X,
  Clock,
} from "lucide-react"
import type { AdminDashboardData } from "@/app/types/types"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: ReactNode
  color: string
}) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-lg transition">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function BookingBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-700",
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${map[status]}`}>
      {status}
    </span>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.get(
        "http://127.0.0.1:8000/users/dashboard-admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setData(res.data)

    } catch (err) {
      console.error(err)
      toast.error("Load dashboard failed")
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])


  const updateBooking = async ( booking_id: number, action: "confirm" | "reject" ) => {
    try {
      setLoadingId(booking_id)

      const token = localStorage.getItem("token")

      await axios.patch(
        `http://127.0.0.1:8000/bookings/${booking_id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Updated successfully")
      await fetchDashboard()

    } catch (err) {
      console.error(err)
      toast.error("Update failed")

    } finally {
      setLoadingId(null)
    }
  }
  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    )
  }
  const { admin, stats } = data

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Users" value={stats.users} icon={<Users />} color="bg-indigo-600 text-white" />
        <StatCard title="Rooms" value={stats.rooms} icon={<Home />} color="bg-blue-600 text-white" />
        <StatCard title="Bookings" value={stats.bookings} icon={<Calendar />} color="bg-amber-500 text-white" />
        <StatCard title="Wallet" value={`฿ ${admin.wallet}`} icon={<Wallet />} color="bg-green-600 text-white" />
      </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Booking Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="flex justify-between p-4 rounded-xl border">
            <Badge className="bg-amber-600 text-white gap-1">
              <Clock size={14} />
              Pending
            </Badge>
            <span className="font-semibold">{stats.pending}</span>
          </div>
          <div className="flex justify-between p-4 rounded-xl border">
            <Badge className="bg-green-600 text-white gap-1">
              <Check size={14} />
              Confirmed
            </Badge>
            <span className="font-semibold">{stats.confirmed}</span>
          </div>
          <div className="flex justify-between p-4 rounded-xl border">
            <Badge className="bg-red-600 text-white gap-1">
              <X size={14} />
              Rejected
            </Badge>
            <span className="font-semibold">{stats.rejected}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Bookings</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.latest_bookings.map(b => (
                <TableRow key={b.booking_id}>
                  <TableCell>{b.booking_id}</TableCell>
                  <TableCell>{b.user_email}</TableCell>
                  <TableCell>{b.room_name}</TableCell>

                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(b.start_time)} – {formatDateTime(b.end_time)}
                  </TableCell>

                  <TableCell>
                    <BookingBadge status={b.status} />
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateBooking(b.booking_id, "confirm")}
                          disabled={loadingId === b.booking_id}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() => updateBooking(b.booking_id, "reject")}
                          disabled={loadingId === b.booking_id}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
