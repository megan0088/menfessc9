"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function KirimForm() {
  const router = useRouter()
  const [form, setForm] = useState({ dari: "", untuk: "", pesan: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const remaining = 2000 - form.pesan.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/pesan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Terjadi kesalahan")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Dari */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Dari
        </label>
        <Input
          placeholder="Namamu atau &quot;Anonim&quot;"
          value={form.dari}
          onChange={(e) => setForm({ ...form, dari: e.target.value })}
          maxLength={50}
          required
        />
      </div>

      {/* Untuk */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Untuk
        </label>
        <Input
          placeholder="Nama penerima"
          value={form.untuk}
          onChange={(e) => setForm({ ...form, untuk: e.target.value })}
          maxLength={50}
          required
        />
      </div>

      {/* Pesan */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Pesan
          </label>
          <span className={`text-xs tabular-nums ${remaining < 100 ? "text-destructive font-medium" : "text-muted-foreground/50"}`}>
            {remaining}
          </span>
        </div>
        <Textarea
          placeholder="Tulis pesanmu di sini..."
          value={form.pesan}
          onChange={(e) => setForm({ ...form, pesan: e.target.value })}
          maxLength={2000}
          rows={6}
          required
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="text-xs text-destructive font-medium">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Mengirim..." : "Kirim Pesan"}
      </Button>
    </form>
  )
}
