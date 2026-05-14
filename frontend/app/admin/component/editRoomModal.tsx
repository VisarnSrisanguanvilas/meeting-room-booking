import { useState } from "react"
import { Room } from "../../types/types"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export function EditRoomModal({
  room,
  onSuccess,
}: {
  room: Room
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState(room.room_name)
  const [size, setSize] = useState(room.size)
  const [price, setPrice] = useState(room.price)
  const [loading, setLoading] = useState(false)

  const updateRoom = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      await axios.put(`http://127.0.0.1:8000/rooms/${room.id}`, {
        room_name: name,
        size,
        price,
      },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Room updated")

      setOpen(false)
      onSuccess()
    } catch {
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  const deleteRoom = async () => {
    if (!confirm("Delete this room?")) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      await axios.delete(
        `http://127.0.0.1:8000/rooms/${room.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Room deleted")

      setOpen(false)
      onSuccess()
    } catch {
      toast.error("Delete failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-1 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer">
          <Pencil size={14} />
          Manage
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl bg-white shadow-2xl border">

        <DialogHeader>
          <DialogTitle>Manage Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          <div className="relative h-32 rounded-xl overflow-hidden">
            <Image
              src={`https://picsum.photos/seed/room${room.id}/600/300`}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <label htmlFor="room-name" className="text-sm font-medium">Room Name</label>
          <Input
            id="room-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="room-size" className="text-sm font-medium">Room Size</label>
          <select
            id="room-size"
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
            id="room-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <div className="flex justify-between gap-2 pt-3 border-t">

            <Button
              className="bg-red-600 text-white"
              onClick={deleteRoom}
              disabled={loading}
            >
              Delete
            </Button>

            <Button
              className="bg-blue-800 text-white"
              onClick={updateRoom}
              disabled={loading}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
