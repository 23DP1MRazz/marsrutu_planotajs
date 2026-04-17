import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

type LiveFilterValue = string | number | boolean | null | undefined;

type UseLiveFilteringOptions<TData extends Record<string, LiveFilterValue>> = {
    data: TData;
    debounceMs?: number;
    url: string;
};

export function useLiveFiltering<TData extends Record<string, LiveFilterValue>>({
    data,
    debounceMs = 300,
    url,
}: UseLiveFilteringOptions<TData>) {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.get(url, data, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }, debounceMs);

        return () => window.clearTimeout(timeoutId);
    }, [data, debounceMs, url]);
}
