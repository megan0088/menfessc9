import { Message } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return "baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={multiline ? "flex flex-col gap-1" : "flex items-baseline gap-0 min-w-0"}>
      <span className="text-xs font-semibold text-muted-foreground shrink-0 w-12">
        {label}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 mr-2">:</span>
      {multiline ? (
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-14"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {value}
        </p>
      ) : (
        <span className="text-sm font-medium text-foreground truncate">{value}</span>
      )}
    </div>
  )
}

export function MessageCard({ message }: { message: Message }) {
  return (
    <Card className="gap-0 transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      <CardContent className="pt-4 pb-3 flex flex-col gap-2">
        <Row label="Dari" value={message.dari} />
        <Row label="Untuk" value={message.untuk} />
        <div className="h-px bg-border/50 my-1" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">Pesan :</span>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-0"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {message.pesan}
          </p>
        </div>
      </CardContent>

      <CardFooter className="py-2.5 justify-end">
        <span className="text-xs text-muted-foreground/50 tabular-nums">
          {timeAgo(message.created_at)}
        </span>
      </CardFooter>
    </Card>
  )
}
