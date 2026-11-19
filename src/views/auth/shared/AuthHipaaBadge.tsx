import Link from 'next/link'
import { ChevronRight, ShieldCheck } from 'lucide-react'

export const AuthHipaaBadge = () => {
  return (
    <Link
      href="/explore/security"
      className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-card-sm transition-colors hover:bg-secondary sm:right-6 sm:top-6 desktop:hidden"
    >
      <ShieldCheck className="size-3.5 text-primary" aria-hidden />
      HIPAA Compliant &amp; Secure
      <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
    </Link>
  )
}
