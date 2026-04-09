export type OrganizationOption = {
    id: number;
    name: string;
};

export type ClientOption = {
    id: number;
    organization_id: number;
    name: string;
};

export type ClientRecord = {
    id: number;
    organization_id: number;
    name: string;
    phone: string;
    updated_at: string;
};

export type AddressOption = {
    id: number;
    organization_id: number;
    city: string;
    street: string;
};

export type AddressRecord = {
    id: number;
    organization_id: number;
    city: string;
    street: string;
    lat: number | string | null;
    lng: number | string | null;
    updated_at: string;
};

export type OrderRecord = {
    id: number;
    organization_id: number;
    client_id: number;
    address_id: number;
    date: string;
    time_from: string;
    time_to: string;
    status: string;
    notes: string | null;
    updated_at: string;
    client_name: string | null;
    address_label: string;
};

export type OrderFilters = {
    date: string;
    status: string;
    client: string;
};
