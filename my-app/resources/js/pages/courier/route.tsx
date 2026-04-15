import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierRouteRecord, CourierRouteStopRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutePageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Today route', href: '/courier/today-route' },
];

export default function CourierRoutePage({
    deliveryRoute,
    stops,
}: CourierRoutePageProps) {
    const [failedStopId, setFailedStopId] = useState<number | null>(null);
    const [failReasons, setFailReasons] = useState<Record<number, string>>({});
    const [selectedProofFiles, setSelectedProofFiles] = useState<Record<number, File | null>>({});
    const statusForm = useForm({
        status: '',
        fail_reason: '',
    });
    const proofForm = useForm({
        file: null as File | null,
    });

    const updateStopStatus = (
        stopId: number,
        status: 'ARRIVED' | 'COMPLETED' | 'FAILED',
        failReason = '',
    ) => {
        statusForm.transform(() => ({
            status,
            fail_reason: failReason,
        }));

        statusForm.patch(`/courier/stops/${stopId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setFailedStopId(null);
                setFailReasons((currentReasons) => ({
                    ...currentReasons,
                    [stopId]: '',
                }));
                statusForm.reset();
            },
        });
    };

    const uploadProof = (stopId: number) => {
        const selectedFile = selectedProofFiles[stopId];

        if (!selectedFile) {
            return;
        }

        proofForm.transform(() => ({
            file: selectedFile,
        }));

        proofForm.post(`/courier/stops/${stopId}/proof`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSelectedProofFiles((currentFiles) => ({
                    ...currentFiles,
                    [stopId]: null,
                }));
                proofForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Today route" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between border p-4">
                    <div>
                        <h1 className="text-lg font-semibold">Today route</h1>
                        <p className="text-sm text-muted-foreground">
                            View your assigned stops and update delivery progress.
                        </p>
                    </div>
                </div>

                {deliveryRoute === null ? (
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">
                            No route is assigned to you for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="border p-4 text-sm">
                            <p>
                                <span className="font-medium">Date:</span>{' '}
                                {formatShortDate(deliveryRoute.date)}
                            </p>
                            <p>
                                <span className="font-medium">Status:</span>{' '}
                                {deliveryRoute.status}
                            </p>
                            <p>
                                <span className="font-medium">Stops:</span> {stops.length}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {stops.map((stop) => (
                                <div key={stop.id} className="border p-4">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">
                                            Stop {stop.seq_no} — Order #{stop.order_id}
                                        </p>
                                        <p>{stop.client_name ?? '-'}</p>
                                        <p>{stop.address_label || '-'}</p>
                                        <p>Status: {stop.status}</p>
                                        {stop.fail_reason && (
                                            <p>Fail reason: {stop.fail_reason}</p>
                                        )}
                                        {stop.proof_view_url && (
                                            <p>
                                                Proof uploaded:{' '}
                                                <a
                                                    href={stop.proof_view_url}
                                                    className="underline"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Open file
                                                </a>
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                statusForm.processing || stop.status === 'ARRIVED'
                                            }
                                            onClick={() => updateStopStatus(stop.id, 'ARRIVED')}
                                        >
                                            Arrived
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                statusForm.processing || stop.status === 'COMPLETED'
                                            }
                                            onClick={() => updateStopStatus(stop.id, 'COMPLETED')}
                                        >
                                            Completed
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={statusForm.processing}
                                            onClick={() =>
                                                setFailedStopId((currentStopId) =>
                                                    currentStopId === stop.id ? null : stop.id,
                                                )
                                            }
                                        >
                                            Failed
                                        </Button>
                                    </div>

                                    {failedStopId === stop.id && (
                                        <div className="mt-4 space-y-2">
                                            <label
                                                htmlFor={`fail-reason-${stop.id}`}
                                                className="block text-sm"
                                            >
                                                Fail reason
                                            </label>
                                            <input
                                                id={`fail-reason-${stop.id}`}
                                                type="text"
                                                value={failReasons[stop.id] ?? ''}
                                                onChange={(event) =>
                                                    setFailReasons((currentReasons) => ({
                                                        ...currentReasons,
                                                        [stop.id]: event.target.value,
                                                    }))
                                                }
                                                className="w-full border px-3 py-2 text-sm"
                                                disabled={statusForm.processing}
                                            />
                                            {statusForm.errors.fail_reason && (
                                                <p className="text-sm text-red-600">
                                                    {statusForm.errors.fail_reason}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        updateStopStatus(
                                                            stop.id,
                                                            'FAILED',
                                                            failReasons[stop.id] ?? '',
                                                        )
                                                    }
                                                    disabled={statusForm.processing}
                                                >
                                                    Save failed status
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setFailedStopId(null)}
                                                    disabled={statusForm.processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!stop.proof_file_url
                                        && ['COMPLETED', 'FAILED'].includes(stop.status) && (
                                            <div className="mt-4 space-y-2">
                                                <label
                                                    htmlFor={`proof-file-${stop.id}`}
                                                    className="block text-sm"
                                                >
                                                    Upload proof photo
                                                </label>
                                                <input
                                                    id={`proof-file-${stop.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(event) =>
                                                        setSelectedProofFiles((currentFiles) => ({
                                                            ...currentFiles,
                                                            [stop.id]: event.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                    className="block w-full text-sm"
                                                    disabled={proofForm.processing}
                                                />
                                                {proofForm.errors.file && (
                                                    <p className="text-sm text-red-600">
                                                        {proofForm.errors.file}
                                                    </p>
                                                )}
                                                <Button
                                                    type="button"
                                                    onClick={() => uploadProof(stop.id)}
                                                    disabled={
                                                        proofForm.processing
                                                        || !selectedProofFiles[stop.id]
                                                    }
                                                >
                                                    Upload proof
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
