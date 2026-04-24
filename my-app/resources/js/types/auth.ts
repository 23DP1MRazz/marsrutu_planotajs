export type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'dispatcher' | 'courier';
    organization_id: number | null;
    avatar?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    organization_name?: string | null;
};
