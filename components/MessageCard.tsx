"use client"

import { useEffect, useState } from "react"
import { Message } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return "baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

export function MessageCard({ message }: { message: Message }) {
  const [likes, setLikes] = useState(message.likes ?? 0)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const stored: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
    setLiked(stored.includes(message.id))
  }, [message.id])

  async function handleLike() {
    if (liked) return

    // Optimistic update
    setLikes((n) => n + 1)
    setLiked(true)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)

    // Simpan ke localStorage
    const stored: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
    localStorage.setItem("liked_messages", JSON.stringify([...stored, message.id]))

    // Kirim ke API
    const res = await fetch(`/api/pesan/${message.id}/like`, { method: "PATCH" })
    if (!res.ok) {
      // Rollback jika gagal
      setLikes((n) => n - 1)
      setLiked(false)
      const rollback: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
      localStorage.setItem("liked_messages", JSON.stringify(rollback.filter((id) => id !== message.id)))
    }
  }

  return (
    <Card className="gap-0 transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      <CardContent className="pt-4 pb-3 flex flex-col gap-2">

        {/* Dari */}
        <div className="flex items-baseline gap-0 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Dari</span>
          <span className="text-xs text-muted-foreground shrink-0 mr-2">:</span>
          <span className="text-sm font-medium text-foreground truncate">{message.dari}</span>
        </div>

        {/* Untuk */}
        <div className="flex items-baseline gap-0 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Untuk</span>
          <span className="text-xs text-muted-foreground shrink-0 mr-2">:</span>
          <span className="text-sm font-medium text-foreground truncate">{message.untuk}</span>
        </div>

        <div className="h-px bg-border/50 my-1" />

        {/* Pesan */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">Pesan :</span>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {message.pesan}
          </p>
        </div>

        {/* Gambar */}
        {message.image_url && (
          <div className="mt-1 rounded-lg overflow-hidden border border-border/40">
            <img
              src={message.image_url}
              alt="Lampiran"
              className="w-full max-h-72 object-cover"
            />
          </div>
        )}


      </CardContent>

      <CardFooter className="py-2.5 justify-between">
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liked}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-all duration-150",
            liked
              ? "text-rose-500 cursor-default"
              : "text-muted-foreground/50 hover:text-rose-400"
          )}
        >
          <Heart
            size={13}
            className={cn("transition-transform duration-200", animating && "scale-150")}
            fill={liked ? "currentColor" : "none"}
          />
          <span className="tabular-nums">{likes > 0 ? likes : ""}</span>
        </button>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground/50 tabular-nums">
          {timeAgo(message.created_at)}
        </span>
      </CardFooter>
    </Card>
  )
}
