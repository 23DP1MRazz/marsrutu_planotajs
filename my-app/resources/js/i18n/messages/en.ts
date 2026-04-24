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
            organization_name: 'Organization name',
            password: 'Password',
            role: 'Your role',
        },
        confirm_password: {
            description:
                'This is a secure area of the application. Please confirm your password before continuing.',
        },
        forgot_password: {
            description: 'Enter your email to receive a password reset link',
            link: 'Forgot password?',
            return_to_login: 'Or, return to',
            submit: 'Email password reset link',
            title: 'Forgot password',
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
        reset_password: {
            description: 'Please enter your new password below',
            submit: 'Reset password',
            title: 'Reset password',
        },
        roles: {
            courier: 'Courier',
            dispatcher: 'Dispatcher',
        },
    },
    common: {
        app_name: 'Maršrutu plānotājs',
        language: 'Language',
        languages: {
            en: 'English',
            lv: 'Latvian',
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
                    'Role-based access for dispatchers, couriers, and administrators, each with the right permissions.',
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
