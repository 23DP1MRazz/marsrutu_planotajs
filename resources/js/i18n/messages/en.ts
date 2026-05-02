const en = {
    auth: {
        back_to_home: 'Back to home',
        footer_caption:
            '© 2026 Maršrutu plānotājs · Internal logistics management system',
        fields: {
            confirm_password: 'Confirm password',
            email: 'Email',
            email_address: 'Email address',
            full_name: 'Full name',
            join_code: 'Join code',
            organization: 'Organization',
            organization_id: 'Organization ID',
            organization_name: 'Organization name',
            password: 'Password',
            role: 'Your role',
        },
        confirm_password: {
            description:
                'This is a secure area of the application. Please confirm your password before continuing.',
        },
        login: {
            description: 'Log in to manage your courier routes',
            no_account: "Don't have an account?",
            remember: 'Remember me',
            submit: 'Log in',
            title: 'Welcome back',
        },
        placeholders: {
            email: 'you@example.com',
            full_name: 'Your full name',
            join_code: 'e.g. ABC12345',
            organization_name: 'e.g. Riga Fast Delivery',
            password: '••••••••',
        },
        register: {
            already_have_account: 'Already have an account?',
            create_account: 'Create account',
            create_organization: 'Create a new organization',
            create_organization_hint: 'Start fresh with a new team',
            description: 'Join your organization and start managing deliveries',
            join_organization: 'Join an existing organization',
            join_organization_hint: 'Use an invite code to join',
            personal_details: 'Personal details',
            title: 'Create an account',
        },
        roles: {
            courier: 'Courier',
            dispatcher: 'Dispatcher',
        },
    },
    common: {
        actions: {
            back: 'Back',
            back_to_dashboard: 'Back to dashboard',
            cancel: 'Cancel',
            clear: 'Clear',
            copy_code: 'Copy code',
            copy_link: 'Copy link',
            delete: 'Delete',
            save: 'Save',
            search: 'Search',
        },
        dialogs: {
            confirm_title: 'Please confirm',
        },
        app_name: 'Maršrutu plānotājs',
        fields: {
            address: 'Address',
            actions: 'Actions',
            city: 'City',
            client: 'Client',
            coordinates: 'Coordinates',
            courier: 'Courier',
            date: 'Date',
            email: 'Email',
            latitude: 'Latitude',
            longitude: 'Longitude',
            name: 'Name',
            notes: 'Notes',
            organization: 'Organization',
            organization_id: 'Organization ID',
            phone: 'Phone',
            role: 'Role',
            status: 'Status',
            stops: 'Stops',
            street: 'Street',
            time_window: 'Time Window',
            time_from: 'Time from',
            time_to: 'Time to',
        },
        language: 'Language',
        languages: {
            en: 'English',
            lv: 'Latvian',
        },
        roles: {
            admin: 'Admin',
            courier: 'Courier',
            dispatcher: 'Dispatcher',
        },
        statuses: {
            assigned: 'Assigned',
            arrived: 'In progress',
            cancelled: 'Cancelled',
            completed: 'Completed',
            done: 'Done',
            failed: 'Failed',
            in_progress: 'In progress',
            new: 'New',
            pending: 'Pending',
            planned: 'Planned',
        },
    },
    app: {
        navigation: {
            active_route: 'Active routes',
            addresses: 'Addresses',
            administration: 'Administration',
            clients: 'Clients',
            completed_orders: 'Completed Orders',
            dashboard: 'Dashboard',
            navigation: 'Navigation',
            orders: 'Orders',
            organizations: 'Organizations',
            platform: 'Platform',
            routes: 'Routes',
            users: 'Users',
        },
        shell: {
            close_navigation: 'Close navigation',
            no_organization: 'No organization assigned',
            platform_admin: 'Platform administration',
            settings: 'Settings',
            sign_out: 'Log out',
        },
        tables: {
            showing: 'Showing :count :noun',
            sort: 'Sort:',
        },
        map: {
            empty: 'No coordinates available for this map yet.',
            error: 'Could not load the map right now.',
            loading: 'Loading map…',
            title: 'Map',
            description:
                'Visual preview of route points based on saved coordinates.',
        },
    },
    dashboard: {
        admin: {
            description: 'Overview of platform users and organizations.',
            organizations_meta: 'Active organizations on the platform',
            recent_organizations: 'Recent Organizations',
            recent_organizations_description:
                'Newest organizations and their invite codes.',
            recent_users: 'Recent Users',
            recent_users_description:
                'Latest created accounts across the platform.',
            users_meta: 'Registered accounts across all roles',
        },
        dispatcher: {
            addresses_meta: 'Saved delivery destinations',
            clients_meta: 'Managed customer records',
            copy_code: 'Copy code',
            copy_link: 'Copy Link',
            description:
                "Welcome back. Here's what's happening in :organization today.",
            invite: 'Invite to organization',
            organization_id: 'ID #:id',
            pending_orders: 'Pending Orders',
            pending_orders_description:
                'Orders that need attention or assignment.',
            pending_orders_meta: 'Need attention or assignment',
            quick_actions: 'Quick Actions',
            routes_meta: 'Created delivery routes',
            total_orders_meta: 'All delivery orders',
            upcoming_routes: 'Upcoming Routes',
            upcoming_routes_description:
                'Next planned routes for your organization.',
        },
        empty: {
            no_organizations: 'No organizations created yet.',
            no_pending_orders: 'No pending orders right now.',
            no_routes: 'No routes planned yet.',
            no_summary: 'No summary is available for this account yet.',
            no_users: 'No users created yet.',
        },
        links: {
            open_orders: 'Open orders ->',
            open_organizations: 'Open organizations ->',
            open_routes: 'Open routes ->',
            open_users: 'Open users ->',
        },
        title: 'Dashboard',
    },
    settings: {
        delete_account: {
            confirm_description:
                'Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
            confirm_title: 'Are you sure you want to delete your account?',
            description: 'Delete your account and all of its resources',
            password_placeholder: 'Password',
            title: 'Delete account',
            warning: 'Warning',
            warning_description:
                'Please proceed with caution, this cannot be undone.',
        },
        layout: {
            description: 'Manage your profile and account settings',
            password: 'Password',
            profile: 'Profile',
            title: 'Settings',
        },
        password: {
            confirm_password: 'Confirm password',
            current_password: 'Current password',
            description:
                'Ensure your account is using a long, random password to stay secure',
            new_password: 'New password',
            save: 'Save password',
            title: 'Update password',
        },
        profile: {
            description: 'Update your name and email address',
            email_placeholder: 'Email address',
            full_name_placeholder: 'Full name',
            saved: 'Saved',
            title: 'Profile information',
        },
    },
    admin: {
        organizations: {
            average_users: 'Average users per org',
            average_users_meta: 'Rounded organization average',
            back: 'Back to organizations',
            current_join_code: 'Current invite code',
            description:
                'Review active organizations, join codes, and user counts.',
            edit_description:
                'Update the organization name or generate a fresh join code.',
            edit_title: 'Edit Organization',
            empty_description:
                'Organizations will appear here as they are created.',
            empty_title: 'No organizations found',
            id_meta: 'Internal platform identifier',
            join_code: 'Join code',
            name: 'Organization name',
            regenerate: 'Regenerate join code',
            regenerate_note:
                'Regenerating the join code keeps the organization the same, but old invite codes stop working.',
            title: 'Organizations',
            users: 'Users',
            users_meta: 'Users linked to an organization',
            users_this_org: 'Users in this organization',
        },
        users: {
            admins: 'Admins',
            admins_meta: 'Global platform access',
            all_meta: 'All registered accounts',
            back: 'Back to users',
            couriers: 'Couriers',
            couriers_meta: 'Delivery staff accounts',
            current_organization: 'Current organization: :organization',
            description:
                'Manage names, emails, roles, and organization assignments.',
            dispatchers: 'Dispatchers',
            dispatchers_meta: 'Organization operators',
            edit_description:
                'Update role and organization carefully. Users with the admin role stay global.',
            edit_title: 'Edit User',
            empty_description:
                'User accounts will appear here once they are created.',
            empty_title: 'No users found',
            route_safety_note:
                'Changing a courier with existing route or route records is blocked by backend safety checks.',
            select_organization: 'Select organization',
            title: 'Users',
            total: 'Total users',
            admin_no_org: 'Not needed for admin',
        },
    },
    dispatcher: {
        addresses: {
            back: 'Back to addresses',
            create_description: 'Add a new delivery address.',
            create_title: 'Create Address',
            delete_blocked:
                'Addresses used by existing orders cannot be deleted.',
            delete_confirm: 'Delete this address?',
            description: 'Manage delivery addresses for your organization.',
            edit_description: 'Update the selected address.',
            edit_title: 'Edit Address',
            empty_description:
                'Create an address to start building delivery orders.',
            empty_title: 'No addresses created yet',
            placeholder: 'City, street, coordinates...',
            search_tag: 'Search: :term',
        },
        clients: {
            back: 'Back to clients',
            create_description: 'Add a new client record.',
            create_title: 'Create Client',
            delete_blocked:
                'Clients used by existing orders cannot be deleted.',
            delete_confirm: 'Delete this client?',
            description: 'Manage client records for your organization.',
            edit_description: 'Update the selected client record.',
            edit_title: 'Edit Client',
            empty_description:
                'Create your first client to start organizing deliveries.',
            empty_title: 'No clients created yet',
            placeholder: 'Name, phone...',
            search_tag: 'Search: :term',
        },
        filters: {
            active_date: 'Date: :date',
            active_organization: 'Organization: :organization',
            active_status: 'Status: :status',
            all_organizations: 'All organizations',
            all_statuses: 'All statuses',
            enter: 'Enter',
            filters: 'Filters',
            search: 'Search',
        },
        nouns: {
            addresses: 'addresses',
            clients: 'clients',
            orders: 'orders',
            routes: 'routes',
        },
        orders: {
            back: 'Back to orders',
            cancel_confirm: 'Cancel this order?',
            cancel_order: 'Cancel order',
            create_description: 'Add a new delivery order.',
            create_title: 'Create Order',
            delete_blocked:
                'Orders already attached to routes cannot be deleted.',
            delete_confirm: 'Delete this order?',
            delete_order: 'Delete order',
            description: 'Manage delivery orders for your organization.',
            edit_description: 'Update delivery order details.',
            edit_title: 'Edit Order',
            empty_description: 'Adjust the filters or create a new order.',
            empty_title: 'No orders found',
            assigned_route: 'Assigned route',
            fail_reason_value: 'Fail reason: :reason',
            no_route: 'No route',
            open_assigned_route: 'Open assigned route',
            open_route: 'Open route #:id',
            order_number: 'Order #:id',
            placeholder: 'Client, address, date, status, notes...',
            search_tag: 'Search: :term',
            select_address: 'Select address',
            select_client: 'Select client',
        },
        routes: {
            add_orders: 'Add orders to route',
            add_orders_description:
                'Assign more available orders to this route.',
            add_selected_orders: 'Add selected orders',
            assign_orders: 'Assign orders',
            back: 'Back to routes',
            create_description:
                'Create a daily route and assign available orders.',
            create_title: 'Create Route',
            description: 'Manage daily courier routes.',
            detail_title: 'Route :id',
            empty_description:
                'Create a route to assign orders to your couriers.',
            empty_title: 'No routes created yet',
            map_empty: 'No route stop coordinates available yet.',
            no_available_orders: 'No additional orders are available.',
            no_stops: 'No stops assigned yet.',
            open: 'Open',
            open_order: 'Open order',
            placeholder: 'Courier, client, address, date, status...',
            print: 'Print',
            print_sheet: 'Print route sheet',
            remove: 'Remove',
            remove_confirm:
                'Remove stop :number from this route? The linked order will return to PENDING.',
            reset_preview: 'Reset preview',
            save_order: 'Save order',
            stop_order: 'Stop :number - Order #:id',
            stops: 'Stops',
            stops_description:
                'Reorder stops locally, then save when the sequence looks right.',
            stops_count: ':count stops',
            select_courier: 'Select courier',
            select_orders_description:
                'Select the orders that should be included on this route.',
            unassigned_empty: 'No unassigned orders are available right now.',
            unassigned_courier: 'Unassigned courier',
            up: 'Up',
            down: 'Down',
        },
        sort: {
            city_asc: 'City (A-Z)',
            city_desc: 'City (Z-A)',
            courier_asc: 'Courier (A-Z)',
            courier_desc: 'Courier (Z-A)',
            date_asc: 'Date (oldest)',
            date_desc: 'Date (newest)',
            name_asc: 'Name (A-Z)',
            name_desc: 'Name (Z-A)',
            status_asc: 'Status (A-Z)',
            status_desc: 'Status (Z-A)',
            street_asc: 'Street (A-Z)',
            street_desc: 'Street (Z-A)',
            time_asc: 'Time (earliest)',
            time_desc: 'Time (latest)',
            updated_asc: 'Updated (oldest)',
            updated_desc: 'Updated (newest)',
        },
    },
    courier: {
        completed_orders: {
            completed: 'Completed: :date',
            description:
                'Review delivered orders and open proof files when needed.',
            empty: 'You have no completed orders yet.',
            open_proof: 'Open proof file',
            placeholder: 'Order, route, client, address...',
            route_date: 'Route date: :date',
            sort: {
                completed_asc: 'Completed (oldest)',
                completed_desc: 'Completed (newest)',
                route_date_asc: 'Route date (oldest)',
                route_date_desc: 'Route date (newest)',
            },
            title: 'Completed orders',
        },
        dashboard: {
            active_route: 'Active route',
            active_route_short: 'Active',
            completed_orders: 'Completed orders',
            description:
                'Open directions fast, update delivery progress, and capture proof from your phone.',
            done_count: ':done / :total done',
            done_routes: 'Done routes',
            done_routes_meta: 'Completed route history',
            completed_orders_meta: 'Delivered and failed stop history',
            no_coordinates: 'No saved coordinates for today’s stops yet.',
            no_today_route: 'No route is assigned to you for today.',
            next_stop: 'Next stop',
            open_active_route: 'Open active route',
            open_all: 'View all',
            progress: 'Progress',
            route_status: 'Route status',
            route_number: 'Route #:id',
            route_stops_meta: ':date · :count stops',
            title: 'Courier dashboard',
            total_stops: 'Total stops',
            upcoming_routes: 'Upcoming routes',
            upcoming_routes_meta: 'Scheduled after today',
        },
        routes: {
            back: 'Back to dashboard',
            completed_empty: 'You have no completed routes yet.',
            completed_description: 'Review routes you already finished.',
            completed_detail_description:
                'Review completed stops and delivered orders.',
            completed_title: 'Done routes',
            planned_stops: ':count planned stops',
            planned_detail_description:
                'See stops and planned orders for this route.',
            placeholder: 'Route ID, date, status...',
            route_number: 'Route #:id',
            sort: {
                date_asc: 'Date (oldest)',
                date_desc: 'Date (newest)',
                date_latest: 'Date (latest)',
                date_soonest: 'Date (soonest)',
                stops_asc: 'Stops (low-high)',
                stops_desc: 'Stops (high-low)',
            },
            upcoming_description: 'See routes assigned to you after today.',
            upcoming_empty: 'No upcoming routes assigned yet.',
            upcoming_title: 'Upcoming routes',
        },
        today_route: 'Today route',
        stop: {
            arrived: 'In progress',
            completed: 'Completed',
            confirm_failed: 'Confirm failed',
            delivered_at: 'Delivered at',
            failure_placeholder: 'Describe reason for failure...',
            failed: 'Failed',
            fail_reason: 'Fail reason',
            fail_reason_value: 'Fail reason: :reason',
            google_maps: 'Open in Google Maps',
            mark_delivered: 'Mark as delivered',
            open_file: 'Open file',
            order_number: 'Order #:id',
            proof_uploaded: 'Proof uploaded:',
            reopen: 'Reopen stop',
            save_failed: 'Save failed status',
            start_handling: 'Start handling',
            stop_number: 'Stop :number',
            take_or_choose_photo: 'Take or choose a photo',
            proof_file_too_large:
                'Proof file is too large. Maximum size is 5 MB.',
            upload_proof: 'Upload proof',
            upload_proof_replace: 'Replace proof',
            upload_proof_photo: 'Upload proof photo',
            upload_proof_ready_after:
                'Available after the stop is completed or failed',
            view_proof: 'View proof',
            waze: 'Open in Waze',
        },
    },
    landing: {
        about: {
            benefits: {
                control: {
                    description:
                        'All orders, routes, and couriers in one place. Dispatchers can plan and monitor the full process from one platform.',
                    title: 'Centralized control',
                },
                realtime: {
                    description:
                        'Track delivery statuses and receive online updates. No communication gaps or lost information.',
                    title: 'Real-time visibility',
                },
                structured: {
                    description:
                        'Replace spreadsheets and informal communication with a professional tool built for logistics work.',
                    title: 'Structured workflow',
                },
            },
            intro: 'Maršrutu plānotājs is an internal web application for logistics companies. It provides a centralized and structured way to manage orders, plan routes, and monitor delivery execution in real time.',
            title: 'About the system',
        },
        cta: {
            description:
                'Request access to the route planner and manage deliveries more efficiently',
            title: 'Ready to start?',
        },
        features: {
            audit: {
                description:
                    'A complete history of actions with audit logs. Track who changed what and when.',
                title: 'Audit log',
            },
            capacity: {
                description:
                    'Manage courier capacity and vehicle types. Track availability and workload.',
                title: 'Courier capacity',
            },
            export: {
                description:
                    'Generate detailed CSV exports and printable route sheets. Analyze delivery history and performance.',
                title: 'Reports and export',
            },
            pod: {
                description:
                    'Couriers can capture a photo or signature as proof of delivery, saved directly in the system.',
                title: 'Proof of delivery',
            },
            roles: {
                description:
                    'Role-based access for dispatchers and couriers, each with the right permissions.',
                title: 'Role management',
            },
            routes: {
                description:
                    'Create and reorder routes with an intuitive interface. Optimize delivery order according to your needs.',
                title: 'Route planning',
            },
            statuses: {
                description:
                    'Delivery statuses update online: pending, in progress, delivered, or failed. Everyone sees the latest state.',
                title: 'Real-time statuses',
            },
            windows: {
                description:
                    'Define delivery time windows and follow the estimated arrival time for each order.',
                title: 'Time windows and ETA',
            },
            title: 'Features',
        },
        footer: {
            project: 'Educational/internal project',
            subtitle: 'Internal logistics management system',
            title: 'Route planner for couriers',
        },
        header: {
            about: 'About',
            features: 'Features',
            how_it_works: 'How it works',
            menu: 'Toggle menu',
            users: 'Who it is for',
        },
        hero: {
            learn_more: 'Learn more',
            photo: 'Photo',
            subtitle:
                'An internal web system for small and medium delivery companies. Replace spreadsheets with a professional route planning tool.',
            title: 'Manage courier routes efficiently and clearly',
        },
        how: {
            steps: {
                assign: {
                    description:
                        'The dispatcher creates and assigns orders to couriers with addresses and time windows.',
                    title: 'Order creation',
                },
                deliver: {
                    description:
                        'Couriers complete deliveries with online status updates at every stop.',
                    title: 'Delivery execution',
                },
                proof: {
                    description:
                        'Proof of delivery is collected as a photo or signature.',
                    title: 'Delivery confirmation',
                },
                reports: {
                    description:
                        'Reports and exports are generated for analysis and documentation.',
                    title: 'Report generation',
                },
                routes: {
                    description:
                        'Routes are arranged and reordered for a practical delivery sequence.',
                    title: 'Route organization',
                },
            },
            title: 'How it works',
        },
        sign_in: 'Sign in',
        users: {
            courier: {
                benefits: {
                    proof: 'Capture proof of delivery with a photo or signature',
                    routes: 'View your routes and delivery addresses',
                    status: 'Update delivery statuses with one click',
                },
                subtitle: 'Simple and clear delivery execution',
                title: 'For couriers',
            },
            dispatcher: {
                benefits: {
                    couriers: 'Follow all couriers and deliveries in real time',
                    orders: 'Quickly create and organize orders',
                    routes: 'Optimize routes with visual reordering',
                },
                subtitle: 'Centralized route planning and management',
                title: 'For dispatchers',
            },
            title: 'Who it is for',
        },
    },
} as const;

export default en;
