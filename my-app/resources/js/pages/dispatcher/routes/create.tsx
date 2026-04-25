import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    BackofficeInfoNote,
    BackofficePage,
    BackofficePageHeader,
    backofficeButtonClassName,
    backofficeInputClassName,
    backofficeSelectClassName,
} from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    AssignableOrder,
    CourierOption,
    OrganizationOption,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

type DispatcherRoutesCreateProps = {
    organizations: OrganizationOption[];
    couriers: CourierOption[];
    orders: AssignableOrder[];
    canSelectOrganization: boolean;
    todayDate: string;
};

export default function DispatcherRoutesCreate({
    organizations,
    couriers,
    orders,
    canSelectOrganization,
    todayDate,
}: DispatcherRoutesCreateProps) {
    const { t } = useTranslation();
    const form = useForm({
        organization_id:
            canSelectOrganization && organizations[0]?.id
                ? String(organizations[0].id)
                : '',
        courier_user_id: couriers[0]?.id ? String(couriers[0].id) : '',
        date: todayDate,
        order_ids: [] as number[],
    });

    const toggleOrder = (orderId: number) => {
        form.setData(
            'order_ids',
            form.data.order_ids.includes(orderId)
                ? form.data.order_ids.filter(
                      (selectedOrderId) => selectedOrderId !== orderId,
                  )
                : [...form.data.order_ids, orderId],
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => {
            if (!canSelectOrganization) {
                const { organization_id: _organizationId, ...rest } = data;
                return rest;
            }

            return data;
        });
        form.post('/dispatcher/routes');
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.routes'), href: '/dispatcher/routes' },
        {
            title: t('dispatcher.routes.create_title'),
            href: '/dispatcher/routes/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dispatcher.routes.create_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('dispatcher.routes.create_title')}
                    description={t('dispatcher.routes.create_description')}
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/routes"
                            variant="outline"
                        >
                            {t('dispatcher.routes.back')}
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            {canSelectOrganization &&
                            organizations.length > 0 ? (
                                <BackofficeField
                                    label={t('common.fields.organization')}
                                    error={form.errors.organization_id}
                                >
                                    <select
                                        id="organization_id"
                                        value={form.data.organization_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'organization_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        {organizations.map((organization) => (
                                            <option
                                                key={organization.id}
                                                value={organization.id}
                                            >
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label={t('common.fields.courier')}
                                    error={form.errors.courier_user_id}
                                >
                                    <select
                                        id="courier_user_id"
                                        value={form.data.courier_user_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'courier_user_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        <option value="">
                                            {t(
                                                'dispatcher.routes.select_courier',
                                            )}
                                        </option>
                                        {couriers.map((courier) => (
                                            <option
                                                key={courier.id}
                                                value={courier.id}
                                            >
                                                {courier.name}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>

                                <BackofficeField
                                    label={t('common.fields.date')}
                                    error={form.errors.date}
                                >
                                    <input
                                        id="date"
                                        type="date"
                                        value={form.data.date}
                                        onChange={(event) =>
                                            form.setData(
                                                'date',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h2 className="text-base font-semibold text-[#111827]">
                                        {t('dispatcher.routes.assign_orders')}
                                    </h2>
                                    <p className="text-sm text-[#6b7280]">
                                        {t(
                                            'dispatcher.routes.select_orders_description',
                                        )}
                                    </p>
                                </div>

                                {orders.length === 0 ? (
                                    <BackofficeInfoNote>
                                        {t(
                                            'dispatcher.routes.unassigned_empty',
                                        )}
                                    </BackofficeInfoNote>
                                ) : (
                                    <div className="space-y-2">
                                        {orders.map((order) => (
                                            <label
                                                key={order.id}
                                                className="flex items-start gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm transition hover:bg-[#f9fafb]"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.order_ids.includes(
                                                        order.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleOrder(order.id)
                                                    }
                                                    className="mt-1 h-4 w-4 rounded border-[#cbd5e1]"
                                                />
                                                <span>
                                                    <span className="font-semibold text-[#111827]">
                                                        #{order.id}{' '}
                                                        {order.client_name ??
                                                            '-'}
                                                    </span>
                                                    <span className="mt-1 block text-[#6b7280]">
                                                        {order.address_label} ·{' '}
                                                        {formatShortDate(
                                                            order.date,
                                                        )}{' '}
                                                        ·{' '}
                                                        {order.time_from.slice(
                                                            0,
                                                            5,
                                                        )}{' '}
                                                        -{' '}
                                                        {order.time_to.slice(
                                                            0,
                                                            5,
                                                        )}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {form.errors.order_ids ? (
                                    <p className="text-sm text-red-600">
                                        {form.errors.order_ids}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className={backofficeButtonClassName(
                                        'primary',
                                    )}
                                >
                                    {t('common.actions.save')}
                                </button>
                                <BackofficeActionLink
                                    href="/dispatcher/routes"
                                    variant="outline"
                                >
                                    {t('common.actions.cancel')}
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
