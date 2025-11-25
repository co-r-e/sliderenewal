"use client";

import { useState, useEffect, useRef } from "react";
import { ComparisonView } from "@/components/comparison-view";
import { Sidebar } from "@/components/sidebar";
import { Package, X } from "lucide-react";
import JSZip from "jszip";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/types/dictionary";

export default function HomePage({ dict }: { dict: Dictionary }) {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState("original");
    const [pagePrompts, setPagePrompts] = useState<Record<number, string>>({});
    const [pageReferenceImages, setPageReferenceImages] = useState<Record<number, File | null>>({});

    // Modal & Download State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isZipping, setIsZipping] = useState(false);

    // Abort Controller for stopping generation
    const abortControllerRef = useRef<AbortController | null>(null);

    // Handle file selection and generate preview
    useEffect(() => {
        const generatePreview = async () => {
            if (file) {
                setIsLoadingPreview(true);
                try {
                    const images = await import("@/lib/pdf-converter").then(mod => mod.convertPdfToImages(file));
                    setPreviewImages(images);
                } catch (error) {
                    console.error("Failed to generate preview:", error);
                    setPreviewImages([]);
                } finally {
                    setIsLoadingPreview(false);
                }
            } else {
                setPreviewImages([]);
                setIsLoadingPreview(false);
            }
        };

        generatePreview();
    }, [file]);

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const handleGenerate = async () => {
        if (!file || !prompt) return;

        // Create new AbortController for this generation
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsGenerating(true);
        setGeneratedImages([]);
        setProgress(null);

        try {
            // Use existing preview images if available, otherwise convert again (redundant but safe)
            const images = previewImages.length > 0
                ? previewImages
                : await import("@/lib/pdf-converter").then(mod => mod.convertPdfToImages(file));

            // Convert reference image to base64 if exists
            let referenceImageBase64 = null;
            if (referenceImage) {
                referenceImageBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(referenceImage);
                });
            }

            setProgress({ current: 0, total: images.length });

            // Store the result of the previous page to maintain consistency
            let previousGeneratedImage: string | null = null;

            // 2. Process each page sequentially
            const results = [];
            for (let i = 0; i < images.length; i++) {
                // Check if generation was stopped
                if (signal.aborted) {
                    break;
                }

                const image = images[i];

                // Prepare prompt: Page Specific (Highest Priority) + Global + Consistency
                const pagePrompt = pagePrompts[i] || "";
                let finalPrompt = "";

                // 1. Page Specific Prompt (Most Important)
                if (pagePrompt) {
                    finalPrompt += `IMPORTANT - SPECIFIC INSTRUCTION FOR THIS PAGE: ${pagePrompt}\n\n`;
                }

                // 2. Global Prompt
                finalPrompt += `General Design Instruction: ${prompt}`;

                // 3. Consistency Instruction
                if (previousGeneratedImage) {
                    finalPrompt += `\n\nRefer to the provided reference image (the previous page's design) and maintain consistent tone & manner: color scheme, object styles, and overall visual identity. However, DO NOT copy the layout or structure from the previous page. Instead, create the most optimal layout and visual expression tailored to THIS page's text content. Adapt the design to best communicate the specific information on this slide while preserving the cohesive look and feel.`;
                }

                // Prepare reference images: Global + Page Specific + Previous Generated Image
                const referenceImages = [];

                // Add global reference image if exists
                if (referenceImageBase64) {
                    referenceImages.push(referenceImageBase64);
                }

                // Add page specific reference image if exists
                const pageRefImage = pageReferenceImages[i];
                if (pageRefImage) {
                    const pageRefImageBase64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(pageRefImage);
                    });
                    referenceImages.push(pageRefImageBase64);
                }

                // Add previous generated image as reference for consistency
                if (previousGeneratedImage) {
                    referenceImages.push(previousGeneratedImage);
                }

                const res = await fetch("/api/redesign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image,
                        prompt: finalPrompt,
                        referenceImages,
                        aspectRatio
                    }),
                    signal,
                });

                if (!res.ok) throw new Error(`Failed to generate design for page ${i + 1}`);

                const data = await res.json() as { result?: string };
                if (data.result) {
                    const resultImage = data.result;
                    results.push(resultImage);
                    setGeneratedImages(prev => [...prev, resultImage]);

                    // Update previous image for the next iteration
                    previousGeneratedImage = resultImage;
                }

                setProgress({ current: i + 1, total: images.length });
            }
        } catch (error) {
            // Don't show error if generation was stopped by user
            if (error instanceof Error && error.name === "AbortError") {
                console.log("Generation stopped by user");
            } else {
                console.error("Generation failed:", error);
                alert(dict.errors.failed_generate);
            }
        } finally {
            setIsGenerating(false);
            setProgress(null);
            abortControllerRef.current = null;
        }
    };

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `redesigned-page-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkDownload = async () => {
        if (generatedImages.length === 0) return;
        setIsZipping(true);
        try {
            const zip = new JSZip();
            generatedImages.forEach((img, idx) => {
                const data = img.split(",")[1];
                zip.file(`redesigned-page-${idx + 1}.png`, data, { base64: true });
            });
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = "redesigned-pages.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to zip images:", error);
            alert(dict.errors.failed_create_zip);
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar
                selectedFile={file}
                onFileSelect={setFile}
                onClear={() => {
                    setFile(null);
                    setPreviewImages([]);
                    setGeneratedImages([]);
                    setPagePrompts({});
                    setPageReferenceImages({});
                }}
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                onStop={handleStop}
                referenceImage={referenceImage}
                setReferenceImage={setReferenceImage}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                dict={dict}
            />

            <main className="relative flex-1 flex flex-col ml-96 pb-20">
                <div className="absolute inset-0 -z-10 h-full w-full bg-gray-50"></div>

                <div className="container mx-auto px-8 mt-8 md:mt-12 max-w-[1600px] space-y-8">
                    {/* Header Actions */}
                    {generatedImages.length > 1 && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleBulkDownload}
                                disabled={isZipping}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isZipping ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Package className="w-4 h-4" />
                                )}
                                {dict.common.download_all_zip}
                            </button>
                        </div>
                    )}

                    <ComparisonView
                        previewImages={previewImages}
                        generatedImages={generatedImages}
                        pagePrompts={pagePrompts}
                        setPagePrompts={setPagePrompts}
                        pageReferenceImages={pageReferenceImages}
                        setPageReferenceImages={setPageReferenceImages}
                        onDownload={handleDownload}
                        onView={setSelectedImage}
                        isGenerating={isGenerating}
                        isLoadingPreview={isLoadingPreview}
                        progress={progress}
                        dict={dict}
                    />
                </div>
            </main>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={selectedImage}
                            alt={dict.common.view_full_screen}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
