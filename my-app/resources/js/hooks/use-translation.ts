import { usePage } from '@inertiajs/react';
import { translate } from '@/lib/i18n';
import type { SharedData } from '@/types';

type TranslationReplacements = Record<string, string | number>;

export function useTranslation() {
    const { locale } = usePage<SharedData>().props;

    return {
        locale,
        t: (key: string, replacements: TranslationReplacements = {}) =>
            translate(locale, key, replacements),
    };
}
