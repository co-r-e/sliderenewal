import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PDF Redesign AI",
    description: "Redesign your PDF documents with AI while preserving content.",
};

export async function generateStaticParams() {
    return [{ lang: "en" }, { lang: "ja" }];
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <html lang={lang}>
            <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}>
                {children}
            </body>
        </html>
    );
}
