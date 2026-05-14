"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

import type { EventInput } from "@fullcalendar/core"
import type { Booking } from "@/app/types/types"

export default function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get<Booking[]>(
          "http://localhost:8000/bookings/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const allowed = ["confirmed", "pending"]

        const mapped: EventInput[] = res.data
          .filter((b) => allowed.includes(b.status))
          .map((b) => ({
            id: String(b.id),

            title:
              b.status === "confirmed"
                ? ` ${b.room_name}`
                : ` ${b.room_name}`,

            start: b.start_time,
            end: b.end_time,

            backgroundColor:
              b.status === "confirmed" ? "#2563eb" : "#f59e0b",

            borderColor: "transparent",
            textColor: "#fff",

            extendedProps: {
              status: b.status,
              room: b.room_name,
            },
          }))

        setEvents(mapped)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])
  const stats = useMemo(() => {
    const confirmed = events.filter(
      (e) => e.extendedProps?.status === "confirmed"
    ).length

    const pending = events.filter(
      (e) => e.extendedProps?.status === "pending"
    ).length

    return { confirmed, pending }
  }, [events])


  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Booking Calendar
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and track all room reservations
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold">
              Confirmed: {stats.confirmed}
            </div>
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-semibold">
              Pending: {stats.pending}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border p-5">

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              Loading bookings...
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}

              timeZone="local"

              initialView="dayGridMonth"

              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}

              events={events}
              eventDisplay="block"
              slotEventOverlap={true}
              eventMaxStack={999}
              expandRows

              dayMaxEvents={false}

              allDaySlot={false}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"

              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}

              nowIndicator
              height="auto"
              eventClassNames="
                rounded-xl
                shadow
                text-xs
                font-semibold
                px-2 py-1
                hover:scale-105
                transition
                cursor-pointer
              "

              dayCellClassNames="hover:bg-slate-50 transition"

              eventDidMount={(info) => {
                const { room, status } = info.event.extendedProps

                info.el.setAttribute(
                  "title",
                  `Room: ${room}
Status: ${status}
${info.event.start?.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${info.event.end?.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                )
              }}
            />
          )}
        </div>

        <div className="flex gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-600" />
            Confirmed
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-500" />
            Pending
          </div>
        </div>
      </div>
    </div>
  )
}
