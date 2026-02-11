export const howItWorksSteps = [
    {
        title: 'Pasūtījumu izveide',
        description:
            'Dispečers izveido un piešķir pasūtījumus kurjeriem, norādot adreses un laika logus.',
    },
    {
        title: 'Maršrutu organizēšana',
        description:
            'Maršruti tiek sakārtoti un pārkārtoti optimālai piegādes secībai ar ērtiem pārvelk-un-novieto rīkiem.',
    },
    {
        title: 'Piegādes izpilde',
        description:
            'Kurjeri izpilda piegādes ar tiešsaistes statusa atjauninājumiem katrā posmā.',
    },
    {
        title: 'Piegādes apstiprinājums',
        description:
            'Tiek ievākts piegādes pierādījums - fotoattēls vai paraksts.',
    },
    {
        title: 'Pārskatu ģenerēšana',
        description:
            'Automātiski ģenerēti pārskati PDF vai XLSX formātā analīzei un dokumentācijai.',
    },
] as const;

export const featureCards = [
    {
        icon: '📍',
        title: 'Maršrutu plānošana',
        description:
            'Izveidojiet un pārkārtojiet maršrutus ar intuitīvu pārvelk-un-novieto interfeisu. Optimizējiet piegāžu secību atbilstoši vajadzībām.',
    },
    {
        icon: '🚚',
        title: 'Kurjeru kapacitāte',
        description:
            'Pārvaldiet kurjeru kapacitāti un transportlīdzekļu tipus. Izsekojiet pieejamību un slodzi.',
    },
    {
        icon: '⏰',
        title: 'Laika logi un ETA',
        description:
            'Definējiet piegādes laika logus un sekojiet prognozētajam ierašanās laikam (ETA) katram pasūtījumam.',
    },
    {
        icon: '🔄',
        title: 'Reāllaika statusi',
        description:
            'Piegādes statusi tiek atjaunināti tiešsaistē: gaidīšana, ceļā, piegādāts, atcelts. Visu redz visi dalībnieki.',
    },
    {
        icon: '✓',
        title: 'Piegādes pierādījums',
        description:
            'Kurjeri var ievākt foto vai parakstu kā piegādes pierādījumu, kas tiek saglabāts sistēmā.',
    },
    {
        icon: '📊',
        title: 'Pārskati un eksports',
        description:
            'Ģenerējiet detalizētus pārskatus PDF vai XLSX formātā. Analizējiet piegāžu vēsturi un efektivitāti.',
    },
    {
        icon: '🔒',
        title: 'Audita žurnāls',
        description:
            'Pilnīga visu darbību vēsture ar audita žurnālu. Izsekojiet, kas un kad veica izmaiņas sistēmā.',
    },
    {
        icon: '👥',
        title: 'Lomu pārvaldība',
        description:
            'Lomas balstīta piekļuve: dispečeri, kurjeri, administratori. Katra loma ar atbilstošām tiesībām.',
    },
] as const;

export const targetUsers = [
    {
        title: 'Dispečeriem',
        subtitle: 'Centralizēta maršrutu plānošana un pārvaldība',
        benefits: [
            'Ātri izveidojiet un organizējiet pasūtījumus',
            'Optimizējiet maršrutus ar vizuālu pārkārtošanu',
            'Sekojiet visiem kurjeriem un to piegādēm reāllaikā',
        ],
    },
    {
        title: 'Kurjeriem',
        subtitle: 'Vienkārša un skaidra piegāžu izpilde',
        benefits: [
            'Skatiet savus maršrutus un piegādes adreses',
            'Atjauniniet piegāžu statusus ar vienu klikšķi',
            'Ievāciet piegādes pierādījumu (foto/paraksts)',
        ],
    },
] as const;
