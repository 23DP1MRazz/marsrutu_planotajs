<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('reports.routes.print.route_sheet', ['id' => $deliveryRoute->id]) }}</title>
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
        <button class="button" onclick="window.print()">{{ __('reports.routes.print.print') }}</button>
        <a class="button" href="{{ route('dispatcher.routes.show', $deliveryRoute) }}">{{ __('reports.routes.print.back') }}</a>
    </div>

    <div class="sheet">
        <div class="header">
            <div>
                <h1>{{ __('reports.routes.print.route_sheet', ['id' => $deliveryRoute->id]) }}</h1>
                <div class="meta">
                    <p><strong>{{ __('reports.routes.print.organization') }}:</strong> {{ $deliveryRoute->organization?->name ?? '-' }}</p>
                    <p><strong>{{ __('reports.routes.print.courier') }}:</strong> {{ $deliveryRoute->courier?->user?->name ?? '-' }}</p>
                    <p><strong>{{ __('reports.routes.print.date') }}:</strong> {{ \Illuminate\Support\Carbon::parse($deliveryRoute->date)->format('M d, Y') }}</p>
                    <p><strong>{{ __('reports.routes.print.status') }}:</strong> {{ __('statuses.'.strtolower($deliveryRoute->status)) }}</p>
                </div>
            </div>
        </div>

        <h2>{{ __('reports.routes.print.stops') }}</h2>

        @if ($deliveryRoute->routeStops->isEmpty())
            <p style="margin-top: 16px;">{{ __('reports.routes.print.no_stops') }}</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>{{ __('reports.routes.print.stop') }}</th>
                        <th>{{ __('reports.routes.print.order') }}</th>
                        <th>{{ __('reports.routes.print.client') }}</th>
                        <th>{{ __('reports.routes.print.address') }}</th>
                        <th>{{ __('reports.routes.print.status') }}</th>
                        <th>{{ __('reports.routes.print.planned_eta') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($deliveryRoute->routeStops as $routeStop)
                        <tr>
                            <td>{{ $routeStop->seq_no }}</td>
                            <td>#{{ $routeStop->order_id }}</td>
                            <td>{{ $routeStop->order?->client?->name ?? '-' }}</td>
                            <td>{{ collect([$routeStop->order?->address?->city, $routeStop->order?->address?->street])->filter()->join(', ') ?: '-' }}</td>
                            <td>{{ __('statuses.'.strtolower($routeStop->status)) }}</td>
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
