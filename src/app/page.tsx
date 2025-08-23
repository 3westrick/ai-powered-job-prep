import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SignInButton, UserButton } from "@clerk/nextjs"

export default function HomePage() {
    return (
        <div>
            <SignInButton />
            <UserButton />
            <ThemeToggle />
        </div>
    )
}
