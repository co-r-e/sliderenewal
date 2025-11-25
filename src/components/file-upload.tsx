"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { Dictionary } from "@/types/dictionary";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
    dict: Dictionary;
}

export function FileUpload({ onFileSelect, selectedFile, onClear, dict }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type === "application/pdf") {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    return (
        <div className="w-full max-w-xl mx-auto">
            {!selectedFile ? (
                <div key="upload-zone">
                    <label
                        htmlFor="file-upload"
                        className={`relative flex flex-col items-start justify-center w-full h-32 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group px-6 ${isDragging
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-zinc-200 bg-white hover:border-primary/50 hover:bg-zinc-50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex items-center gap-4 z-10">
                            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isDragging ? "bg-primary/20 text-primary" : "bg-zinc-100 text-zinc-400 group-hover:scale-110 group-hover:text-primary"
                                }`}>
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-zinc-700">
                                    {dict.common.drop_pdf}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {dict.common.browse_pdf}
                                </p>
                            </div>
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileInput}
                        />
                    </label>
                </div>
            ) : (
                <div
                    key="file-selected"
                    className="relative w-full p-6 rounded-3xl border border-zinc-200 bg-white overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                                    {selectedFile.name}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClear}
                                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

