const lv = {
    auth: {
        back_to_home: 'Atpakaļ uz sākumu',
        footer_caption:
            '© 2026 Maršrutu plānotājs · Iekšējā loģistikas pārvaldības sistēma',
        fields: {
            confirm_password: 'Apstiprināt paroli',
            email: 'E-pasts',
            email_address: 'E-pasta adrese',
            full_name: 'Pilns vārds',
            join_code: 'Pievienošanās kods',
            organization: 'Organizācija',
            organization_id: 'Organizācijas ID',
            organization_name: 'Organizācijas nosaukums',
            password: 'Parole',
            role: 'Jūsu loma',
        },
        confirm_password: {
            description:
                'Šī ir droša lietotnes zona. Lūdzu, apstipriniet paroli, lai turpinātu.',
        },
        forgot_password: {
            description:
                'Ievadiet e-pastu, lai saņemtu paroles atiestatīšanas saiti',
            link: 'Aizmirsāt paroli?',
            return_to_login: 'Vai atgriezieties uz',
            submit: 'Nosūtīt paroles atiestatīšanas saiti',
            title: 'Aizmirsta parole',
        },
        login: {
            description: 'Pierakstieties, lai pārvaldītu kurjeru maršrutus',
            no_account: 'Nav konta?',
            remember: 'Atcerēties mani',
            submit: 'Pierakstīties',
            title: 'Laipni lūdzam atpakaļ',
        },
        placeholders: {
            email: 'jusu@piemers.lv',
            full_name: 'Jūsu pilns vārds',
            join_code: 'piem. ABC12345',
            organization_name: 'piem. Riga Fast Delivery',
            password: '••••••••',
        },
        register: {
            already_have_account: 'Jau ir konts?',
            create_account: 'Izveidot kontu',
            create_organization: 'Izveidot jaunu organizāciju',
            create_organization_hint: 'Sāciet darbu ar jaunu komandu',
            description:
                'Pievienojieties organizācijai un sāciet pārvaldīt piegādes',
            join_organization: 'Pievienoties esošai organizācijai',
            join_organization_hint: 'Izmantojiet uzaicinājuma kodu',
            personal_details: 'Personīgā informācija',
            title: 'Izveidot kontu',
        },
        reset_password: {
            description: 'Lūdzu, ievadiet jauno paroli',
            submit: 'Atiestatīt paroli',
            title: 'Atiestatīt paroli',
        },
        roles: {
            courier: 'Kurjers',
            dispatcher: 'Dispečers',
        },
    },
    common: {
        actions: {
            back: 'Atpakaļ',
            back_to_dashboard: 'Atpakaļ uz paneli',
            cancel: 'Atcelt',
            clear: 'Notīrīt',
            copy_code: 'Kopēt kodu',
            copy_link: 'Kopēt saiti',
            save: 'Saglabāt',
            search: 'Meklēt',
        },
        app_name: 'Maršrutu plānotājs',
        fields: {
            address: 'Adrese',
            city: 'Pilsēta',
            client: 'Klients',
            courier: 'Kurjers',
            date: 'Datums',
            email: 'E-pasts',
            latitude: 'Platums',
            longitude: 'Garums',
            name: 'Nosaukums',
            notes: 'Piezīmes',
            organization: 'Organizācija',
            phone: 'Tālrunis',
            role: 'Loma',
            status: 'Statuss',
            street: 'Iela',
            time_from: 'Laiks no',
            time_to: 'Laiks līdz',
        },
        language: 'Valoda',
        languages: {
            en: 'Angļu',
            lv: 'Latviešu',
        },
        roles: {
            admin: 'Administrators',
            courier: 'Kurjers',
            dispatcher: 'Dispečers',
        },
        statuses: {
            assigned: 'Piešķirts',
            cancelled: 'Atcelts',
            completed: 'Pabeigts',
            done: 'Izpildīts',
            failed: 'Neizdevās',
            in_progress: 'Procesā',
            new: 'Jauns',
            pending: 'Gaida',
            planned: 'Plānots',
        },
    },
    app: {
        navigation: {
            active_route: 'Aktīvais maršruts',
            addresses: 'Adreses',
            administration: 'Administrēšana',
            clients: 'Klienti',
            completed_orders: 'Pabeigtie pasūtījumi',
            dashboard: 'Panelis',
            navigation: 'Navigācija',
            orders: 'Pasūtījumi',
            organizations: 'Organizācijas',
            platform: 'Platforma',
            routes: 'Maršruti',
            users: 'Lietotāji',
        },
        shell: {
            close_navigation: 'Aizvērt navigāciju',
            no_organization: 'Organizācija nav piešķirta',
            platform_admin: 'Platformas administrēšana',
            settings: 'Iestatījumi',
            sign_out: 'Izrakstīties',
        },
        tables: {
            showing: 'Rādīti :count :noun',
            sort: 'Kārtot:',
        },
    },
    dashboard: {
        admin: {
            description: 'Platformas lietotāju un organizāciju pārskats.',
            organizations_meta: 'Aktīvās organizācijas platformā',
            recent_organizations: 'Jaunākās organizācijas',
            recent_organizations_description:
                'Jaunākās organizācijas un to uzaicinājuma kodi.',
            recent_users: 'Jaunākie lietotāji',
            recent_users_description: 'Jaunāk izveidotie konti visā platformā.',
            users_meta: 'Reģistrētie konti visās lomās',
        },
        dispatcher: {
            addresses_meta: 'Saglabātie piegādes galamērķi',
            clients_meta: 'Pārvaldītie klientu ieraksti',
            copy_code: 'Kopēt kodu',
            copy_link: 'Kopēt saiti',
            description:
                'Laipni atpakaļ. Šodienas pārskats organizācijai :organization.',
            invite: 'Uzaicināt organizācijā',
            organization_id: 'ID #:id',
            pending_orders: 'Gaidošie pasūtījumi',
            pending_orders_description:
                'Pasūtījumi, kuriem vajadzīga uzmanība vai piešķiršana.',
            pending_orders_meta: 'Jāapstrādā vai jāpiešķir',
            quick_actions: 'Ātrās darbības',
            routes_meta: 'Izveidotie piegādes maršruti',
            total_orders_meta: 'Visi piegādes pasūtījumi',
            upcoming_routes: 'Gaidāmie maršruti',
            upcoming_routes_description:
                'Nākamie plānotie maršruti jūsu organizācijai.',
        },
        empty: {
            no_organizations: 'Organizācijas vēl nav izveidotas.',
            no_pending_orders: 'Pašlaik nav gaidošu pasūtījumu.',
            no_routes: 'Maršruti vēl nav saplānoti.',
            no_summary: 'Šim kontam vēl nav pieejams pārskats.',
            no_users: 'Lietotāji vēl nav izveidoti.',
        },
        links: {
            open_orders: 'Atvērt pasūtījumus ->',
            open_organizations: 'Atvērt organizācijas ->',
            open_routes: 'Atvērt maršrutus ->',
            open_users: 'Atvērt lietotājus ->',
        },
        title: 'Panelis',
    },
    settings: {
        appearance: {
            description: 'Atjauniniet konta izskata iestatījumus',
            title: 'Izskata iestatījumi',
        },
        delete_account: {
            confirm_description:
                'Pēc konta dzēšanas visi ar to saistītie resursi un dati tiks neatgriezeniski dzēsti. Lūdzu, ievadiet paroli, lai apstiprinātu konta dzēšanu.',
            confirm_title: 'Vai tiešām vēlaties dzēst kontu?',
            description: 'Dzēst kontu un visus ar to saistītos resursus',
            password_placeholder: 'Parole',
            title: 'Dzēst kontu',
            warning: 'Brīdinājums',
            warning_description:
                'Lūdzu, turpiniet uzmanīgi, šo darbību nevar atsaukt.',
        },
        layout: {
            appearance: 'Izskats',
            description: 'Pārvaldiet profilu un konta iestatījumus',
            password: 'Parole',
            profile: 'Profils',
            title: 'Iestatījumi',
        },
        password: {
            confirm_password: 'Apstiprināt paroli',
            current_password: 'Pašreizējā parole',
            description:
                'Pārliecinieties, ka konts izmanto garu un drošu paroli',
            new_password: 'Jaunā parole',
            save: 'Saglabāt paroli',
            title: 'Atjaunināt paroli',
        },
        profile: {
            description: 'Atjauniniet vārdu un e-pasta adresi',
            email_placeholder: 'E-pasta adrese',
            full_name_placeholder: 'Pilns vārds',
            saved: 'Saglabāts',
            title: 'Profila informācija',
        },
    },
    admin: {
        organizations: {
            average_users: 'Vidēji lietotāji organizācijā',
            average_users_meta: 'Noapaļots organizāciju vidējais rādītājs',
            back: 'Atpakaļ uz organizācijām',
            current_join_code: 'Pašreizējais uzaicinājuma kods',
            description:
                'Pārskatiet aktīvās organizācijas, pievienošanās kodus un lietotāju skaitu.',
            edit_description:
                'Atjauniniet organizācijas nosaukumu vai ģenerējiet jaunu pievienošanās kodu.',
            edit_title: 'Rediģēt organizāciju',
            empty_description:
                'Organizācijas parādīsies šeit, kad tās tiks izveidotas.',
            empty_title: 'Organizācijas nav atrastas',
            id_meta: 'Iekšējais platformas identifikators',
            join_code: 'Pievienošanās kods',
            name: 'Organizācijas nosaukums',
            regenerate: 'Ģenerēt jaunu kodu',
            regenerate_note:
                'Ģenerējot jaunu pievienošanās kodu, organizācija paliek tā pati, bet vecie uzaicinājuma kodi vairs nedarbojas.',
            title: 'Organizācijas',
            users: 'Lietotāji',
            users_meta: 'Lietotāji, kas piesaistīti organizācijai',
            users_this_org: 'Lietotāji šajā organizācijā',
        },
        users: {
            admins: 'Administratori',
            admins_meta: 'Globāla piekļuve platformai',
            all_meta: 'Visi reģistrētie konti',
            back: 'Atpakaļ uz lietotājiem',
            couriers: 'Kurjeri',
            couriers_meta: 'Piegādes darbinieku konti',
            current_organization: 'Pašreizējā organizācija: :organization',
            description:
                'Pārvaldiet vārdus, e-pastus, lomas un organizāciju piesaistes.',
            dispatchers: 'Dispečeri',
            dispatchers_meta: 'Organizāciju operatori',
            edit_description:
                'Piesardzīgi atjauniniet lomu un organizāciju. Administratora lomas lietotāji paliek globāli.',
            edit_title: 'Rediģēt lietotāju',
            empty_description:
                'Lietotāju konti parādīsies šeit, kad tie tiks izveidoti.',
            empty_title: 'Lietotāji nav atrasti',
            route_safety_note:
                'Kurjera ar esošiem maršruta ierakstiem maiņa tiek bloķēta drošības pārbaudēs backend pusē.',
            select_organization: 'Izvēlieties organizāciju',
            title: 'Lietotāji',
            total: 'Kopā lietotāji',
            admin_no_org: 'Administratoram nav nepieciešams',
        },
    },
    dispatcher: {
        addresses: {
            back: 'Atpakaļ uz adresēm',
            create_description: 'Pievienojiet jaunu piegādes adresi.',
            create_title: 'Izveidot adresi',
            description: 'Pārvaldiet piegādes adreses savai organizācijai.',
            edit_description: 'Atjauniniet izvēlēto adresi.',
            edit_title: 'Rediģēt adresi',
            empty_description:
                'Izveidojiet adresi, lai sāktu veidot piegādes pasūtījumus.',
            empty_title: 'Adreses vēl nav izveidotas',
            placeholder: 'Pilsēta, iela, koordinātas...',
            search_tag: 'Meklēšana: :term',
        },
        clients: {
            back: 'Atpakaļ uz klientiem',
            create_description: 'Pievienojiet jaunu klienta ierakstu.',
            create_title: 'Izveidot klientu',
            delete_confirm: 'Dzēst šo klientu?',
            description: 'Pārvaldiet klientu ierakstus savai organizācijai.',
            edit_description: 'Atjauniniet izvēlēto klienta ierakstu.',
            edit_title: 'Rediģēt klientu',
            empty_description:
                'Izveidojiet pirmo klientu, lai sāktu organizēt piegādes.',
            empty_title: 'Klienti vēl nav izveidoti',
            placeholder: 'Vārds, tālrunis...',
            search_tag: 'Meklēšana: :term',
        },
        filters: {
            enter: 'Enter',
            filters: 'Filtri',
            search: 'Meklēt',
        },
        nouns: {
            addresses: 'adreses',
            clients: 'klienti',
            orders: 'pasūtījumi',
            routes: 'maršruti',
        },
        orders: {
            back: 'Atpakaļ uz pasūtījumiem',
            create_description: 'Pievienojiet jaunu piegādes pasūtījumu.',
            create_title: 'Izveidot pasūtījumu',
            delete_confirm: 'Dzēst šo pasūtījumu?',
            description: 'Pārvaldiet piegādes pasūtījumus savai organizācijai.',
            edit_description: 'Atjauniniet piegādes pasūtījuma detaļas.',
            edit_title: 'Rediģēt pasūtījumu',
            empty_description:
                'Mainiet filtrus vai izveidojiet jaunu pasūtījumu.',
            empty_title: 'Pasūtījumi nav atrasti',
            order_number: 'Pasūtījums #:id',
            placeholder: 'Klients, adrese, datums, statuss, piezīmes...',
        },
        routes: {
            assign_orders: 'Piešķirt pasūtījumus',
            back: 'Atpakaļ uz maršrutiem',
            create_description:
                'Izveidojiet dienas maršrutu un piešķiriet pieejamos pasūtījumus.',
            create_title: 'Izveidot maršrutu',
            description: 'Pārvaldiet kurjeru dienas maršrutus.',
            empty_description:
                'Izveidojiet maršrutu, lai piešķirtu pasūtījumus kurjeriem.',
            empty_title: 'Maršruti vēl nav izveidoti',
            placeholder: 'Kurjers, klients, adrese, datums, statuss...',
            stops_count: ':count pieturas',
            unassigned_courier: 'Kurjers nav piešķirts',
        },
        sort: {
            city_asc: 'Pilsēta (A-Z)',
            city_desc: 'Pilsēta (Z-A)',
            courier_asc: 'Kurjers (A-Z)',
            courier_desc: 'Kurjers (Z-A)',
            date_asc: 'Datums (vecākais)',
            date_desc: 'Datums (jaunākais)',
            name_asc: 'Nosaukums (A-Z)',
            name_desc: 'Nosaukums (Z-A)',
            status_asc: 'Statuss (A-Z)',
            status_desc: 'Statuss (Z-A)',
            street_asc: 'Iela (A-Z)',
            street_desc: 'Iela (Z-A)',
            time_asc: 'Laiks (agrākais)',
            time_desc: 'Laiks (vēlākais)',
            updated_asc: 'Atjaunināts (vecākais)',
            updated_desc: 'Atjaunināts (jaunākais)',
        },
    },
    courier: {
        completed_orders: {
            completed: 'Pabeigts: :date',
            description:
                'Pārskatiet piegādātos pasūtījumus un vajadzības gadījumā atveriet pierādījuma failus.',
            empty: 'Jums vēl nav pabeigtu pasūtījumu.',
            open_proof: 'Atvērt pierādījuma failu',
            route_date: 'Maršruta datums: :date',
            title: 'Pabeigtie pasūtījumi',
        },
        dashboard: {
            completed_orders: 'Pabeigtie pasūtījumi',
            description:
                'Ātri atveriet norādes, atjauniniet piegādes progresu un pievienojiet pierādījumu no tālruņa.',
            done_routes: 'Izpildītie maršruti',
            no_coordinates: 'Šodienas pieturām vēl nav saglabātu koordinātu.',
            no_today_route: 'Šodien jums nav piešķirts maršruts.',
            next_stop: 'Nākamā pietura',
            open_all: 'Skatīt visus',
            route_status: 'Maršruta statuss',
            title: 'Kurjera panelis',
            total_stops: 'Kopā pieturas',
            upcoming_routes: 'Gaidāmie maršruti',
        },
        routes: {
            back: 'Atpakaļ uz paneli',
            completed_empty: 'Jums vēl nav pabeigtu maršrutu.',
            completed_description: 'Pārskatiet jau pabeigtos maršrutus.',
            completed_title: 'Izpildītie maršruti',
            planned_stops: ':count plānotas pieturas',
            upcoming_description:
                'Skatiet maršrutus, kas jums piešķirti pēc šodienas.',
            upcoming_empty: 'Nav piešķirtu gaidāmo maršrutu.',
            upcoming_title: 'Gaidāmie maršruti',
        },
        today_route: 'Šodienas maršruts',
        stop: {
            arrived: 'Ieradās',
            completed: 'Pabeigts',
            failed: 'Neizdevās',
            fail_reason: 'Neizdošanās iemesls',
            fail_reason_value: 'Neizdošanās iemesls: :reason',
            google_maps: 'Atvērt Google Maps',
            open_file: 'Atvērt failu',
            order_number: 'Pasūtījums #:id',
            proof_uploaded: 'Pierādījums augšupielādēts:',
            save_failed: 'Saglabāt neveiksmīgu statusu',
            stop_number: 'Pietura :number',
            upload_proof: 'Augšupielādēt pierādījumu',
            upload_proof_photo: 'Augšupielādēt pierādījuma foto',
            waze: 'Atvērt Waze',
        },
    },
    landing: {
        about: {
            benefits: {
                control: {
                    description:
                        'Visi pasūtījumi, maršruti un kurjeri vienuviet. Dispečeri var plānot un pārraudzīt visu procesu no vienas platformas.',
                    title: 'Centralizēta kontrole',
                },
                realtime: {
                    description:
                        'Sekojiet piegāžu statusiem un saņemiet atjauninājumus tiešsaistē. Nekādu komunikācijas problēmu vai zaudētas informācijas.',
                    title: 'Reāllaika pārskatāmība',
                },
                structured: {
                    description:
                        'Aizstājiet Excel tabulas un neformālu saziņu ar profesionālu rīku, kas paredzēts specifiskiem loģistikas uzdevumiem.',
                    title: 'Strukturēta pieeja',
                },
            },
            intro: 'Maršrutu plānotājs ir iekšēja web lietojumprogramma, kas paredzēta loģistikas uzņēmumiem. Sistēma nodrošina centralizētu un strukturētu pieeju pasūtījumu pārvaldībai, maršrutu plānošanai un piegāžu izpildes kontrolei reāllaikā.',
            title: 'Par sistēmu',
        },
        cta: {
            description:
                'Pieprasiet piekļuvi maršrutu plānotājam un pārvaldiet piegādes efektīvāk',
            title: 'Gatavi sākt?',
        },
        features: {
            audit: {
                description:
                    'Pilnīga visu darbību vēsture ar audita žurnālu. Izsekojiet, kas un kad veica izmaiņas sistēmā.',
                title: 'Audita žurnāls',
            },
            capacity: {
                description:
                    'Pārvaldiet kurjeru kapacitāti un transportlīdzekļu tipus. Izsekojiet pieejamību un slodzi.',
                title: 'Kurjeru kapacitāte',
            },
            export: {
                description:
                    'Ģenerējiet detalizētus CSV eksportus un drukājamas maršrutu lapas. Analizējiet piegāžu vēsturi un efektivitāti.',
                title: 'Pārskati un eksports',
            },
            pod: {
                description:
                    'Kurjeri var ievākt foto vai parakstu kā piegādes pierādījumu, kas tiek saglabāts sistēmā.',
                title: 'Piegādes pierādījums',
            },
            roles: {
                description:
                    'Lomas balstīta piekļuve: dispečeri, kurjeri, administratori. Katra loma ar atbilstošām tiesībām.',
                title: 'Lomu pārvaldība',
            },
            routes: {
                description:
                    'Izveidojiet un pārkārtojiet maršrutus ar intuitīvu interfeisu. Optimizējiet piegāžu secību atbilstoši vajadzībām.',
                title: 'Maršrutu plānošana',
            },
            statuses: {
                description:
                    'Piegādes statusi tiek atjaunināti tiešsaistē: gaidīšana, ceļā, piegādāts vai neizdevies. Visi redz aktuālo stāvokli.',
                title: 'Reāllaika statusi',
            },
            windows: {
                description:
                    'Definējiet piegādes laika logus un sekojiet prognozētajam ierašanās laikam katram pasūtījumam.',
                title: 'Laika logi un ETA',
            },
            title: 'Funkcionalitāte',
        },
        footer: {
            project: 'Izglītojošs/iekšējs projekts',
            subtitle: 'Iekšējā loģistikas pārvaldības sistēma',
            title: 'Maršrutu plānotājs kurjeriem',
        },
        header: {
            about: 'Par sistēmu',
            features: 'Funkcionalitāte',
            how_it_works: 'Kā tas darbojas',
            menu: 'Atvērt izvēlni',
            users: 'Kam paredzēts',
        },
        hero: {
            learn_more: 'Uzzināt vairāk',
            photo: 'Foto',
            subtitle:
                'Iekšējā web sistēma sīkajām un vidējām piegādes kompānijām. Aizstājiet Excel tabulas ar profesionālu maršrutu plānošanas rīku.',
            title: 'Pārvaldiet kurjeru maršrutus efektīvi un strukturēti',
        },
        how: {
            steps: {
                assign: {
                    description:
                        'Dispečers izveido un piešķir pasūtījumus kurjeriem, norādot adreses un laika logus.',
                    title: 'Pasūtījumu izveide',
                },
                deliver: {
                    description:
                        'Kurjeri izpilda piegādes ar tiešsaistes statusa atjauninājumiem katrā posmā.',
                    title: 'Piegādes izpilde',
                },
                proof: {
                    description:
                        'Tiek ievākts piegādes pierādījums - fotoattēls vai paraksts.',
                    title: 'Piegādes apstiprinājums',
                },
                reports: {
                    description:
                        'Automātiski ģenerēti pārskati eksportam, analīzei un dokumentācijai.',
                    title: 'Pārskatu ģenerēšana',
                },
                routes: {
                    description:
                        'Maršruti tiek sakārtoti un pārkārtoti ērtai piegādes secībai.',
                    title: 'Maršrutu organizēšana',
                },
            },
            title: 'Kā tas darbojas',
        },
        sign_in: 'Pierakstīties',
        users: {
            courier: {
                benefits: {
                    proof: 'Ievāciet piegādes pierādījumu (foto/paraksts)',
                    routes: 'Skatiet savus maršrutus un piegādes adreses',
                    status: 'Atjauniniet piegāžu statusus ar vienu klikšķi',
                },
                subtitle: 'Vienkārša un skaidra piegāžu izpilde',
                title: 'Kurjeriem',
            },
            dispatcher: {
                benefits: {
                    couriers:
                        'Sekojiet visiem kurjeriem un to piegādēm reāllaikā',
                    orders: 'Ātri izveidojiet un organizējiet pasūtījumus',
                    routes: 'Optimizējiet maršrutus ar vizuālu pārkārtošanu',
                },
                subtitle: 'Centralizēta maršrutu plānošana un pārvaldība',
                title: 'Dispečeriem',
            },
            title: 'Kam paredzēts',
        },
    },
} as const;

export default lv;
