import { PdfPageCard } from "./pdf-page-card";
import { ResultCard } from "./result-card";
import type { Dictionary } from "@/types/dictionary";

interface ComparisonViewProps {
    previewImages: string[];
    generatedImages: string[];
    pagePrompts: Record<number, string>;
    setPagePrompts: (prompts: Record<number, string>) => void;
    pageReferenceImages: Record<number, File | null>;
    setPageReferenceImages: (images: Record<number, File | null>) => void;
    onDownload: (imageUrl: string, index: number) => void;
    onView: (imageUrl: string) => void;
    isGenerating: boolean;
    isLoadingPreview: boolean;
    progress: { current: number; total: number } | null;
    dict: Dictionary;
}

export function ComparisonView({
    previewImages,
    generatedImages,
    pagePrompts,
    setPagePrompts,
    pageReferenceImages,
    setPageReferenceImages,
    onDownload,
    onView,
    isGenerating,
    isLoadingPreview,
    progress,
    dict
}: ComparisonViewProps) {
    // Show loading state when preview is being generated
    if (isLoadingPreview) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-zinc-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-700">{dict.common.loading_preview || "Loading preview..."}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (previewImages.length === 0) return null;

    const handlePromptChange = (index: number, value: string) => {
        setPagePrompts({ ...pagePrompts, [index]: value });
    };

    const handleImageSelect = (index: number, file: File) => {
        setPageReferenceImages({ ...pageReferenceImages, [index]: file });
    };

    const removeImage = (index: number) => {
        const newImages = { ...pageReferenceImages };
        delete newImages[index];
        setPageReferenceImages(newImages);
    };

    return (
        <div className="space-y-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">{dict.common.preview_customization}</h2>
                    <div className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                        {previewImages.length} {dict.common.pages}
                    </div>
                </div>
                {generatedImages.length > 0 && (
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-zinc-900">{dict.common.generated_results}</h2>
                        <div className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                            {generatedImages.length} {dict.common.generated}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {previewImages.map((previewImg, idx) => (
                    <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                        {/* Left: Preview */}
                        <PdfPageCard
                            image={previewImg}
                            index={idx}
                            prompt={pagePrompts[idx] || ""}
                            onPromptChange={(val) => handlePromptChange(idx, val)}
                            referenceImage={pageReferenceImages[idx] || null}
                            onReferenceImageSelect={(file) => handleImageSelect(idx, file)}
                            onReferenceImageRemove={() => removeImage(idx)}
                            dict={dict}
                        />

                        {/* Right: Result (if available) or Loading */}
                        {generatedImages[idx] ? (
                            <ResultCard
                                image={generatedImages[idx]}
                                index={idx}
                                onDownload={onDownload}
                                onView={onView}
                                dict={dict}
                            />
                        ) : isGenerating && progress && idx === progress.current ? (
                            <div className="hidden lg:flex border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 items-center justify-center min-h-[300px]">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-zinc-700">{dict.common.generating || "Generating..."}</p>
                                        <p className="text-xs text-zinc-500 mt-1">Page {idx + 1} / {progress.total}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:block border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50 min-h-[300px]" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
