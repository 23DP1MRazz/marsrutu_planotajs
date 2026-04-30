import { router } from '@inertiajs/react';
import en from '@/i18n/messages/en';
import lv from '@/i18n/messages/lv';
import type { SharedData } from '@/types';

export const availableLocales = ['en', 'lv'] as const;

export type AppLocale = (typeof availableLocales)[number];

type TranslationLeaf = string;
type TranslationTree = {
    [key: string]: TranslationLeaf | TranslationTree;
};

type TranslationDictionary = Record<AppLocale, TranslationTree>;
type TranslationReplacements = Record<string, string | number>;

const translations: TranslationDictionary = {
    en,
    lv,
};

function syncHtmlLanguage(locale: AppLocale): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.lang = locale;
}

function resolveTranslation(
    locale: AppLocale,
    key: string,
): TranslationLeaf | null {
    const segments = key.split('.');
    let currentValue: TranslationLeaf | TranslationTree = translations[locale];

    for (const segment of segments) {
        if (
            typeof currentValue !== 'object' ||
            currentValue === null ||
            !(segment in currentValue)
        ) {
            return null;
        }

        currentValue = currentValue[segment];
    }

    return typeof currentValue === 'string' ? currentValue : null;
}

function interpolate(
    template: string,
    replacements: TranslationReplacements = {},
): string {
    return Object.entries(replacements).reduce(
        (translatedText, [replacementKey, replacementValue]) =>
            translatedText.replaceAll(
                `:${replacementKey}`,
                String(replacementValue),
            ),
        template,
    );
}

export function isLocale(value: string): value is AppLocale {
    return availableLocales.includes(value as AppLocale);
}

export function translate(
    locale: AppLocale,
    key: string,
    replacements: TranslationReplacements = {},
): string {
    const activeLocale = isLocale(locale) ? locale : 'en';
    const resolvedTranslation =
        resolveTranslation(activeLocale, key) ?? resolveTranslation('en', key);

    if (resolvedTranslation === null) {
        return key;
    }

    return interpolate(resolvedTranslation, replacements);
}

export function initializeI18n(initialLocale: SharedData['locale']): void {
    syncHtmlLanguage(initialLocale);

    router.on('success', (event) => {
        const pageLocale = event.detail.page.props.locale;

        if (typeof pageLocale === 'string' && isLocale(pageLocale)) {
            syncHtmlLanguage(pageLocale);
        }
    });
}
