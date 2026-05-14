"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Image from "next/image"
import { Room } from "@/app/types/types"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"


export function BookingModal({ wallet, onClose, onSubmit,
}: {
  wallet: number
  onClose: () => void
  onSubmit: (room: number, start: string, end: string) => Promise<void>
}) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [date, setDate] = useState("")
  const [time, setTime] = useState(9)
  const [hours, setHours] = useState(1)
  const [step, setStep] = useState<"room" | "time">("room")
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<
    { start: number; end: number; available: boolean }[]
  >([])

  const today = new Date().toISOString().split("T")[0]
  const isPastTime = () => {
    const now = new Date()
    if (!date) return false
    const selected = new Date(`${date}T${String(time).padStart(2, "0")}:00:00`)
    return selected <= now
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(
          "http://127.0.0.1:8000/rooms",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        setRooms(res.data)

      } catch (err) {
        console.error(err)
        toast.error("Load rooms failed")
      }
    }

    fetchRooms()
  }, [])

  useEffect(() => {
    if (!room || !date) return

    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(
          `http://127.0.0.1:8000/rooms/availability?date=${date}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const roomData = res.data.find(
          (r: { room_id: number; slots: typeof slots }) =>
            r.room_id === room.id
        )

        setSlots(roomData?.slots || [])

      } catch (err) {
        console.error(err)
        toast.error("Load availability failed")
      }
    }

    fetchAvailability()
  }, [room, date])

  const total = room ? room.price * hours : 0
  const insufficient = total > wallet

  const isRangeAvailable = (start: number, duration: number) => {
    const needed = slots.filter(
      (s) => s.start >= start && s.start < start + duration
    )

    return (
      needed.length === duration &&
      needed.every((s) => s.available)
    )
  }

  const invalidRange = !isRangeAvailable(time, hours) || isPastTime()
  const showSelectWarning = !room || !date
  const showPastWarning = date && isPastTime()
  const showUnavailableWarning = room && date && !isRangeAvailable(time, hours)


  const formatLocal = (d: Date) =>
    d.toLocaleString("sv-SE").replace(" ", "T")

  const confirm = async () => {
    if (!room || !date) return

    try {
      setLoading(true)

      const start = new Date(
        `${date}T${String(time).padStart(2, "0")}:00:00`
      )
      const end = new Date(start)
      end.setHours(start.getHours() + hours)

      await onSubmit(room.id, formatLocal(start), formatLocal(end))

      toast.success("Booking confirmed")
      onClose()

    } catch (err) {
      console.error(err)
      toast.error("Booking failed")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Book a Room</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>
        <div className="p-8">
          {step === "room" && (
            <>
              <p className="mb-5 text-sm text-slate-500">
                Select an available room
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((r) => {
                  const disabled = r.status !== "available"

                  return (
                    <button
                      key={r.id}
                      disabled={disabled}
                      onClick={() => {
                        setRoom(r)
                        setStep("time")
                      }}
                      className={`
                        group text-left rounded-2xl border bg-white overflow-hidden
                        transition-all duration-200
                        ${disabled && "opacity-40 cursor-not-allowed"}
                        ${!disabled && "hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300"}
                      `}
                    >
                      <div className="relative h-36 w-full">
                        <Image
                          src={`https://picsum.photos/seed/room${r.id}/600/400`}
                          alt={r.room_name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="p-4 flex justify-between items-center">
                        <p className="font-semibold">{r.room_name}</p>
                        <p className="font-semibold">size:  {r.size}</p>
                        <p className="text-indigo-600 font-semibold">
                          ฿ {r.price}/hr
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === "time" && room && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <button
                  onClick={() => setStep("room")}
                  className="text-sm text-indigo-600 flex gap-2 items-center"
                >
                  <ArrowLeft size={16} />
                  Change room
                </button>

                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <select
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  className="w-full border rounded-xl p-3"
                >
                  {slots.map((s) => (
                    <option
                      key={s.start}
                      value={s.start}
                      disabled={
                        !s.available ||
                        (date === today && s.start <= new Date().getHours())
                      }

                    >
                      {String(s.start).padStart(2, "0")}:00
                      {!s.available && " (Booked)"}
                    </option>
                  ))}
                </select>

                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full border rounded-xl p-3"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h > 1 && "s"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                <p className="font-semibold text-lg">Summary</p>
                <p>Room: <b>{room.room_name}</b></p>
                <p>Total: <b>฿ {total}</b></p>
                <p>Wallet: ฿ {wallet}</p>
                {showSelectWarning && (
                  <p className="text-amber-600 text-sm">
                    Please select date and time first
                  </p>
                )}
                {showPastWarning && (
                  <p className="text-red-500 text-sm">
                    Selected time has already passed
                  </p>
                )}

                {showUnavailableWarning && (
                  <p className="text-red-500 text-sm">
                    Selected time is not available
                  </p>
                )}
                {insufficient && (
                  <p className="text-red-500 text-sm">
                    Insufficient wallet balance
                  </p>
                )}
                <button
                  disabled={loading || insufficient || invalidRange}
                  onClick={confirm}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl mt-4 disabled:opacity-40"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
