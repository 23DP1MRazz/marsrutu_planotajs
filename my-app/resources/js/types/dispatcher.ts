export type OrganizationOption = {
    id: number;
    name: string;
};

export type ClientRecord = {
    id: number;
    organization_id: number;
    name: string;
    phone: string;
    updated_at: string;
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
