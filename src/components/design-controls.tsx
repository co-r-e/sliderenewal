import { Sparkles, Image as ImageIcon, X, Ratio, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DesignControlsProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    disabled: boolean;
    progress?: { current: number; total: number } | null;
    referenceImage: File | null;
    setReferenceImage: (file: File | null) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    dict: any;
}

export function DesignControls({
    prompt,
    setPrompt,
    isGenerating,
    onGenerate,
    disabled,
    progress,
    referenceImage,
    setReferenceImage,
    aspectRatio,
    setAspectRatio,
    dict,
}: DesignControlsProps) {
    const [isHintOpen, setIsHintOpen] = useState(false);
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (hintRef.current && !hintRef.current.contains(event.target as Node)) {
                setIsHintOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReferenceImage(file);
        }
    };

    const aspectRatios = [
        { id: "original", label: dict.ratios.original },
        { id: "16:9", label: dict.ratios.widescreen },
        { id: "4:3", label: dict.ratios.standard },
        { id: "1:1", label: dict.ratios.square },
        { id: "9:16", label: dict.ratios.portrait },
    ];

    const suggestedPrompts = [
        dict.prompts.comic,
        dict.prompts.minimalist,
        dict.prompts.dark_mode,
        dict.prompts.corporate
    ];

    return (
        <div className="w-full space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="prompt" className="text-sm font-medium text-zinc-700 ml-1">
                        {dict.common.design_instructions}
                    </label>
                    <div className="relative" ref={hintRef}>
                        <button
                            onClick={() => setIsHintOpen(!isHintOpen)}
                            className="text-zinc-400 hover:text-primary transition-colors p-1"
                            title={dict.common.show_suggestions}
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>

                        {isHintOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl bg-white border border-zinc-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="text-xs font-semibold text-zinc-900 mb-2">{dict.common.suggested_prompts}</h4>
                                <div className="space-y-2">
                                    {suggestedPrompts.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setPrompt(suggestion);
                                                setIsHintOpen(false);
                                            }}
                                            className="w-full text-left text-[11px] p-2 rounded-lg hover:bg-zinc-50 text-zinc-600 hover:text-primary transition-colors border border-transparent hover:border-zinc-100 leading-relaxed"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={dict.common.prompt_placeholder}
                        className="w-full min-h-[100px] p-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all text-sm"
                        disabled={isGenerating}
                    />
                    <div className="absolute bottom-2 right-2">
                        <div className="text-[10px] text-zinc-400 font-medium">
                            {prompt.length} chars
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 ml-1">
                        {dict.common.reference_image}
                    </label>
                    {!referenceImage ? (
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors h-[48px]">
                            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-zinc-700 truncate">{dict.common.upload_image}</div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                                disabled={isGenerating}
                            />
                        </label>
                    ) : (
                        <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white border border-primary/50 h-[48px]">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
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
                                onClick={() => setReferenceImage(null)}
                                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                disabled={isGenerating}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 ml-1">
                        {dict.common.aspect_ratio}
                    </label>
                    <div className="relative">
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            disabled={isGenerating}
                            className="w-full appearance-none p-3 pl-10 rounded-xl bg-white border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all h-[48px] text-sm"
                        >
                            {aspectRatios.map((ratio) => (
                                <option key={ratio.id} value={ratio.id} className="bg-white text-zinc-900">
                                    {ratio.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-100 text-zinc-500 pointer-events-none">
                            <Ratio className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={disabled || !prompt.trim() || isGenerating}
                className={`group relative w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-semibold text-white transition-all duration-300 ${disabled || !prompt.trim() || isGenerating
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:-translate-y-0.5"
                    }`}
            >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>
                            {progress
                                ? dict.common.processing_page.replace("{current}", (progress.current + 1).toString()).replace("{total}", progress.total.toString())
                                : dict.common.redesigning}
                        </span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>{dict.common.generate_redesign}</span>
                    </>
                )}
            </button>
        </div>
    );
}
