
import { PdfPageCard } from "./pdf-page-card";

interface PdfPreviewProps {
    images: string[];
    pagePrompts: Record<number, string>;
    setPagePrompts: (prompts: Record<number, string>) => void;
    pageReferenceImages: Record<number, File | null>;
    setPageReferenceImages: (images: Record<number, File | null>) => void;
    dict: any;
}

export function PdfPreview({
    images,
    pagePrompts,
    setPagePrompts,
    pageReferenceImages,
    setPageReferenceImages,
    dict
}: PdfPreviewProps) {
    if (images.length === 0) return null;

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
        <div className="space-y-6 w-full max-w-3xl">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-semibold text-zinc-900">{dict.common.preview_customization}</h2>
                <div className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                    {images.length} {dict.common.pages}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mr-auto">
                {images.map((img, idx) => (
                    <PdfPageCard
                        key={idx}
                        image={img}
                        index={idx}
                        prompt={pagePrompts[idx] || ""}
                        onPromptChange={(val) => handlePromptChange(idx, val)}
                        referenceImage={pageReferenceImages[idx] || null}
                        onReferenceImageSelect={(file) => handleImageSelect(idx, file)}
                        onReferenceImageRemove={() => removeImage(idx)}
                        dict={dict}
                    />
                ))}
            </div>
        </div>
    );
}
