export type Message = {
  id: string
  dari: string
  untuk: string
  pesan: string
  likes: number
  image_url: string | null
  parent_id: string | null
  created_at: string
  replies?: Message[]
}

export type MessagesByDate = {
  date: string
  label: string
  messages: Message[]
}
