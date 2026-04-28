<?php

return [
    'accepted' => 'The :attribute field must be accepted.',
    'after' => 'The :attribute field must be after :date.',
    'array' => 'The :attribute field must be a list.',
    'between' => [
        'numeric' => 'The :attribute field must be between :min and :max.',
    ],
    'confirmed' => 'The :attribute confirmation does not match.',
    'current_password' => 'The password is incorrect.',
    'date' => 'The :attribute field must be a valid date.',
    'date_format' => 'The :attribute field must match the format :format.',
    'distinct' => 'The :attribute field has a duplicate value.',
    'email' => 'The :attribute field must be a valid email address.',
    'exists' => 'The selected :attribute is invalid.',
    'image' => 'The :attribute field must be an image.',
    'in' => 'The selected :attribute is invalid.',
    'integer' => 'The :attribute field must be a number.',
    'max' => [
        'file' => 'The :attribute field must not be greater than :max kilobytes.',
        'string' => 'The :attribute field must not be greater than :max characters.',
    ],
    'mimes' => 'The :attribute field must be a file of type: :values.',
    'min' => [
        'array' => 'The :attribute field must have at least :min item.',
        'string' => 'The :attribute field must be at least :min characters.',
    ],
    'numeric' => 'The :attribute field must be a number.',
    'password' => [
        'letters' => 'The :attribute field must contain at least one letter.',
        'mixed' => 'The :attribute field must contain at least one uppercase and one lowercase letter.',
        'numbers' => 'The :attribute field must contain at least one number.',
        'symbols' => 'The :attribute field must contain at least one symbol.',
        'uncompromised' => 'The given :attribute has appeared in a data leak. Please choose a different :attribute.',
    ],
    'prohibited' => 'The :attribute field is prohibited.',
    'required' => 'The :attribute field is required.',
    'required_if' => 'The :attribute field is required.',
    'required_with' => 'The :attribute field is required when :values is present.',
    'string' => 'The :attribute field must be text.',
    'unique' => 'The :attribute has already been taken.',

    'custom' => [
        'organization_join_code' => [
            'invalid' => 'Invalid organization join code.',
        ],
        'organization_id' => [
            'required_for_role' => 'The organization field is required.',
        ],
        'phone' => [
            'incorrect' => 'Incorrect phone number.',
        ],
        'role' => [
            'last_admin' => 'At least one admin user must remain.',
            'courier_routes_exist' => 'This courier cannot change role or organization while assigned routes exist.',
        ],
        'client' => [
            'delete_blocked' => 'This client cannot be deleted because it is used by existing orders.',
        ],
        'address' => [
            'delete_blocked' => 'This address cannot be deleted because it is used by existing orders.',
        ],
        'file' => [
            'proof_status' => 'Proof of delivery can only be uploaded for completed or failed stops.',
            'proof_exists' => 'Proof of delivery has already been uploaded for this stop.',
        ],
        'order_ids' => [
            'route_date_match' => 'Orders can only be assigned to a route on the same date.',
        ],
        'stop_ids' => [
            'complete_route' => 'The stop order must include every stop from this route exactly once.',
        ],
        'route_stop' => [
            'pending_only' => 'Only pending stops can be removed from a route.',
        ],
        'order' => [
            'cancel_blocked' => 'This order cannot be cancelled because delivery has already started or finished.',
            'date_must_match_route' => 'The order date must match the assigned route date.',
            'delete_blocked' => 'This order cannot be deleted because it is already attached to a route. Cancel it instead when cancellation is allowed.',
            'organization_locked' => 'The organization cannot be changed while the order is attached to a route.',
        ],
    ],

    'attributes' => [
        'address_id' => 'address',
        'city' => 'city',
        'client_id' => 'client',
        'courier_user_id' => 'courier',
        'current_password' => 'current password',
        'date' => 'date',
        'email' => 'email',
        'fail_reason' => 'failure reason',
        'file' => 'proof file',
        'lat' => 'latitude',
        'lng' => 'longitude',
        'name' => 'name',
        'notes' => 'notes',
        'order_ids' => 'orders',
        'order_ids.*' => 'order',
        'organization_id' => 'organization',
        'organization_join_code' => 'join code',
        'organization_name' => 'organization name',
        'org_action' => 'organization action',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'phone' => 'phone',
        'role' => 'role',
        'status' => 'status',
        'stop_ids' => 'stops',
        'stop_ids.*' => 'stop',
        'street' => 'street',
        'time_from' => 'time from',
        'time_to' => 'time to',
    ],
];
