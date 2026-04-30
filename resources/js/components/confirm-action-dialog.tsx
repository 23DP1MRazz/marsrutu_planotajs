import { backofficeButtonClassName } from '@/components/backoffice/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

type ConfirmActionDialogProps = {
    open: boolean;
    title?: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    processing?: boolean;
    confirmVariant?: 'primary' | 'danger';
};

export default function ConfirmActionDialog({
    open,
    title,
    description,
    confirmLabel,
    onConfirm,
    onOpenChange,
    processing = false,
    confirmVariant = 'danger',
}: ConfirmActionDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-[#dbe3f0] bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                <DialogHeader className="space-y-2 px-6 pt-6 text-left">
                    <DialogTitle className="text-xl font-semibold tracking-[-0.02em] text-[#111827]">
                        {title ?? t('common.dialogs.confirm_title')}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-[#6b7280]">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="border-t border-[#e5e7eb] px-6 py-4 sm:justify-end">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className={backofficeButtonClassName('outline')}
                    >
                        {t('common.actions.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={
                            confirmVariant === 'danger'
                                ? 'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-[#dc2626] px-4 text-sm font-semibold whitespace-nowrap text-white transition-all hover:-translate-y-px hover:bg-[#b91c1c] hover:shadow-[0_4px_12px_rgba(220,38,38,0.24)]'
                                : backofficeButtonClassName('primary')
                        }
                    >
                        {confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
