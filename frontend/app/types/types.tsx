export type TokenPayload = {
  email: string
  role: string
  user_id: string
}
export type Room = {
  id: number
  room_name: string
  size: number
  price: number
  status: "available" | "reserved" | "booked"
}

export type UserInfo = {
  id: number
  email: string
  wallet: number
}

type Bookingadmin = {
  booking_id: number
  user_email: string
  room_id: number
  room_name: string
  start_time: string
  end_time: string
  status: string
}

export type AdminDashboardData = {
  admin: UserInfo

  stats: {
    users: number
    rooms: number
    bookings: number
    pending: number
    confirmed: number
    rejected: number
  }

  latest_bookings: Bookingadmin[]
}

export type Booking = {
  id: number
  room_id: number
  room_name: string  
  start_time: string
  end_time: string
  status: string
}

type User = {
  email: string
  wallet: number
}


type Stats = {
  total_bookings: number
  pending: number
  confirmed: number
}

export type DashboardData = {
  user: User
  stats: Stats
  bookings: Booking[]
}