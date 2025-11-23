import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:opacity-90 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/50">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <span>PDF Redesign AI</span>
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">
                        How it works
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        GitHub
                    </Link>
                </nav>
            </div>
        </header>
    );
}
