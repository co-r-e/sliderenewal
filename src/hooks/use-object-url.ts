import { useMemo, useEffect } from "react";

export function useObjectUrl(file: File | Blob | null): string | null {
    const url = useMemo(() => {
        if (!file) return null;
        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [url]);

    return url;
}
