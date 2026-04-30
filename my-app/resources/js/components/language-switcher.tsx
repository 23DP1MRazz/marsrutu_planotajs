import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { AppLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update } from '@/routes/locale';
import type { SharedData } from '@/types';

type LanguageSwitcherProps = {
    size?: 'default' | 'compact';
    variant?: 'light' | 'transparent';
};

const languageLabels: Record<AppLocale, string> = {
    en: 'EN',
    lv: 'LV',
};

export function LanguageSwitcher({
    size = 'default',
    variant = 'light',
}: LanguageSwitcherProps) {
    const { availableLocales, locale } = usePage<SharedData>().props;
    const { t } = useTranslation();

    const switchLocale = (nextLocale: AppLocale): void => {
        if (nextLocale === locale) {
            return;
        }

        router.patch(
            update.url(),
            { locale: nextLocale },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <div
            className={cn(
                'language-switcher inline-flex h-9 items-center gap-1 rounded-lg border p-1',
                size === 'compact' && 'h-8 gap-0.5 rounded-[10px] p-0.5',
                variant === 'light'
                    ? 'border-[#e5e7eb] bg-white text-[#6b7280]'
                    : 'border-white/15 bg-white/5 text-white/70',
            )}
            aria-label={t('common.language')}
        >
            <Languages
                className={cn(
                    'language-switcher__icon mx-1 h-3.5 w-3.5 shrink-0',
                    size === 'compact' && 'mx-0.5 h-3 w-3',
                )}
            />
            {availableLocales.map((availableLocale) => {
                const isActive = availableLocale === locale;

                return (
                    <button
                        key={availableLocale}
                        type="button"
                        onClick={() => switchLocale(availableLocale)}
                        className={cn(
                            'language-switcher__button h-7 rounded-md px-2 text-xs font-bold transition',
                            size === 'compact' &&
                                'h-6 rounded-[8px] px-1.5 text-[11px]',
                            isActive
                                ? variant === 'light'
                                    ? 'bg-[#2563eb] text-white shadow-[0_1px_2px_rgba(37,99,235,0.25)]'
                                    : 'bg-white text-[#111827]'
                                : variant === 'light'
                                  ? 'hover:bg-[#f9fafb] hover:text-[#111827]'
                                  : 'hover:bg-white/10 hover:text-white',
                        )}
                        disabled={isActive}
                        aria-label={t(`common.languages.${availableLocale}`)}
                    >
                        {languageLabels[availableLocale]}
                    </button>
                );
            })}
        </div>
    );
}
