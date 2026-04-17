<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Route {{ $deliveryRoute->id }} sheet</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 32px;
        }

        h1,
        h2,
        p {
            margin: 0;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 24px;
        }

        .meta {
            display: grid;
            gap: 8px;
            margin-top: 16px;
        }

        .sheet {
            border: 1px solid #d1d5db;
            border-radius: 16px;
            padding: 24px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
            vertical-align: top;
            font-size: 14px;
        }

        th {
            background: #f3f4f6;
        }

        .actions {
            margin-bottom: 16px;
        }

        .button {
            display: inline-block;
            padding: 10px 16px;
            border: 1px solid #111827;
            border-radius: 999px;
            color: #111827;
            text-decoration: none;
            font-size: 14px;
            margin-right: 8px;
        }

        @media print {
            body {
                margin: 0;
            }

            .actions {
                display: none;
            }

            .sheet {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button class="button" onclick="window.print()">Print</button>
        <a class="button" href="{{ route('dispatcher.routes.show', $deliveryRoute) }}">Back to route</a>
    </div>

    <div class="sheet">
        <div class="header">
            <div>
                <h1>Route sheet #{{ $deliveryRoute->id }}</h1>
                <div class="meta">
                    <p><strong>Organization:</strong> {{ $deliveryRoute->organization?->name ?? '-' }}</p>
                    <p><strong>Courier:</strong> {{ $deliveryRoute->courier?->user?->name ?? '-' }}</p>
                    <p><strong>Date:</strong> {{ \Illuminate\Support\Carbon::parse($deliveryRoute->date)->format('M d, Y') }}</p>
                    <p><strong>Status:</strong> {{ $deliveryRoute->status }}</p>
                </div>
            </div>
        </div>

        <h2>Stops</h2>

        @if ($deliveryRoute->routeStops->isEmpty())
            <p style="margin-top: 16px;">No stops assigned yet.</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Stop</th>
                        <th>Order</th>
                        <th>Client</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Planned ETA</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($deliveryRoute->routeStops as $routeStop)
                        <tr>
                            <td>{{ $routeStop->seq_no }}</td>
                            <td>#{{ $routeStop->order_id }}</td>
                            <td>{{ $routeStop->order?->client?->name ?? '-' }}</td>
                            <td>{{ collect([$routeStop->order?->address?->city, $routeStop->order?->address?->street])->filter()->join(', ') ?: '-' }}</td>
                            <td>{{ $routeStop->status }}</td>
                            <td>
                                {{ $routeStop->planned_eta ? \Illuminate\Support\Carbon::parse($routeStop->planned_eta)->format('M d, Y H:i') : '-' }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
</body>
</html>
