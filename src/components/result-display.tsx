"use client";

import { useState } from "react";
import { Download, Maximize2, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

interface ResultDisplayProps {
    images: string[];
}

export function ResultDisplay({ images }: ResultDisplayProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isZipping, setIsZipping] = useState(false);

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `redesigned-page-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkDownload = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();

            // Add images to zip
            images.forEach((img, idx) => {
                // Remove data:image/jpeg;base64, prefix
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
            alert("Failed to create zip file.");
        } finally {
            setIsZipping(false);
        }
    };

    if (images.length === 0) return null;

    return (
        <>
            <div className="space-y-8 w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-zinc-900">Generated Results</h2>
                    {images.length > 1 && (
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
                            Download All (ZIP)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {images.map((img, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-white group shadow-lg shadow-black/5">
                                <img
                                    src={img}
                                    alt={`Generated page ${idx + 1}`}
                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => handleDownload(img, idx)}
                                        className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform hover:scale-110"
                                        title="Download PNG"
                                    >
                                        <Download className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(img)}
                                        className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform hover:scale-110"
                                        title="View Full Screen"
                                    >
                                        <Maximize2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleDownload(img, idx)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-50 text-sm font-medium text-zinc-700 transition-colors border border-zinc-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
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
                            alt="Full screen preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
