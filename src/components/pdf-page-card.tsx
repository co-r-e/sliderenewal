import { ImageIcon, X } from "lucide-react";

interface PdfPageCardProps {
    image: string;
    index: number;
    prompt: string;
    onPromptChange: (value: string) => void;
    referenceImage: File | null;
    onReferenceImageSelect: (file: File) => void;
    onReferenceImageRemove: () => void;
    dict: any;
}

export function PdfPageCard({
    image,
    index,
    prompt,
    onPromptChange,
    referenceImage,
    onReferenceImageSelect,
    onReferenceImageRemove,
    dict
}: PdfPageCardProps) {
    return (
        <div className="flex gap-6 items-start p-4 rounded-2xl bg-white/50 border border-zinc-100 hover:border-zinc-200 transition-colors">
            {/* Preview Image */}
            <div className="relative w-1/3 rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm shrink-0">
                <img
                    src={image}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto"
                />
            </div>

            {/* Per-Page Controls */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                        {dict.common.page} {index + 1}
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {dict.common.additional_prompt}
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder={dict.common.specific_instructions}
                        className="w-full min-h-[80px] p-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all shadow-sm text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {dict.common.reference_image}
                    </label>
                    {!referenceImage ? (
                        <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors h-[42px] shadow-sm w-full group">
                            <div className="p-1.5 rounded-lg bg-zinc-50 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-zinc-600 truncate">{dict.common.upload_reference}</div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onReferenceImageSelect(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative flex items-center gap-3 p-2.5 rounded-xl bg-white border border-primary/20 h-[42px] shadow-sm w-full">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100">
                                <img
                                    src={URL.createObjectURL(referenceImage)}
                                    alt="Reference"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-zinc-900 truncate">
                                    {referenceImage.name}
                                </div>
                            </div>
                            <button
                                onClick={onReferenceImageRemove}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
