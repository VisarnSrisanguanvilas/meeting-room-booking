"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Image from "next/image"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users} from "lucide-react"
import type { Room } from "@/app/types/types"
import { EditRoomModal } from "@/app/admin/component/editRoomModal"

function StatusBadge({ status }: { status: Room["status"] }) {
  const map: Record<string, string> = {
    available: "bg-green-600 text-white",
    reserved: "bg-amber-500 text-white",
    booked: "bg-red-600 text-white",
  }

  return (
    <Badge className={`${map[status]} capitalize`}>
      {status}
    </Badge>
  )
}

function AddRoomModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [size, setSize] = useState(6)
  const [price, setPrice] = useState(100)
  const [loading, setLoading] = useState(false)

  const createRoom = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      await axios.post(
        "http://127.0.0.1:8000/rooms/",
        { room_name: name, size, price },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Room created successfully")

      setOpen(false)
      setName("")
      setPrice(100)
      setSize(6)

      onSuccess()
    } catch {
      toast.error("Create room failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
          <Plus size={16} />
          Add Room
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl bg-white shadow-2xl border">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <label htmlFor="room-name" className="text-sm font-medium">Room Name</label>
          <Input
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="room-size" className="text-sm font-medium">Room Size</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            <option value={6}>6 people</option>
            <option value={8}>8 people</option>
            <option value={10}>10 people</option>
          </select>
          <label htmlFor="room-price" className="text-sm font-medium">Price / hour</label>
          <Input
            type="number"
            placeholder="Price / hour"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <Button
            onClick={createRoom}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])

  const loadRooms = () => {
    const token = localStorage.getItem("token")

    axios
      .get("http://127.0.0.1:8000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRooms(res.data))
  }


  useEffect(loadRooms, [])

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage all meeting rooms
          </p>
        </div>

        <AddRoomModal onSuccess={loadRooms} />
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">

        {rooms.map((room) => (
          <Card
            key={room.id}
            className="rounded-2xl overflow-hidden hover:shadow-xl transition group"
          >
            <div className="relative h-36 w-full">
              <Image
                src={`https://picsum.photos/seed/room${room.id}/600/400`}
                alt={room.room_name}
                fill
                className="object-cover group-hover:scale-105 transition"
              />
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-base">
                {room.room_name}
                <StatusBadge status={room.status} />
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-muted-foreground">

              <p className="flex items-center gap-1">
                <Users size={14} />
                {room.size} people
              </p>

              <p className="font-semibold text-indigo-600">
                ฿ {room.price} / hr
              </p>

              <EditRoomModal
                room={room}
                onSuccess={loadRooms}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
