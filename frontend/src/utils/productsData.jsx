//Lista de Categorias en orden que aparecen
export const products = [
  { id: 1, name: 'Air Fryer' },
  { id: 2, name: 'Aspiradora' },
  { id: 3, name: 'Aspiradora Robot' },
  { id: 16, name: 'Anafe eléctrico' },
  { id: 17, name: 'Anafe a inducción' },
  { id: 4, name: 'Cafetera' },
  { id: 5, name: 'Cava de Vino' },
  { id: 18, name: 'Cocina eléctrica' },
  { id: 7, name: 'Estufa eléctrica' },
  { id: 8, name: 'Freidora industrial' },
  { id: 9, name: 'Horno eléctrico' },
  { id: 15, name: 'Horno empotrable' },
  { id: 10, name: 'Microondas' },
  { id: 13, name: 'Televisor' },
  { id: 14, name: 'Ventilador' },
  { id: 19, name: 'Heladera' },
  { id: 20, name: 'Freezer' },
  { id: 21, name: 'Secadora de Pelo' },
  { id: 22, name: 'Plancha de Pelo' },
  { id: 23, name: 'Plancha de Ropa' },
  { id: 24, name: 'Licuadora' },
  { id: 25, name: 'Lustradora' },
  { id: 26, name: 'Calefactor' },
]

// Lista de IDs de categorías con NEW TAG
export const newCategoryIds = [21, 22, 23, 24, 25, 26]

export const discountCategoryIds = [10, 9, 14]

//Detalles adicionales por Categorias
export const additionalDetailsConfig = [
    {
        categoryId: 14,
        categoryName: "Ventilador",
        label: "¿Su ventilador es de ...?",
        type: "select",
        options: [
            { value: "pie", label: "Pie" },
            { value: "pared", label: "Pared" },
        ]
    }
]

//Marcas por Categorias
export const detailedBrandsByCategory = {
    1: {
        name: 'Air Fryer',
        brands: {
            'Nef': ['TurboCook'],
            'Philips': [],
            'Peabody': [],
            'Suono': [],
            'Zego': [],
            'Winco': [],
            'Yelmo': [],
            'Oryx': [],
            'Moulinex': [],
            'Atma': [],
            'Ultracomb': [],
            'Otros': []
        }
    },
    12: {
        name: 'Smartphone',
        brands: {
            'Apple': [
                'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
                'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
                'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
                'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
                'iPhone SE (2022)', 'iPhone SE (2020)',
                'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
                'iPhone XR', 'iPhone XS', 'iPhone XS Max',
                'iPhone X',
                'iPhone 8', 'iPhone 8 Plus',
                'iPhone 7', 'iPhone 7 Plus'
            ],
            'Samsung': [
                'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra',
                'Galaxy S21', 'Galaxy S21+', 'Galaxy S21 Ultra', 'Galaxy S21 FE',
                'Galaxy S20', 'Galaxy S20+', 'Galaxy S20 Ultra', 'Galaxy S20 FE',
                'Galaxy S10', 'Galaxy S10+', 'Galaxy S10e', 'Galaxy S10 Lite',
                'Galaxy Note 20', 'Galaxy Note 20 Ultra',
                'Galaxy Note 10', 'Galaxy Note 10+', 'Galaxy Note 10 Lite',
                'Galaxy Note 9',
                'Galaxy Note 8',
                'Galaxy A52', 'Galaxy A52s', 'Galaxy A72', 'Galaxy A32', 'Galaxy A12', 'Galaxy A02s',
                'Galaxy A51', 'Galaxy A71', 'Galaxy A31', 'Galaxy A21s', 'Galaxy A11', 'Galaxy A01',
                'Galaxy A50', 'Galaxy A70', 'Galaxy A30', 'Galaxy A20', 'Galaxy A10',
                'Galaxy Z Fold 3', 'Galaxy Z Flip 3', 'Galaxy Z Fold 2', 'Galaxy Z Flip 2',
                'Galaxy Z Fold', 'Galaxy Z Flip'
            ],
            'Xiaomi': ['Mi 11', 'Redmi Note 10', 'Poco X3', 'Mi 10T', 'Mi 9', 'Redmi Note 9', 'Mi Note 10', 'Redmi Note 8', 'Mi Mix 3', 'Mi 8'],
            'Motorola': ['Moto G100', 'Moto Edge 20', 'Moto G Power', 'Moto G Stylus', 'Moto G Fast', 'Moto E'],
            'LG': ['Velvet', 'Wing', 'V60 ThinQ', 'G8 ThinQ', 'G7 ThinQ'],
            'Huawei': ['P50 Pro', 'Mate 40 Pro', 'P30 Pro', 'Mate 20 Pro', 'P20 Pro'],
            'Nokia': ['8.3 5G', '5.4', '3.4', '2.4', '7.2', '6.2'],
            'Alcatel': ['1S', '3X', '1SE', '5X', '3V', '1V'],
            'Otros': []
        }
    },
    13: {
        name: 'Televisor',
        brands: {
            'Samsung': [],
            'LG': [],
            'Sony': [],
            'Philips': [],
            'Panasonic': [],
            'TCL': [],
            'Hisense': [],
            'Vizio': [],
            'Apple': ['Apple TV 4K (2nd generation)', 'Apple TV 4K (1st generation)', 'Apple TV HD'],
            'ADMIRAL': [],
            'JVC': [],
            'THC': [],
            'Top House': [],
            'RCA': [],
            'Ken Brown': [],
            'Sanyo': [],
            'Otros': [],
        }
    },   
    6: {
        name: 'Consola',
        brands: {
            'Sony': ['PlayStation 5','PlayStation 5 Pro' ,'PlayStation 4 Pro', 'PlayStation 4 Slim', 'PlayStation 4', 'PlayStation 3'],
            'Microsoft': ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox 360', 'Original Xbox'],
            'Nintendo': ['Switch', 'Switch Lite', 'Switch OLED', '3DS XL', '2DS', 'Wii U'],
            'Otros': []
        }
    },
    11: {
        name: 'Notebook',
        brands: {
            'Apple': ['MacBook Air', 'MacBook Pro 14', 'MacBook Pro 16', 'MacBook Air 13', 'MacBook Pro 13', 'MacBook 12'],
            'Dell': ['XPS 15', 'XPS 13', 'Inspiron 15', 'Inspiron 14', 'Alienware m15', 'G5 15'],
            'HP': ['Spectre x360', 'Envy 15', 'Pavilion 14', 'OMEN 15', 'Stream 14', 'Elite Dragonfly'],
            'Lenovo': ['ThinkPad X1 Carbon', 'Yoga 9i', 'IdeaPad 5', 'Legion 5', 'ThinkBook 14', 'Flex 5'],
            'Acer': ['Swift 5', 'Aspire 5', 'Predator Helios 300', 'Spin 3', 'Chromebook 314', 'Nitro 5'],
            'Asus': ['ZenBook 14', 'ROG Zephyrus G14', 'VivoBook 15', 'TUF Gaming A15', 'Chromebook Flip C434', 'ExpertBook B9'],
            'MSI': ['GS66 Stealth', 'GE76 Raider', 'Prestige 14', 'Modern 15', 'Creator 15', 'GF63 Thin'],
            'Razer': ['Blade 15', 'Blade Stealth 13', 'Blade Pro 17', 'Blade 14', 'Razer Book 13', 'Razer Blade Stealth'],
            'Inspiron': [],
            'Otros': []
        }
    },
    10: {
        name: 'Microondas',
        brands: {
            'Samsung': [],
            'LG': [],
            'Panasonic': [],
            'Whirlpool': [],
            'Sharp': [],
            'Toshiba': [],
            'Daewoo': [],
            'Philco': [],
            'BGH QuickChef': [''],
            'RCA': [],
            'Atma': [''],
            'Ariston': [],
            'Westinghouse': [],
            'Eslabón de Lujo': [],
            'Top House': [],
            'Likon': [],
            'Hitplus': [],
            'Otros': []
        }    
    },
    9: {
        name: 'Horno Eléctrico',
        brands: {
            'Breville': [],
            'Cuisinart': [],
            'Panasonic': ['FlashXpress'],
            'Oster': [],
            'Black & Decker': [],
            'Hamilton Beach': [],
            'Smeg': [],
            'Atma': [],
            'Enova': [],
            'Kanji Home': [],
            'BGH': [],
            'Ultracomb': [],
            'Philco': [],
            'Yelmo': [],
            'Bonn': [],
            'Ken Brown': [],
            'Otros': []
        }
    },
    4: {
        name: 'Cafetera',
        brands: {
            'Nespresso': ['Essenza Mini', 'Pixie', 'Citiz', 'Lattissima Pro', 'VertuoPlus', 'Inissia', 'Creatista', 'Maestria'],
            'Keurig': ['K-Elite', 'K-Classic', 'K-Mini', 'K-Supreme Plus', 'K-Slim', 'K-Duo', 'K-Cafe', 'K-Compact'],
            'DeLonghi': ['Dinamica', 'Magnifica', 'Eletta', 'La Specialista'],
            'Breville': [],
            'Mr. Coffee': ['Easy Measure', 'Cafe Barista', 'BVMC-PSTX95'],
            'Philips': [],
            'Oster': ['Prima Latte'],
            'Hamilton Beach': ['FlexBrew'],
            'Smart Life': [],
            'Atma': [],
            'Ultracomb': [],
            'Espresso': [],
            'Otros': []
        }    
    },
    3: {
        name: 'Aspiradora Robot',
        brands: {
            'Samsung': ['Powerbot-e', 'Jet Bot+', 'Jet Bot'],
            'iRobot': ['Roomba 675', 'Roomba 675 Wi-Fi'],
            'Smart Tek': ['Ava Mini','Ava Mini 2', 'Ava Pro Max', 'Ava Pro X'],
            'Xiaomi': ['E10', 'S10', 'E5', 'X20+', 'E10C', 'X10', 'Q8 Max', 'X20 Pro'],
            'Unnic': ['R10'],
            'Gadnic': ['Clean Duo Z900', 'Z1800', 'Z2000','3' ,'4', '5'],
            'Yelmo': ['As-7070'],
            'Daewoo': ['Delta', 'Sena', 'Maxpro', 'Rider'],
            'Fika': [],
            'Otros': []
        }
    },
    5: {
        name: 'Cava de Vino',
        brands: {
            'Whynter': [],
            'NewAir': [],
            'NutriChef': [],
            'Ivation': [],
            'Kalamera': [],
            'Phiestina': [],
            'Philco': [],
            'Peabody': [],
            'Liliana': [],
            'Exahome': [],
            'Winco': [],
            'Airmax': [],
            'Otros': []
        }
    },
    14: {
        name: 'Ventilador',
        brands: {
            'Liliana': [],
            'Electrolux': [],
            'Otros': []
        }
    },
    7: {
        name: 'Estufa eléctrica',
        brands: {
            'Dyson': ['AM09 Hot + Cool', 'AM09 Hot + Cool'],
            'DeLonghi': [],
            'Honeywell': [],
            'Vornado': [],
            'Lasko': [],
            'Duraflame': ['3D Infrared Electric Fireplace', 'Portable Electric'],
            'Philco': [],
            'Atma': [],
            'Liliana': [],
            'Exahome': [],
            'Otros': []
        }    
    },
    2: {
        name: 'Aspiradora',
        brands: {
            'Samsung': [],
            'Philips': [],
            'Electrolux': [],
            'Black & Decker': [],
            'Philco': [],
            'Daewoo': [],
            'Atma': [],
            'Ultracomb': [],
            'Yelmo': [],
            'Einhell': [],
            'Gadnic': [],
            'Winco': [],
            'Suono': [],
            'Otros': []
        }
    },
    8: {
        name: 'Freidora Industrial',
        brands: {
            'Daewoo': [],
            'Sol Real': [],
            'Turboblender': [],
            'Morelli': [],
            'Depaolo': [],
            'Otros': []
        }
    },
    15: {
        name: 'Horno Empotrable',
        brands: {
            'Atma': [],
            'Samsung': [],
            'Longvie': [],
            'Maverick': [],
            'Florencia': [],
            'Whirpool': [],
            'LG': [],
            'Vondom': [],
            'Morelli': [],
            'Otros': []
        }
    },
    16: {
        name: 'Anafe eléctrico',
        brands: {
            'Westinghouse': [],
            'Oryx': [],
            'Winco': [],
            'Liliana': [],
            'Spica': [],
            'Ultracomb': [],
            'Otros': []
        }
    },
    17: {
        name: 'Anafe a Inducción',
        brands: {
            'Samsung': [],
            'Ormay': [],
            'Telefunken': [],
            'Vondom': [],
            'Electrolux': [],
            'Whirpool': [],
            'Ariston': [],
            'Florencia': [],
            'Top House': [],
            'Otros': []
        }
    },
    18: {
        name: 'Cocina Eléctrica',
        brands: {
            'Philco': [],
            'Atma': [],
            'Vitta': [],
            'Kanji': [],
            'Electrolux': [],
            'Ariston': [],
            'Kacemaster': [],
            'Otros': []
        }
    },
    19: {
        name: 'Heladera',
        brands: {
            'Samsung': [],
            'LG': [],
            'Whirlpool': [],
            'Electrolux': [],
            'Philco': [],
            'Patrick': [],
            'Gafa': [],
            'Otros': []
        }
    },
    21: {
      name: 'Secadora de Pelo',
      brands: {
        'Philips': [],
        'Gama': [],
        'Remington': [],
        'Atma': [],
        'Otros': []
      }
    },
    22: {
      name: 'Plancha de Pelo',
      brands: {
        'Gama': [],
        'Philips': [],
        'Remington': [],
        'Babyliss': [],
        'Otros': []
      }
    },
    23: {
      name: 'Plancha de Ropa',
      brands: {
        'Philips': [],
        'Atma': [],
        'Liliana': [],
        'Oster': [],
        'Otros': []
      }
    },
    24: {
      name: 'Licuadora',
      brands: {
        'Oster': [],
        'Philips': [],
        'Atma': [],
        'Liliana': [],
        'Otros': []
      }
    },
    25: {
      name: 'Lustradora',
      brands: {
        'Liliana': [],
        'Yelmo': [],
        'Atma': [],
        'Otros': []
      }
    },
    26: {
      name: 'Calefactor',
      brands: {
        'Liliana': [],
        'Atma': [],
        'Philco': [],
        'Electrolux': [],
        'Otros': []
      }
    },
}

//Steps para barra de progreso y variables dinamicas
export const steps = ["Categoría", "Marca", "Modelo", "Falla", "Datos", "Servicio"]

//Fallas por Categorias
export const faultsByCategory = {
    // Air Fryer
    1: ['No enciende', 'No calienta', 'Cocción desigual', 'Ruidos extraños', 'Salen chispas', 'Humo', 'Olor a quemado', 'La pantalla no funciona', 'El temporizador no funciona', 'Se apaga sola', 'Fugas de aceite', 'Mantenimiento / Limpieza', 'Otra'],
    // Aspiradora
    2: ['No enciende', 'Pérdida de succión', 'Ruidos extraños', 'Fugas de aire', 'Problemas con el cable de alimentación', 'Problemas con el filtro', 'Problemas con el cepillo', 'Se apaga sola', 'Fugas de polvo', 'Mantenimiento / Limpieza', 'Otra'],
    // Aspiradora Robot
    3: ['No enciende', 'Ruidos extraños', 'Problemas con el motor', 'Fugas de líquido', 'Se apaga', 'Se sobrecalienta', 'Cambio de baterías', 'Problemas con los accesorios', 'Mantenimiento / Limpieza', 'Otra'],
    // Cafetera
    4: ['No enciende', 'Enciende no calienta', 'Enciende pero no traba', 'Pierde agua', 'No muele café', 'Olor a quemado', 'Salen chispas', 'Humo', 'Problemas con la bomba de agua', 'Mantenimiento / Limpieza', 'Otra'],
    // Cava de Vino
    5: ['No enciende', 'No enfría', 'Ruidos fuertes', 'Problemas con el termostato', 'Fugas de líquido refrigerante', 'Otra'],
    // Consola
    6: ['No enciende', 'Errores de sistema', 'No lee discos', 'Problemas con los joystick', 'Pantalla en negro', 'Sobrecalentamiento', 'Se congela', 'Falla de almacenamiento', 'Mantenimiento / Limpieza', 'Otra'],
    // Estufa eléctrica
    7: ['No enciende', 'No calienta', 'Olor a quemado', 'Salta la térmica', 'Problemas con el termostato', 'Se apaga sola', 'Otra'],
    // Freidora Industrial
    8: ['No enciende', 'No calienta', 'Olor a quemado', 'Salen chispas', 'Ruidos fuertes', 'Fuga de aceite', 'Problemas con el temporizador', 'Se apaga', 'Mantenimiento / Limpieza', 'Otra'],
    // Horno Eléctrico
    9: ['No enciende', 'Enciende no calienta', 'Olor a quemado', 'Salen chispas', 'Humo', 'Problemas con el temporizador', 'No cierra la puerta', 'No corta Temperatura', 'Velas Quemadas', 'Salta la térmica', 'Mantenimiento / Limpieza', 'Otra'],
    // Microondas
    10: ['No enciende', 'Enciende no calienta', 'Ruidos fuertes', 'Salen chispas', 'Problemas con el temporizador', 'Se apaga solo', 'Al inicio ruido fuerte', 'No gira el plato', 'Falla el teclado', 'Otra'],
    // Notebook
    11: ['No enciende', 'Pantalla rota', 'Pantalla Azul', 'No carga / problema con el cargador', 'Bisagras dañadas / rotas', 'No hay imagen', 'Se sobrecalienta', 'Se apaga', 'Mantenimiento / limpieza', 'Ingreso líquido / se mojó', 'Batería dura poco / no anda', 'Problemas de teclado', 'Otra'],
    // Smartphone
    12: ['No enciende', 'No inicia sistema', 'Pantalla rota / dañada', 'Falla pantalla táctil', 'Pantalla en negro / con líneas', 'No carga', 'Falla el audio', 'Problemas de batería', 'Problemas de software', 'Tapa trasera dañada', 'Otra'],
    // Televisor
    13: ['No enciende', 'No hay imagen', 'Sin sonido', 'Imagen distorsionada', 'Pantalla rota / golpeada', 'Problemas con el control remoto', 'Problemas con las conexiones HDMI/AV', 'Otra'],
    // Ventilador
    14: ['No enciende', 'Ruidos fuertes', 'No gira', 'Problemas con el motor', 'Vibración excesiva', 'Mantenimiento / Limpieza', 'Otra'],
    // Horno Empotrable
    15: ['No enciende', 'Enciende pero no calienta', 'Olor a quemado', 'Salen chispas', 'Humo', 'Problemas con el temporizador', 'No cierra la puerta', 'Salta la térmica', 'Mantenimiento / Limpieza', 'Otra'],
    // Anafe eléctrico
    16: ['No enciende', 'No calienta', 'Olor a quemado', 'Salta la térmica', 'Problemas con el termostato', 'Se apaga sola', 'Mantenimiento / Limpieza', 'Otra'],
    // Anafe a Inducción
    17: ['No enciende', 'No calienta', 'Error en el sensor', 'Pantalla táctil no responde', 'Se apaga sola', 'Mantenimiento / Limpieza', 'Otra'],
    // Cocina Eléctrica
    18: ['No enciende', 'No calienta', 'Olor a quemado', 'Salta la térmica', 'Problemas con el termostato', 'Se apaga sola', 'Mantenimiento / Limpieza', 'Otra'],
    // Heladera
    19: ['No enciende','No enfría','Enfría poco','Hace hielo en exceso','Pérdida de gas','Motor no arranca','Hace ruidos fuertes','Problemas en el termostato','Fugas de agua','Se apaga sola','Otra'],
    // Freezer
    20: ['No enciende','No congela','Pierde frío','Hace hielo en exceso','Pérdida de gas','Motor no arranca','Hace ruidos fuertes','Problemas en el termostato','Fugas de agua','Se apaga solo','Otra'],
    21: ['No enciende', 'No calienta', 'Se apaga sola', 'Otra'],
    22: ['No enciende', 'No calienta', 'Temperatura inestable', 'Otra'],
    23: ['No enciende', 'No calienta', 'Pierde agua', 'Otra'],
    24: ['No enciende', 'No gira', 'Ruidos extraños', 'Pierde líquido', 'Otra'],
    25: ['No enciende', 'No gira', 'Ruidos fuertes', 'Problema en motor', 'Otra'],
    26: ['No enciende', 'No calienta', 'Olor a quemado', 'Se apaga solo', 'Otra'],
    }

export const brandLogos = [
    { src: '/brands/apple.png', alt: 'Apple' },
    { src: '/brands/Samsung.png', alt: 'Samsung' },
    { src: '/brands/Microsoft.png', alt: 'Microsoft' },
    { src: '/brands/Sony_Log.png', alt: 'Sony' },
    { src: '/brands/HP.png', alt: 'HP' },
    { src: '/brands/Dell.png', alt: 'Dell' },
    { src: '/brands/LG.png', alt: 'LG' },
    { src: '/brands/Lenovo.png', alt: 'Lenovo' },
    { src: '/brands/Nintendo.png', alt: 'Nintendo' },
    { src: '/brands/Huawei.png', alt: 'Huawei' },
    { src: '/brands/Motorola.png', alt: 'Motorola' },
    { src: '/brands/Asus.png', alt: 'Asus' },
    { src: '/brands/Acer.png', alt: 'Acer' },
    { src: '/brands/Xbox.png', alt: 'Xbox' },
    { src: '/brands/Philips.png', alt: 'Philips' },
    { src: '/brands/TCL.png', alt: 'TCL' },
    { src: '/brands/HIsense.png', alt: 'Hisense' },
    { src: '/brands/BGH.png', alt: 'BGH' },
    { src: '/brands/Bangho.png', alt: 'Bangho' },
    { src: '/brands/Alcatel.png', alt: 'Alcatel' },
]

export const reviews = [
    {
        id: 1,
        name: 'marianocavallo',
        rating: 5,
        comment: 'El arreglo excelente y buscaron la forma de que sea mas económico por eso se merecen 5 estrellas, la unica sugerencia es que podrian haberle pasado un trapito aunque sea antes de entregarme la cafetera estaba muy sucia.',
        profilePic: 'https://lh3.googleusercontent.com/a-/ALV-UjWntJCKgN8yXnVDnoueAlxpEZIqQ_cn_wUbx2EV0OUDuqjR6Cfu=w72-h72-p-rp-mo-br100',
        timeAgo: 'Hace 3 semanas',
        url: 'https://www.google.com/maps/place/Electrosafe+Service+Reparaciones+de+Electrodomesticos/@-34.6448907,-58.3729082,15.75z/data=!4m8!3m7!1s0x95a32f86a4e7a6f9:0x48efe2a55af0f759!8m2!3d-34.6428301!4d-58.3745474!9m1!1b1!16s%2Fg%2F11rtm81rkx?entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D'
    },
    {
        id: 2,
        name: 'Telmo Gomez',
        rating: 5,
        comment: 'Me pasaron presupuesto rápido y por Whatsapp, llevé un horno eléctrico con anafes que no funcionaba uno de los anafes, luego de que lo llevé me dicen que se salvaban unas piezas así que me iba a salir la mitad más barato del presupuesto inicial. El técnico fue muy amable y claro es su explicación. El precio bastante accesible y fueron rápidos para resolverlo. MUY RECOMENDABLE !!!!',
        profilePic: 'https://lh3.googleusercontent.com/a-/ALV-UjVkaXiEWPzEjWIQ7MpItPw5i6_n8d5QSD3YYLWUtteLTiG3jd9G4w=w72-h72-p-rp-mo-ba3-br100',
        timeAgo: 'Hace 1 mes',
        url: 'https://www.google.com/maps/contrib/117480275805563837801/place/ChIJ-abnpIYvo5URWffwWqXi70g/@-32.7737796,-61.4454994,7z/data=!4m6!1m5!8m4!1e1!2s117480275805563837801!3m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D'
    },
    {
        id: 3,
        name: 'Vidalia Avalos',
        rating: 5,
        comment: 'Muy buen servicio!!! Increible el trabajo, funciona como nuevo, todo perfecto! Lo recomiendo👌👌 …',
        profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLZermqMpgm-jmmOuqM5wQXxGtoUSSW0TKFje0IDSdYzZ57HA=w60-h60-p-rp-mo-br100',
        timeAgo: 'Hace 1 mes',
        url: 'https://www.google.com/maps/contrib/105021577541357827002/place/ChIJ-abnpIYvo5URWffwWqXi70g/@-31.263779,-62.902739,7z/data=!4m6!1m5!8m4!1e1!2s105021577541357827002!3m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3Dhttps://lh3.googleusercontent.com/a-/ALV-UjXIvBS1tWHIzct7jS8DfNqIaX848yaKvpFsQ6TUPijVnK8qmnvj=w72-h72-p-rp-mo-ba2-br100'
    },
    {
        id: 4,
        name: 'Marcela Lattanzio',
        rating: 5,
        comment: 'Muy buen servicio, repararon mi microondas en dos días. Son muy amables en su atencion. Los recomiendo!!!',
        profilePic: 'https://lh3.googleusercontent.com/a-/ALV-UjW22pDPAtmOifY3xgE_DEQ9tLtrachkVLbB2FGVFJOHGqEUQQfqxA=w72-h72-p-rp-mo-br100',
        timeAgo: 'Hace 5 meses',
        url: 'https://www.google.com/maps/contrib/101441228288363802163/place/ChIJ-abnpIYvo5URWffwWqXi70g/@-36.7500741,-60.810749,7z/data=!4m6!1m5!8m4!1e1!2s101441228288363802163!3m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D'
    },
    {
        id: 5,
        name: 'Maria Florencia Gianni',
        rating: 5,
        comment: 'Super recomiendo! unos genios los chicos me solucionaron el problema de mi plancha de un dia para otro!',
        profilePic: 'https://lh3.googleusercontent.com/a-/ALV-UjUOuXbNU2y2reksHYdYpFBbB0OUiyqUWRxrLh3zVnrf6RhKqoc=w60-h60-p-rp-mo-br100',
        timeAgo: 'Hace 6 meses',
        url: 'https://www.google.com/maps/contrib/102927586818368431798?hl=es-419&ved=1t:31294&ictx=111'
    },
    {
        id: 6,
        name: 'Liliana Camaron',
        rating: 5,
        comment: 'Excelente atención, muy profesionales y  cumplen con los tiempos de entrega. Muy recomendables',
        profilePic: 'https://lh3.googleusercontent.com/a-/ALV-UjVjqMzU-Y_TdQRckdSy9N7mgcqEVPW476n8rXBd1EYlTu_IKHhNSg=w60-h60-p-rp-mo-br100',
        timeAgo: 'Hace 8 meses',
        url: 'https://www.google.com/maps/contrib/110487861240920629631?hl=es-419&ved=1t:31294&ictx=111'
    },
    {
        id: 7,
        name: 'Lucio Mejias',
        rating: 5,
        comment: 'Muy profesionales! Tenía una cava de vinos que parecía perdida y me la recuperaron! El mejor de service de Quilmes!',
        profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocL9AV7zpVhvbhxxJT3USnJ1YoZwefUGF55cGhVTV3PQP0WvXQ=w60-h60-p-rp-mo-br100',
        timeAgo: 'Hace un año',
        url: 'https://www.google.com/maps/contrib/112499526229381407473?hl=es-419&ved=1t:31294&ictx=111'
    },
    {
        id: 8,
        name: 'Carina Vidal',
        rating: 5,
        comment: 'Muy buena atención la freidora funciona muy bien después de la reparación',
        profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJFfxX8L9WdeWo6CFXhe19yxiae9eQRFzgk15S4q0Rr7ZK_Xg=w36-h36-p-rp-mo-br100',
        timeAgo: 'Hace un año',
        url: 'https://www.google.com/maps/contrib/118024432678148743515/place/ChIJ-abnpIYvo5URWffwWqXi70g/@-34.6428301,-58.3745474,17z/data=!4m6!1m5!8m4!1e1!2s118024432678148743515!3m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D'
    },
    {
        id: 9,
        name: 'maria fernanda Valdez',
        rating: 5,
        comment: 'Muy serio, repararon mi horno de pan, tenía otra falla y siguieron el tema hasta que lo solucionaron. Recomendable por la seriedad.',
        profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJFfxX8L9WdeWo6CFXhe19yxiae9eQRFzgk15S4q0Rr7ZK_Xg=w36-h36-p-rp-mo-br100',
        timeAgo: 'Hace un año',
        url: 'https://www.google.com/maps/contrib/106788830544499982223/place/ChIJ-abnpIYvo5URWffwWqXi70g/@-33.823181,-59.101088,9z/data=!4m6!1m5!8m4!1e1!2s106788830544499982223!3m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D'
    }
]

export const faqs = [
    {
      question: "¿Cómo funciona nuestro servicio?",
      answer: "Completás el formulario en la web y te contactamos por WhatsApp. Ahí te pedimos fotos o videos del problema (y de la etiqueta del equipo) para darte una cotización aproximada. Si estás de acuerdo, te generamos un código para que puedas traerlo a la sucursal, coordinar un retiro a domicilio (según tu ubicación) o enviarlo por correo. Al revisar el equipo, respetamos el valor cotizado siempre que coincida con lo que vimos en las fotos. Al hacer el proceso online, accedés a mejores precios."
    },
    {
      question: "¿Cómo se realiza la cotización?",
      answer: "Todo se hace por WhatsApp. Te pedimos fotos o videos del problema y la etiqueta del equipo. Con eso te damos una cotización aproximada y, si estás de acuerdo, te generamos un código para avanzar con el ingreso."
    },
    {
      question: "¿Qué opciones tengo para enviar o acercar el equipo?",
      answer: "Podés traerlo personalmente a nuestras sucursales (recomendado), pedir un retiro a domicilio (según zona) o enviarlo por Correo Argentino o Andreani. Siempre coordinamos antes por WhatsApp."
    },
    {
      question: "¿Dónde están ubicados?",
      answer: "Contamos con dos sucursales: una en Quilmes y otra en Barracas."
    },
    {
      question: "¿Qué pasa si decido no avanzar con la reparación?",
      answer: "En ese caso, se cobra el costo de revisión. También se cobra si el equipo no tiene reparación posible."
    },
    {
      question: "¿La revisión tiene algún costo?",
      answer: "Sí, solo si no querés hacer el arreglo o si el equipo no tiene solución. Si aceptás el presupuesto, la revisión ya está incluida."
    },
    {
      question: "¿Cuánto tarda el presupuesto final?",
      answer: "Una vez recibido el equipo, el tiempo estimado de revisión y envío de presupuesto es de 3 a 5 días hábiles."
    },
    {
      question: "¿Qué incluye la garantía?",
      answer: "Ofrecemos 30 días de garantía sobre la reparación realizada. Cubre exclusivamente el problema que se arregló."
    },
    {
      question: "¿Cómo hago el seguimiento del equipo?",
      answer: "Podés consultarnos directamente con su código por WhatsApp en cualquier momento."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Podés pagar con tarjeta de crédito, débito, transferencia bancaria o Mercado Pago."
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Sí. Almacenamos tu información en servidores seguros y aplicamos protocolos de seguridad estándar en la industria. Solo usamos tus datos para contactarte y hacer el seguimiento del servicio, y no los compartimos con terceros bajo ningún motivo."
    },
    {
      question: "¿Por qué confiar en nosotros?",
      answer: "Porque hacemos todo el proceso transparente desde el inicio, ofrecemos precios especiales online y trabajamos con técnicos especializados. Usamos repuestos de calidad, probamos el equipo antes de devolverlo y te enviamos fotos o videos del equipo funcionando para tu seguridad."
    }
]  

// === Mini Banner ===
export const bannerLink = "https://forms.gle/NXYeJaASrJtqxC6i6"

export const bannerTexts = [
  "🔧 Servicio Técnico Especializado en Electrodomésticos",
  "📲 Cotizá rápido por WhatsApp — Enviá fotos y te respondemos al momento",
  "⚡ ¿Tu electrodoméstico no funciona?",
  "📲 Cotizá ahora nos comunicamos por WhatsApp",
  "📍 Sucursal en Quilmes Vicente Lopez 770"
]

export const barriosCABA = [
    'Palermo', 'San Telmo', 'Puerto Madero', 'Recoleta', 'Belgrano',
    'Caballito', 'La Boca', 'Flores', 'Barracas', 'Almagro', 
    'Villa Devoto', 'Villa Urquiza', 'Saavedra', 'Villa Luro', 
    'Villa del Parque', 'Colegiales', 'Avellaneda', 'Mataderos', 
    'Liniers', 'Vélez Sarsfield', 'Nueva Pompeya', 'San Cristóbal', 
    'San Nicolás', 'Retiro', 'Monserrat', 'San Fernando', 
    'Balvanera', 'Villa Riachuelo', 'Constitución', 'San Carlos', 
    'Parque Chacabuco', 'Parque Patricios', 'Boedo', 'Paternal', 
    'Chacarita', 'Nuñez', 'Boca', 'La Paternal', 
    'Agronomía', 'Villa Ortúzar', 'Floresta', 'Parque Centenario',
    'Villa Crespo', 'Villa del Parque', 'Devoto', 'Monte Castro',
    'Cerro de la Gloria', 'San José'
]

export const alertConfig = [
    {
      category: "Televisor",
      fault: "Pantalla rota / golpeada",
      title: "Pantallas rotas o golpeadas",
      message: "Lamentablemente las pantallas que se rompen por golpes/caídas no tienen reparación, ni reemplazo viable ya que no se fabrican para repuesto. Si cuentas con un seguro de hogar, podemos emitir un presupuesto membretado para que lo presentes a tu aseguradora. Consulte el valor según el modelo de su equipo.",
      buttons: [
        { label: "Continuar", action: "continue" },
        { label: "Volver al inicio", action: "restart" },
      ],
    },
    // Agrega más alertas aca según sea necesario
]
  
export const equipoOptions = [
  { value: 'Air Fryer', label: 'Air Fryer' },
  { value: 'Aspiradora', label: 'Aspiradora' },
  { value: 'Aspiradora Robot', label: 'Aspiradora Robot' },
  { value: 'Cafetera', label: 'Cafetera' },
  { value: 'Cava de Vino', label: 'Cava de Vino' },
  { value: 'Televisor', label: 'Televisor' },
  { value: 'Estufa eléctrica', label: 'Estufa eléctrica' },
  { value: 'Freidora Industrial', label: 'Freidora Industrial' },
  { value: 'Horno Eléctrico', label: 'Horno Eléctrico' },
  { value: 'Horno Empotrable', label: 'Horno Empotrable' },
  { value: 'Microondas', label: 'Microondas' },
  { value: 'Ventilador', label: 'Ventilador' },
  { value: 'Anafe eléctrico', label: 'Anafe eléctrico' },
  { value: 'Anafe a Inducción', label: 'Anafe a Inducción' },
  { value: 'Cocina Eléctrica', label: 'Cocina Eléctrica' },
  { value: 'Notebook', label: 'Notebook' },
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Consola', label: 'Consola' },
  { value: 'Máquina de Pan', label: 'Máquina de Pan' },
  { value: 'Amasadora', label: 'Amasadora' },
  { value: 'Plancha de Pelo', label: 'Plancha de Pelo' },
  { value: 'Secadora de Pelo', label: 'Secadora de Pelo' },
  { value: 'Tostadora', label: 'Tostadora' },
  { value: 'Panchera', label: 'Panchera' },
  { value: 'Parlante', label: 'Parlante' },
  { value: 'Minipimer', label: 'Minipimer' },
  { value: 'Juguera', label: 'Juguera' },
  { value: 'Vaporera', label: 'Vaporera' },
  { value: 'Hidrolavadora', label: 'Hidrolavadora' },
  { value: 'Afeitadora', label: 'Afeitadora' },
  { value: 'Lavadora', label: 'Lavadora' },
  { value: 'Secarropas', label: 'Secarropas' },
  { value: 'Freidora', label: 'Freidora' },
  { value: 'Licuadora', label: 'Licuadora' },
  { value: 'Extractor', label: 'Extractor' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Horno de Pan', label: 'Horno de Pan' },
  { value: 'Caloventor', label: 'Caloventor' },
  { value: 'Lámpara LED', label: 'Lámpara LED' },
  { value: 'Rotopercutor', label: 'Rotopercutor' },
  { value: 'Radio', label: 'Radio' },
  { value: 'Velador', label: 'Velador' },
  { value: 'Procesadora', label: 'Procesadora' },
  { value: 'Pava Eléctrica', label: 'Pava Electrica'},
  { value: 'Otro/s', label: 'Otro'}
]

//Accesorios por equipos
export const equipmentAccessories = [
  {
    id: 1, // Air Fryer
    name: "Air Fryer",
    accessories: ["Bandeja", "Rejilla"]
  },
  {
    id: 2, // Aspiradora
    name: "Aspiradora",
    accessories: ["Bolsa", "Manguera", "Cepillo"]
  },
  {
    id: 3, // Aspiradora Robot
    name: "Aspiradora Robot",
    accessories: ["Base de carga", "Cepillos"]
  },
  {
    id: 4, // Cafetera
    name: "Cafetera",
    accessories: ["Recipiente de agua", "Bandeja"]
  },
  {
    id: 5, // Cava de Vino
    name: "Cava de Vino",
    accessories: ["Estantes"]
  },
  {
    id: 7, // Estufa eléctrica
    name: "Estufa eléctrica",
    accessories: ["Cable de alimentación"]
  },
  {
    id: 8, // Freidora industrial
    name: "Freidora industrial",
    accessories: ["Cesta", "Recipiente para aceite"]
  },
  {
    id: 9, // Horno eléctrico
    name: "Horno eléctrico",
    accessories: ["Rejilla", "Bandeja"]
  },
  {
    id: 10, // Microondas
    name: "Microondas",
    accessories: ["Plato"]
  },
  {
    id: 13, // Televisor
    name: "Televisor",
    accessories: ["Control remoto", "Cable de alimentación"]
  },
  {
    id: 14, // Ventilador
    name: "Ventilador",
    accessories: ["Cable de alimentación"]
  },
  {
    id: 15, // Horno empotrable
    name: "Horno empotrable",
    accessories: ["Rejilla", "Bandeja"]
  },
  {
    id: 16, // Anafe eléctrico
    name: "Anafe eléctrico",
    accessories: []
  },
  {
    id: 17, // Anafe a inducción
    name: "Anafe a inducción",
    accessories: ["Cable de alimentación"]
  },
  {
    id: 18, // Cocina eléctrica
    name: "Cocina eléctrica",
    accessories: ["Bandeja", "Rejilla"]
  },
  {
    id: 19, // Heladera
    name: "Heladera",
    accessories: ["Bandeja", "Estantes"]
  },
  {
    id: 20, // Freezer
    name: "Freezer",
    accessories: ["Bandeja", "Estantes", "Cajones"]
  },
  {
    id: 21,
    name: "Secadora de Pelo",
    accessories: ["Boquilla"]
  },
  {
    id: 22,
    name: "Plancha de Pelo",
    accessories: []
  },
  {
    id: 23,
    name: "Plancha de Ropa",
    accessories: []
  },
  {
    id: 24,
    name: "Licuadora",
    accessories: ["Vaso", "Tapa"]
  },
  {
    id: 25,
    name: "Lustradora",
    accessories: ["Cepillos"]
  },
  {
    id: 26,
    name: "Calefactor",
    accessories: ["Cable de alimentación"]
  },
];


// =========================
// ESTADOS DE SERVICIO - fuente única
// =========================
export const ESTADOS_SERVICIO = [
  // 🔴 VIEJOS (temporales)
  { key: 'pendiente', label: 'Pendiente', class: 'status-pendiente' },
  { key: 'recibido', label: 'Recibido', class: 'status-recibido' },
  { key: 'revision', label: 'En Revisión', class: 'status-revision' },
  { key: 'reparacion', label: 'En Reparación', class: 'status-reparacion' },
  { key: 'pruebas', label: 'En Pruebas', class: 'status-pruebas' },
  { key: 'listo', label: 'Listo para retirar', class: 'status-listo' },
  { key: 'entregado', label: 'Entregado', class: 'status-entregado' },
  { key: 'garantia', label: 'Garantía', class: 'status-garantia' },
  { key: 'rechazado', label: 'Rechazado', class: 'status-rechazado' },
  { key: 'repuestos', label: 'Repuestos', class: 'status-repuestos' },

  // 🟢 NUEVOS
    { key: 'reparacion', label: 'Reparación', class: 'status-reparacion' },
    { key: 'en-gestion', label: 'En Gestión', class: 'status-en-gestion' },
    { key: 'armado-sr', label: 'Armado S/R', class: 'status-armado-sr' },
    { key: 'listo-sr', label: 'Listo para retiro S/R', class: 'status-listo-sr' },
    { key: 'retirado-bodega', label: 'Retirado a bodega', class: 'status-retirado-bodega' },
    { key: 'sin-respuesta', label: 'Sin respuesta', class: 'status-sin-respuesta' },

    {
      key: 'en-gestion-garantia',
      label: 'En Gestión Garantía',
      class: 'status-en-gestion-garantia'
    },
    {
      key: 'reparacion-garantia',
      label: 'Reparación Garantía',
      class: 'status-reparacion-garantia'
    },
    {
      key: 'listo-garantia',
      label: 'Listo para retirar Garantía',
      class: 'status-listo-garantia'
    }
]

export const branchMap = { W: 'Web', Q: 'Quilmes', B: 'Barracas' }

//Rutas AuthContext privadas
export const protectedPaths = [
    '/dashboard',
    '/cotizaciones',
    '/clientes',
    '/servicios',
    '/servicios/nuevo',
    '/perfil'
  ]