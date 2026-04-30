import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { SharedData } from '@/types';

export function CourierAppFrame({ children }: { children: ReactNode }) {
    const page = usePage<SharedData>();

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
            <div className="min-h-screen w-full bg-[#f3f4f6] lg:mx-auto lg:max-w-[430px] lg:shadow-[0_18px_50px_rgba(17,24,39,0.10)] xl:border-x xl:border-[#e5e7eb]">
                <main key={page.url} className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
