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
        app_name: 'Maršrutu plānotājs',
        language: 'Valoda',
        languages: {
            en: 'Angļu',
            lv: 'Latviešu',
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
