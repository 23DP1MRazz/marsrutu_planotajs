export const HEADER_SCROLL_OFFSET_PX = 80;

export const howItWorksSteps = [
    'assign',
    'routes',
    'deliver',
    'proof',
    'reports',
] as const;

export const featureCards = [
    {
        icon: '📍',
        key: 'routes',
    },
    {
        icon: '🚚',
        key: 'capacity',
    },
    {
        icon: '⏰',
        key: 'windows',
    },
    {
        icon: '🔄',
        key: 'statuses',
    },
    {
        icon: '✓',
        key: 'pod',
    },
    {
        icon: '📊',
        key: 'export',
    },
    {
        icon: '🔒',
        key: 'audit',
    },
    {
        icon: '👥',
        key: 'roles',
    },
] as const;

export const targetUsers = [
    {
        key: 'dispatcher',
        benefits: ['orders', 'routes', 'couriers'],
    },
    {
        key: 'courier',
        benefits: ['routes', 'status', 'proof'],
    },
] as const;
