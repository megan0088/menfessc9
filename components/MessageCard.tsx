"use client"

import { useEffect, useState } from "react"
import { Message } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, X } from "lucide-react"
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

// ── Reply Form ────────────────────────────────────────────────────
function ReplyForm({
  parentId,
  replyTo,
  onSubmit,
  onCancel,
}: {
  parentId: string
  replyTo: string
  onSubmit: (reply: Message) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ dari: "", pesan: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/pesan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dari: form.dari,
        untuk: replyTo,
        pesan: form.pesan,
        parent_id: parentId,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Terjadi kesalahan")
      setLoading(false)
      return
    }

    onSubmit({ ...data, replies: [] })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ml-4 pl-3 border-l-2 border-border/50 flex flex-col gap-2.5"
    >
      <p className="text-xs text-muted-foreground">
        Membalas <span className="font-semibold text-foreground">{replyTo}</span>
      </p>
      <Input
        placeholder="Namamu"
        value={form.dari}
        onChange={(e) => setForm({ ...form, dari: e.target.value })}
        maxLength={50}
        required
      />
      <Textarea
        placeholder="Tulis balasanmu..."
        value={form.pesan}
        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
        maxLength={500}
        rows={3}
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} className="flex-1">
          {loading ? "Mengirim..." : "Kirim Balasan"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={14} />
        </Button>
      </div>
    </form>
  )
}

// ── Reply Card ────────────────────────────────────────────────────
function ReplyCard({ reply }: { reply: Message }) {
  return (
    <div className="rounded-lg bg-muted/40 ring-1 ring-foreground/5 px-3.5 py-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="font-semibold text-foreground/80 truncate">{reply.dari}</span>
          <span className="text-muted-foreground/40 shrink-0">→</span>
          <span className="font-semibold text-foreground truncate">{reply.untuk}</span>
        </div>
        <span className="text-xs text-muted-foreground/40 shrink-0 tabular-nums">
          {timeAgo(reply.created_at)}
        </span>
      </div>
      <p
        className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {reply.pesan}
      </p>
    </div>
  )
}

// ── Message Card ──────────────────────────────────────────────────
export function MessageCard({ message }: { message: Message }) {
  const [likes, setLikes] = useState(message.likes ?? 0)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies, setReplies] = useState<Message[]>(message.replies ?? [])

  useEffect(() => {
    const stored: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
    setLiked(stored.includes(message.id))
  }, [message.id])

  async function handleLike() {
    if (liked) return
    setLikes((n) => n + 1)
    setLiked(true)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)

    const stored: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
    localStorage.setItem("liked_messages", JSON.stringify([...stored, message.id]))

    const res = await fetch(`/api/pesan/${message.id}/like`, { method: "PATCH" })
    if (!res.ok) {
      setLikes((n) => n - 1)
      setLiked(false)
      const rollback: string[] = JSON.parse(localStorage.getItem("liked_messages") ?? "[]")
      localStorage.setItem("liked_messages", JSON.stringify(rollback.filter((id) => id !== message.id)))
    }
  }

  function handleReplyAdded(reply: Message) {
    setReplies((prev) => [...prev, reply])
    setShowReplyForm(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Card utama */}
      <Card className="gap-0 transition-all duration-200 hover:shadow-md hover:-translate-y-px">
        <CardContent className="pt-4 pb-3 flex flex-col gap-2">

          <div className="flex items-baseline gap-0 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Dari</span>
            <span className="text-xs text-muted-foreground shrink-0 mr-2">:</span>
            <span className="text-sm font-medium text-foreground truncate">{message.dari}</span>
          </div>

          <div className="flex items-baseline gap-0 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Untuk</span>
            <span className="text-xs text-muted-foreground shrink-0 mr-2">:</span>
            <span className="text-sm font-medium text-foreground truncate">{message.untuk}</span>
          </div>

          <div className="h-px bg-border/50 my-1" />

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Pesan :</span>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {message.pesan}
            </p>
          </div>

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
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={liked}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-all duration-150",
                liked ? "text-rose-500 cursor-default" : "text-muted-foreground/50 hover:text-rose-400"
              )}
            >
              <Heart
                size={13}
                className={cn("transition-transform duration-200", animating && "scale-150")}
                fill={liked ? "currentColor" : "none"}
              />
              <span className="tabular-nums">{likes > 0 ? likes : ""}</span>
            </button>

            {/* Reply */}
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                showReplyForm
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-foreground"
              )}
            >
              <MessageCircle size={13} />
              <span className="tabular-nums">{replies.length > 0 ? replies.length : "Balas"}</span>
            </button>
          </div>

          <span className="text-xs text-muted-foreground/50 tabular-nums">
            {timeAgo(message.created_at)}
          </span>
        </CardFooter>
      </Card>

      {/* Reply form */}
      {showReplyForm && (
        <ReplyForm
          parentId={message.id}
          replyTo={message.dari}
          onSubmit={handleReplyAdded}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-4 pl-3 border-l-2 border-border/40 flex flex-col gap-2">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  )
}
