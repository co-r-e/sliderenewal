import { PdfPageCard } from "./pdf-page-card";
import { ResultCard } from "./result-card";

interface ComparisonViewProps {
    previewImages: string[];
    generatedImages: string[];
    pagePrompts: Record<number, string>;
    setPagePrompts: (prompts: Record<number, string>) => void;
    pageReferenceImages: Record<number, File | null>;
    setPageReferenceImages: (images: Record<number, File | null>) => void;
    onDownload: (imageUrl: string, index: number) => void;
    onView: (imageUrl: string) => void;
    dict: any;
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
    dict
}: ComparisonViewProps) {
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

                        {/* Right: Result (if available) */}
                        {generatedImages[idx] ? (
                            <ResultCard
                                image={generatedImages[idx]}
                                index={idx}
                                onDownload={onDownload}
                                onView={onView}
                                dict={dict}
                            />
                        ) : (
                            <div className="hidden lg:block border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
