import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PLAN_LIMIT = "PLAN_LIMIT"
const RATE_LIMIT = "RATE_LIMIT"

export default function errorToast(message: string) {
    if (message === PLAN_LIMIT) {
        const toastId = toast.error("You have reached your plan limit", {
            action: (
                <Button onClick={() => toast.dismiss(toastId)}>
                    <Link href="/app/billing">Upgrade</Link>
                </Button>
            ),
        })
        return
    }
    if (message === RATE_LIMIT) {
        toast.error("Woah! Slow down.", {
            description: "You are making too many requests.",
        })
        return
    }
    toast.error(message)
}
