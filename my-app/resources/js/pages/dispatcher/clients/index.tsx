import { Head, Link, router } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ClientRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/dispatcher/clients' },
];

type DispatcherClientsIndexProps = {
    clients: ClientRecord[];
};

export default function DispatcherClientsIndex({
    clients,
}: DispatcherClientsIndexProps) {
    const deleteClient = (clientId: number) => {
        router.delete(`/dispatcher/clients/${clientId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <ResourceShell
                title="Clients"
                description="Manage client records for your organization."
                actionHref="/dispatcher/clients/create"
                actionLabel="Create client"
            >
                <div className="border p-4">
                    {clients.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No clients created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Phone</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b">
                                        <td className="p-2">{client.name}</td>
                                        <td className="p-2">{client.phone}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button asChild type="button" variant="outline">
                                                    <Link href={`/dispatcher/clients/${client.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => deleteClient(client.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
