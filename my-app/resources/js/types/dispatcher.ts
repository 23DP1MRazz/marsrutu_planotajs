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

export type CourierOption = {
    id: number;
    organization_id: number | null;
    name: string;
};

export type AssignableOrder = {
    id: number;
    organization_id: number;
    client_name: string | null;
    address_label: string;
    date: string;
    time_from: string;
    time_to: string;
};

export type DeliveryRouteRecord = {
    id: number;
    organization_id: number;
    courier_user_id: number;
    courier_name: string | null;
    date: string;
    status: string;
    stops_count: number;
    updated_at: string;
};

export type RouteStopRecord = {
    id: number;
    seq_no: number;
    order_id: number;
    planned_eta: string | null;
    status: string;
    proof_view_url: string | null;
    client_name: string | null;
    address_label: string;
};
