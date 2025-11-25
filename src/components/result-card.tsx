import { Download, Maximize2 } from "lucide-react";
import type { Dictionary } from "@/types/dictionary";

interface ResultCardProps {
    image: string;
    index: number;
    onDownload: (imageUrl: string, index: number) => void;
    onView: (imageUrl: string) => void;
    dict: Dictionary;
}

export function ResultCard({ image, index, onDownload, onView, dict }: ResultCardProps) {
    return (
        <div className="h-full flex flex-col space-y-4 p-4 rounded-2xl bg-white/50 border border-zinc-100 hover:border-zinc-200 transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                    {dict.common.result} {index + 1}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => onView(image)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                        title={dict.common.view_full_screen}
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDownload(image, index)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                        title={dict.common.download_png}
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative flex-1 rounded-xl overflow-hidden border border-zinc-200 bg-white group">
                <img
                    src={image}
                    alt={`${dict.common.generated} page ${index + 1}`}
                    className="w-full h-full object-contain bg-zinc-50"
                />
            </div>
        </div>
    );
}
