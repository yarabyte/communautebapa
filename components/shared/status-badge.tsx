import { Badge } from "@/components/ui/badge"
import { businessStatusLabels, contributionStatusLabels, memberStatusLabels } from "@/lib/labels"
import type { BusinessStatus, ContributionStatus, MemberStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const styles: Record<ContributionStatus | MemberStatus | BusinessStatus, string> = {
  COMPLETED: "bg-olive/15 text-olive",
  ACTIVE: "bg-olive/15 text-olive",
  PENDING: "bg-or/20 text-or-dark",
  FAILED: "bg-destructive/10 text-destructive",
  REJECTED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
  SUSPENDED: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-olive/15 text-olive",
  DRAFT: "bg-muted text-muted-foreground",
}

export function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  return <Badge className={cn("font-medium", styles[status])}>{contributionStatusLabels[status]}</Badge>
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <Badge className={cn("font-medium", styles[status])}>{memberStatusLabels[status]}</Badge>
}

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  return <Badge className={cn("font-medium", styles[status])}>{businessStatusLabels[status]}</Badge>
}
