import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type LeafletMapMarker = {
    id: number | string;
    lat: number;
    lng: number;
    label: string;
    description?: string | null;
};

type LeafletLatLngExpression = [number, number];

type LeafletBoundsExpression = LeafletLatLngExpression[];

type LeafletMapOptions = {
    scrollWheelZoom?: boolean;
};

type LeafletTileLayerOptions = {
    attribution?: string;
};

type LeafletMarkerOptions = {
    title?: string;
};

type LeafletMapInstance = {
    setView(center: LeafletLatLngExpression, zoom: number): LeafletMapInstance;
    fitBounds(
        bounds: LeafletBoundsExpression,
        options?: { padding?: [number, number] },
    ): void;
    invalidateSize(options?: {
        pan?: boolean;
        debounceMoveend?: boolean;
    }): void;
    remove(): void;
};

type LeafletLayer = {
    addTo(map: LeafletMapInstance): LeafletLayer;
    bindPopup(content: string): LeafletLayer;
};

type LeafletGlobal = {
    map(element: HTMLElement, options?: LeafletMapOptions): LeafletMapInstance;
    tileLayer(
        urlTemplate: string,
        options?: LeafletTileLayerOptions,
    ): LeafletLayer;
    marker(
        point: LeafletLatLngExpression,
        options?: LeafletMarkerOptions,
    ): LeafletLayer;
};

type LeafletMapProps = {
    markers: LeafletMapMarker[];
    className?: string;
    heightClassName?: string;
    emptyMessage?: string;
};

declare global {
    interface Window {
        L?: LeafletGlobal;
        __leafletLoaderPromise?: Promise<LeafletGlobal>;
    }
}

const LEAFLET_SCRIPT_ID = 'leaflet-script';
const LEAFLET_STYLE_ID = 'leaflet-style';
const LEAFLET_SCRIPT_SRC = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_STYLE_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

export function LeafletMap({
    markers,
    className,
    heightClassName = 'h-80',
    emptyMessage,
}: LeafletMapProps) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMapInstance | null>(null);
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'ready' | 'error'
    >(markers.length === 0 ? 'idle' : 'loading');

    const sanitizedMarkers = useMemo(
        () =>
            markers.filter(
                (marker) =>
                    Number.isFinite(marker.lat) && Number.isFinite(marker.lng),
            ),
        [markers],
    );
    const visibleStatus = sanitizedMarkers.length === 0 ? 'idle' : status;

    useEffect(() => {
        if (sanitizedMarkers.length === 0) {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }

            return;
        }

        let cancelled = false;

        loadLeaflet()
            .then((leaflet) => {
                if (cancelled || !containerRef.current) {
                    return;
                }

                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                const map = leaflet.map(containerRef.current, {
                    scrollWheelZoom: false,
                });

                leaflet
                    .tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            attribution: '&copy; OpenStreetMap contributors',
                        },
                    )
                    .addTo(map);

                sanitizedMarkers.forEach((marker) => {
                    const popup = marker.description
                        ? `<strong>${escapeHtml(marker.label)}</strong><br />${escapeHtml(marker.description)}`
                        : `<strong>${escapeHtml(marker.label)}</strong>`;

                    leaflet
                        .marker([marker.lat, marker.lng], {
                            title: marker.label,
                        })
                        .addTo(map)
                        .bindPopup(popup);
                });

                if (sanitizedMarkers.length === 1) {
                    map.setView(
                        [sanitizedMarkers[0].lat, sanitizedMarkers[0].lng],
                        14,
                    );
                } else {
                    map.fitBounds(
                        sanitizedMarkers.map((marker) => [
                            marker.lat,
                            marker.lng,
                        ]),
                        {
                            padding: [32, 32],
                        },
                    );
                }

                mapRef.current = map;
                setStatus('ready');

                window.requestAnimationFrame(() => {
                    map.invalidateSize({
                        pan: false,
                    });
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setStatus('error');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [sanitizedMarkers]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className={cn('border p-4', className)}>
            <div className="mb-3">
                <h2 className="font-medium">{t('common.map.title')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('common.map.description')}
                </p>
            </div>

            <div
                className={cn(
                    'relative w-full overflow-hidden rounded border bg-muted/20',
                    heightClassName,
                )}
            >
                <div
                    ref={containerRef}
                    className="leaflet-host h-full w-full"
                />

                {visibleStatus === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <p className="text-center text-sm text-muted-foreground">
                            {emptyMessage ?? t('common.map.empty')}
                        </p>
                    </div>
                )}

                {visibleStatus === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <p className="text-center text-sm text-muted-foreground">
                            {t('common.map.loading')}
                        </p>
                    </div>
                )}

                {visibleStatus === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <p className="text-center text-sm text-red-600">
                            {t('common.map.error')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function loadLeaflet(): Promise<LeafletGlobal> {
    if (window.L) {
        return Promise.resolve(window.L);
    }

    if (window.__leafletLoaderPromise) {
        return window.__leafletLoaderPromise;
    }

    window.__leafletLoaderPromise = new Promise<LeafletGlobal>(
        (resolve, reject) => {
            ensureLeafletStyles();

            const existingScript = document.getElementById(
                LEAFLET_SCRIPT_ID,
            ) as HTMLScriptElement | null;

            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    if (window.L) {
                        resolve(window.L);
                        return;
                    }

                    reject(new Error('Leaflet failed to initialize.'));
                });

                existingScript.addEventListener('error', () => {
                    reject(new Error('Leaflet script failed to load.'));
                });

                return;
            }

            const script = document.createElement('script');
            script.id = LEAFLET_SCRIPT_ID;
            script.src = LEAFLET_SCRIPT_SRC;
            script.async = true;
            script.onload = () => {
                if (window.L) {
                    resolve(window.L);
                    return;
                }

                reject(new Error('Leaflet failed to initialize.'));
            };
            script.onerror = () => {
                reject(new Error('Leaflet script failed to load.'));
            };

            document.head.appendChild(script);
        },
    );

    return window.__leafletLoaderPromise;
}

function ensureLeafletStyles(): void {
    if (document.getElementById(LEAFLET_STYLE_ID)) {
        return;
    }

    const stylesheet = document.createElement('link');
    stylesheet.id = LEAFLET_STYLE_ID;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = LEAFLET_STYLE_HREF;

    document.head.appendChild(stylesheet);
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export type { LeafletMapMarker };
