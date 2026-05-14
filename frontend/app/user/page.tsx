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
  Clock,
  CheckCircle,
  Calendar,
  Plus,
} from "lucide-react"
import type { DashboardData} from "@/app/types/types"
import {BookingModal} from "@/app/user/component/bookingModal"
import { toast } from "sonner"

function StatCard({ icon, title, value, color }: { icon: ReactNode, title: string, value: string | number, color: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${map[status]}`}
    >
      {status}
    </span>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [open, setOpen] = useState(false)

  const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem("token")

    const res = await axios.get(
      "http://127.0.0.1:8000/users/dashboard-user",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    setData(res.data)

  } catch (err) {
    console.error("Dashboard load failed:", err)
    toast.error("Dashboard load failed")
  }
}

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchDashboard()
}, [])

const createBooking = async (
  room: number,
  start: string,
  end: string
) => {
  try {
    const token = localStorage.getItem("token")

    const startDate = new Date(start)
    const endDate = new Date(end)

    await axios.post(
      "http://127.0.0.1:8000/bookings/",
      {
        room_id: room,
        date: startDate.toISOString().slice(0, 10),
        start_hour: startDate.getHours(),
        end_hour: endDate.getHours(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    await fetchDashboard()

  } catch (err) {
    console.error("Create booking failed:", err)
    toast.error("Create booking failed")
    }
}

  if (!data) return null

  const { user, stats, bookings } = data

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">

      <div className="rounded-3xl bg-indigo-600 text-white p-6 flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">Wallet balance</p>
          <h2 className="text-3xl font-semibold">฿ {user.wallet.toLocaleString()}</h2>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-white text-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={16} />
          Book Room
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Total" value={stats.total_bookings} icon={<Calendar />} color="bg-blue-600 text-white" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="bg-amber-500 text-white" />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<CheckCircle />} color="bg-green-600 text-white" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.room_name}</TableCell>
                  <TableCell>{new Date(b.start_time).toLocaleString()}</TableCell>
                  <TableCell>{new Date(b.end_time).toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {open && (
        <BookingModal
          wallet={user.wallet}
          onClose={() => setOpen(false)}
          onSubmit={createBooking}
        />
      )}
    </div>
  )
}
