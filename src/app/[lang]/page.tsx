import { getDictionary } from "@/dictionaries/dictionary";
import HomePage from "@/components/home-page";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "ja" }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <HomePage dict={dict} />;
}
