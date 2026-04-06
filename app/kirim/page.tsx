import { KirimForm } from "@/components/KirimForm"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function KirimPage() {
  return (
    <div className="max-w-md mx-auto flex flex-col gap-8">

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 self-start text-muted-foreground")}
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Kirim Pesan</h1>
        <p className="text-sm text-muted-foreground">
          Pesanmu akan muncul di papan dan hilang otomatis setelah 7 hari.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card px-6 py-7 shadow-sm">
        <KirimForm />
      </div>

    </div>
  )
}
