import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { DesignControls } from "@/components/design-controls";

interface SidebarProps {
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
    onClear: () => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    onStop: () => void;
    progress: { current: number; total: number } | null;
    referenceImage: File | null;
    setReferenceImage: (file: File | null) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    dict: any;
}

export function Sidebar({
    selectedFile,
    onFileSelect,
    onClear,
    prompt,
    setPrompt,
    isGenerating,
    onGenerate,
    onStop,
    progress,
    referenceImage,
    setReferenceImage,
    aspectRatio,
    setAspectRatio,
    dict
}: SidebarProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // API Key Management
    const [apiKey, setApiKey] = useState("");
    const [isSavingKey, setIsSavingKey] = useState(false);
    const [keySaved, setKeySaved] = useState(false);

    useEffect(() => {
        if (isSettingsOpen) {
            fetch("/api/settings/apikey")
                .then(res => res.json())
                .then(data => {
                    if (data.apiKey) setApiKey(data.apiKey);
                })
                .catch(console.error);
        }
    }, [isSettingsOpen]);

    const handleSaveKey = async () => {
        setIsSavingKey(true);
        try {
            const res = await fetch("/api/settings/apikey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey })
            });
            if (res.ok) {
                setKeySaved(true);
                setTimeout(() => setKeySaved(false), 2000);
            }
        } catch (error) {
            console.error("Failed to save key:", error);
        } finally {
            setIsSavingKey(false);
        }
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-96 flex-col bg-white/95 border-r border-zinc-200 text-zinc-900 backdrop-blur-sm overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                {/* Logo */}
                <div className="flex justify-center pb-4">
                    <img src="/logo.png" alt="Logo" className="w-4/5 h-auto" />
                </div>

                {/* Upload Section */}
                <div className="space-y-2">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{dict.common.upload_pdf}</div>
                    <FileUpload
                        onFileSelect={onFileSelect}
                        selectedFile={selectedFile}
                        onClear={onClear}
                        dict={dict}
                    />
                </div>

                {/* Design Controls */}
                <DesignControls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isGenerating={isGenerating}
                    onGenerate={onGenerate}
                    onStop={onStop}
                    disabled={!selectedFile}
                    progress={progress}
                    referenceImage={referenceImage}
                    setReferenceImage={setReferenceImage}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    dict={dict}
                />
            </div>

            {/* Footer Settings */}
            <div className="p-4 border-t border-zinc-200 bg-white/50">
                <div className="relative">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors w-full px-2 py-2 rounded-lg hover:bg-zinc-100"
                    >
                        <Settings className="h-4 w-4" />
                        {dict.common.settings}
                    </button>

                    {/* Settings Popover */}
                    {isSettingsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsSettingsOpen(false)}
                            />
                            <div className="absolute bottom-full left-0 w-full mb-2 p-2 bg-white rounded-xl border border-zinc-200 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                <div className="space-y-1">
                                    <div className="p-3 space-y-3 border-b border-zinc-100 mb-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            {dict.common.language}
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const newPath = window.location.pathname.replace(/^\/ja/, "") || "/";
                                                    window.location.href = newPath;
                                                }}
                                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${!window.location.pathname.startsWith("/ja")
                                                    ? "bg-zinc-900 text-white"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                                    }`}
                                            >
                                                {dict.common.english}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!window.location.pathname.startsWith("/ja")) {
                                                        const newPath = `/ja${window.location.pathname === "/" ? "" : window.location.pathname}`;
                                                        window.location.href = newPath;
                                                    }
                                                }}
                                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${window.location.pathname.startsWith("/ja")
                                                    ? "bg-zinc-900 text-white"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                                    }`}
                                            >
                                                {dict.common.japanese}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3 space-y-3 border-b border-zinc-100 mb-2">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            {dict.common.api_key}
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder={dict.common.enter_api_key}
                                                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            <button
                                                onClick={handleSaveKey}
                                                disabled={isSavingKey}
                                                className="w-full px-3 py-2 text-xs font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                            >
                                                {isSavingKey ? dict.common.saving : keySaved ? dict.common.saved : dict.common.save}
                                            </button>
                                        </div>
                                    </div>
                                    <a
                                        href="https://co-r-e.net"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                                    >
                                        {dict.common.company_overview}
                                    </a>
                                    <a
                                        href="https://co-r-e.net/contact"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                                    >
                                        {dict.common.contact}
                                    </a>
                                    <div className="px-3 py-2 text-[10px] text-zinc-400 text-center border-t border-zinc-100 mt-1">
                                        {dict.common.rights_reserved}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
