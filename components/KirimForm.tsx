"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { ImagePlus, X } from "lucide-react"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function KirimForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ dari: "", untuk: "", pesan: "" })
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const remaining = 2000 - form.pesan.length

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran gambar maksimal 5MB")
      return
    }

    setError("")
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    let image_url: string | null = null

    // Upload gambar ke Supabase Storage jika ada
    if (image) {
      const ext = image.name.split(".").pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("message-images")
        .upload(filename, image)

      if (uploadError) {
        setError("Gagal mengupload gambar: " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from("message-images")
        .getPublicUrl(uploadData.path)

      image_url = urlData.publicUrl
    }

    const res = await fetch("/api/pesan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image_url }),
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

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Gambar <span className="normal-case font-normal">(opsional, maks 5MB)</span>
        </label>

        {preview ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-border/60">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-60 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full h-24 rounded-xl border border-dashed border-border/60 hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all text-sm"
          >
            <ImagePlus size={18} />
            Tambah gambar
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
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
