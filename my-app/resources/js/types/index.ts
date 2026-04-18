export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    registerPrefill: {
        join_code: string | null;
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
};
