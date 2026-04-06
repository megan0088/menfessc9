import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .gt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { dari, untuk, pesan } = body

  if (!dari?.trim() || !untuk?.trim() || !pesan?.trim()) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
  }

  if (pesan.length > 2000) {
    return NextResponse.json({ error: "Pesan maksimal 2000 karakter" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ dari: dari.trim(), untuk: untuk.trim(), pesan: pesan.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
