export type Message = {
  id: string
  dari: string
  untuk: string
  pesan: string
  created_at: string
}

export type MessagesByDate = {
  date: string
  label: string
  messages: Message[]
}
