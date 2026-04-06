"use client"

import { useEffect, useRef, useState } from "react"
import { Message, MessagesByDate } from "@/types"
import { MessageCard } from "./MessageCard"
import { ChevronLeft, ChevronRight, PenLine } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function groupByDate(messages: Message[]): MessagesByDate[] {
  const groups: Record<string, Message[]> = {}
  const todayStr = new Date().toISOString().split("T")[0]

  // Selalu sertakan hari ini meski kosong
  groups[todayStr] = []

  for (const msg of messages) {
    const key = new Date(msg.created_at).toISOString().split("T")[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, msgs]) => ({
      date,
      label: formatDateLabel(date),
      messages: msgs,
    }))
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const todayStr = new Date().toISOString().split("T")[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  if (dateStr === todayStr) return "Hari ini"
  if (dateStr === yesterdayStr) return "Kemarin"

  return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
}

function SkeletonCard() {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden animate-pulse">
      <div className="px-4 pt-4 pb-3 flex gap-3 items-center">
        <div className="size-9 rounded-full bg-muted shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 w-40 bg-muted rounded-full" />
          <div className="h-3 w-full bg-muted rounded-full" />
          <div className="h-3 w-3/4 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function MessageFeed() {
  const [groups, setGroups] = useState<MessagesByDate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [slideDir, setSlideDir] = useState<"left" | "right">("left")
  const touchStartX = useRef(0)
  const pillsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/pesan")
      .then((r) => r.json())
      .then((data: Message[]) => {
        setGroups(groupByDate(data))
        setLoading(false)
      })
  }, [])

  function navigate(newIndex: number) {
    if (newIndex === currentIndex) return
    setSlideDir(newIndex > currentIndex ? "left" : "right")
    setCurrentIndex(newIndex)
    setAnimKey((k) => k + 1)

    // Scroll pill ke tengah
    setTimeout(() => {
      const pill = pillsRef.current?.children[newIndex] as HTMLElement
      pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }, 0)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return
    if (diff > 0) navigate(Math.min(currentIndex + 1, groups.length - 1))
    else navigate(Math.max(currentIndex - 1, 0))
  }

  const isToday = currentIndex === 0
  const currentGroup = groups[currentIndex]

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Day Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(currentIndex + 1)}
          disabled={currentIndex >= groups.length - 1}
          className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
          aria-label="Hari sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Day Pills */}
        <div
          ref={pillsRef}
          className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5"
        >
          {groups.map((g, i) => (
            <button
              key={g.date}
              onClick={() => navigate(i)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150",
                i === currentIndex
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate(currentIndex - 1)}
          disabled={currentIndex <= 0}
          className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
          aria-label="Hari berikutnya"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div
        key={animKey}
        className={cn(
          "flex flex-col gap-3",
          slideDir === "left" ? "slide-from-right" : "slide-from-left"
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* CTA tulis pesan — hanya di hari ini */}
        {isToday && (
          <Link
            href="/kirim"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center gap-2 border-dashed h-10 text-muted-foreground hover:text-foreground"
            )}
          >
            <PenLine size={14} />
            Tulis pesan untuk hari ini
          </Link>
        )}

        {/* Pesan */}
        {currentGroup?.messages.length > 0 ? (
          currentGroup.messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            {isToday ? (
              <>
                <span className="text-3xl select-none">✉️</span>
                <p className="text-sm font-medium text-foreground/70">Belum ada pesan hari ini</p>
                <p className="text-xs text-muted-foreground">Jadilah yang pertama!</p>
              </>
            ) : (
              <>
                <span className="text-3xl select-none">📭</span>
                <p className="text-sm text-muted-foreground">Tidak ada pesan pada hari ini</p>
              </>
            )}
          </div>
        )}

        {/* Notif hari lampau */}
        {!isToday && (
          <p className="text-center text-xs text-muted-foreground/40 pt-2">
            Pesan hanya bisa dikirim untuk hari ini
          </p>
        )}
      </div>

    </div>
  )
}
