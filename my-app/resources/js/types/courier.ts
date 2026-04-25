export type CourierRouteRecord = {
    id: number;
    organization_id: number;
    courier_user_id: number;
    date: string;
    status: string;
    stops_count?: number;
};

export type CourierDashboardSummary = {
    done_routes: number;
    completed_orders: number;
    upcoming_routes_count: number;
    upcoming_routes: CourierRouteListRecord[];
};

export type CourierRouteListFilters = {
    search: string;
    date: string;
    sort: string;
};

export type CourierRouteListRecord = {
    id: number;
    date: string;
    status: string;
    stops_count: number;
    href: string;
};

export type CourierCompletedOrderFilters = {
    search: string;
    date: string;
    sort: string;
};

export type CourierCompletedOrderRecord = {
    route_stop_id: number;
    route_id: number;
    order_id: number;
    route_date: string | null;
    client_name: string | null;
    address_label: string;
    status: string;
    completed_at: string | null;
    proof_view_url: string | null;
};

export type CourierRouteStopRecord = {
    id: number;
    seq_no: number;
    order_id: number;
    planned_eta: string | null;
    time_from: string | null;
    time_to: string | null;
    arrived_at: string | null;
    completed_at: string | null;
    status: string;
    fail_reason: string | null;
    proof_file_url: string | null;
    proof_view_url: string | null;
    client_name: string | null;
    address_label: string;
    lat: number | null;
    lng: number | null;
    google_maps_url: string;
    waze_url: string;
};
