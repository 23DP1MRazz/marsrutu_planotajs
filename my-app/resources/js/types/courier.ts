export type CourierRouteRecord = {
    id: number;
    organization_id: number;
    courier_user_id: number;
    date: string;
    status: string;
};

export type CourierRouteStopRecord = {
    id: number;
    seq_no: number;
    order_id: number;
    planned_eta: string | null;
    arrived_at: string | null;
    completed_at: string | null;
    status: string;
    fail_reason: string | null;
    proof_file_url: string | null;
    proof_view_url: string | null;
    client_name: string | null;
    address_label: string;
};
