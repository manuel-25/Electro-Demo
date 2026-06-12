import mongoose from 'mongoose'

export const DEMO_USER_ID = new mongoose.Types.ObjectId('665000000000000000000001')

const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const minutesAgo = (minutes) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutes)
  return date
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function buildDemoData() {
  const demoUserEmail = 'demo@electrosafe.app'

  const clients = [
    {
      firstName: 'Mariana',
      lastName: 'Rivas',
      dniOrCuit: '30444111',
      email: 'mariana.rivas.demo@example.com',
      phone: '1162458890',
      domicilio: 'Av. Mitre 1480',
      province: 'Buenos Aires',
      municipio: 'Quilmes',
      customerNumber: 1001,
      serviceRequestNumbers: [7101]
    },
    {
      firstName: 'Lucas',
      lastName: 'Ferrer',
      dniOrCuit: '28555888',
      email: 'lucas.ferrer.demo@example.com',
      phone: '1159093370',
      domicilio: 'Brandsen 420',
      province: 'Buenos Aires',
      municipio: 'Barracas',
      customerNumber: 1002,
      serviceRequestNumbers: [7102]
    },
    {
      firstName: 'Sofia',
      lastName: 'Campos',
      dniOrCuit: '33111888',
      email: 'sofia.campos.demo@example.com',
      phone: '1134021144',
      domicilio: 'Humberto Primo 220',
      province: 'CABA',
      municipio: 'Barracas',
      customerNumber: 1003,
      serviceRequestNumbers: [7103]
    },
    {
      firstName: 'Diego',
      lastName: 'Paz',
      dniOrCuit: '27123456',
      email: 'diego.paz.demo@example.com',
      phone: '1168012299',
      domicilio: 'Alsina 910',
      province: 'Buenos Aires',
      municipio: 'Avellaneda',
      customerNumber: 1004,
      serviceRequestNumbers: [7104]
    },
    {
      firstName: 'Paula',
      lastName: 'Mendez',
      dniOrCuit: '29876543',
      email: 'paula.mendez.demo@example.com',
      phone: '1144556677',
      domicilio: 'Colon 780',
      province: 'Buenos Aires',
      municipio: 'Quilmes',
      customerNumber: 1005,
      serviceRequestNumbers: [7105]
    }
  ]

  const clientByNumber = Object.fromEntries(clients.map(client => [client.customerNumber, client]))

  const quotes = [
    {
      serviceRequestNumber: 7101,
      customerNumber: 1001,
      date: daysAgo(2),
      category: { id: 1, name: 'Notebook' },
      brand: 'Lenovo',
      model: 'IdeaPad 3',
      faults: ['No enciende', 'Posible falla de cargador'],
      details: 'Cliente necesita diagnostico para uso laboral.',
      userData: { ...clientByNumber[1001], additionalDetails: 'Trae cargador original.' },
      branch: 'Quilmes',
      status: 'Pendiente'
    },
    {
      serviceRequestNumber: 7102,
      customerNumber: 1002,
      date: daysAgo(6),
      category: { id: 2, name: 'TV' },
      brand: 'Samsung',
      model: 'UN50TU7000',
      faults: ['Sin imagen', 'Con audio'],
      details: 'Se recomendo ingreso a taller para revision de backlight.',
      userData: { ...clientByNumber[1002], additionalDetails: 'Equipo de 50 pulgadas.' },
      branch: 'Barracas',
      status: 'Respondido'
    },
    {
      serviceRequestNumber: 7103,
      customerNumber: 1003,
      date: daysAgo(12),
      category: { id: 3, name: 'Celular' },
      brand: 'Motorola',
      model: 'G84',
      faults: ['No carga'],
      details: 'Se solicito foto del pin de carga y datos del equipo.',
      userData: { ...clientByNumber[1003], additionalDetails: 'Uso diario intensivo.' },
      branch: 'Barracas',
      status: 'No Respondido'
    },
    {
      serviceRequestNumber: 7104,
      customerNumber: 1004,
      date: daysAgo(18),
      category: { id: 4, name: 'Consola' },
      brand: 'Sony',
      model: 'PlayStation 5',
      faults: ['Sobrecalienta', 'Se apaga'],
      details: 'Presupuesto orientativo sujeto a limpieza y revision interna.',
      userData: { ...clientByNumber[1004], additionalDetails: 'Incluye base y cable HDMI.' },
      branch: 'Quilmes',
      status: 'Respondido'
    },
    {
      serviceRequestNumber: 7105,
      customerNumber: 1005,
      date: daysAgo(24),
      category: { id: 5, name: 'Audio' },
      brand: 'JBL',
      model: 'Charge 5',
      faults: ['Bateria no dura'],
      details: 'Pendiente confirmacion de disponibilidad de repuesto.',
      userData: { ...clientByNumber[1005], additionalDetails: 'Equipo sin accesorios.' },
      branch: 'Quilmes',
      status: 'Pendiente'
    }
  ]

  const serviceBase = {
    serviceType: 'Reparación',
    warrantyExpiration: 30,
    createdBy: DEMO_USER_ID,
    createdByEmail: demoUserEmail,
    lastModifiedBy: demoUserEmail,
    flowVersion: 2,
    deliveryMethod: 'Presencial'
  }

  const services = [
    {
      ...serviceBase,
      customerNumber: 1001,
      quoteReference: 7101,
      code: 'Q1001',
      publicId: 'DEMOQ1001',
      userData: clientByNumber[1001],
      equipmentType: 'Notebook',
      description: 'Lenovo IdeaPad 3 no enciende.',
      userDescription: 'La notebook no prende y el led del cargador titila.',
      brand: 'Lenovo',
      model: 'IdeaPad 3',
      approximateValue: '$45.000 - $80.000',
      finalValue: 0,
      status: 'Pendiente',
      workOrderStatus: 'Sin presupuesto',
      receivedAtBranch: 'No recibido',
      notes: 'Demo: solicitud recien ingresada.',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      lastActivityAt: daysAgo(1),
      statusHistory: [{ status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(1) }]
    },
    {
      ...serviceBase,
      customerNumber: 1002,
      quoteReference: 7102,
      code: 'B1002',
      publicId: 'DEMOB1002',
      userData: clientByNumber[1002],
      equipmentType: 'TV',
      description: 'Samsung 50 pulgadas con audio pero sin imagen.',
      userDescription: 'La pantalla queda negra aunque se escucha sonido.',
      brand: 'Samsung',
      model: 'UN50TU7000',
      approximateValue: '$70.000 - $120.000',
      finalValue: 95000,
      repuestos: 42000,
      status: 'En Gestión',
      workOrderStatus: 'Lista para enviar',
      receivedAtBranch: 'Barracas',
      receivedAt: daysAgo(5),
      receivedBy: demoUserEmail,
      budgetItems: [
        { cantidad: 1, descripcion: 'Kit de backlight compatible', precioUnitario: 42000 },
        { cantidad: 1, descripcion: 'Mano de obra y pruebas', precioUnitario: 53000 }
      ],
      diagnosticoTecnico: 'Falla en tiras LED de backlight. Fuente estable.',
      receptionChecklist: {
        wasRepairedBefore: false,
        isClean: true,
        hasAccessories: true,
        accessories: [{ name: 'control', label: 'Control remoto' }],
        accessoriesNotes: 'Control remoto y cable de energia.',
        completedAt: daysAgo(5),
        completedBy: demoUserEmail
      },
      createdAt: daysAgo(5),
      updatedAt: daysAgo(3),
      lastActivityAt: daysAgo(3),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(6) },
        { status: 'En Gestión', changedBy: demoUserEmail, changedAt: daysAgo(5), receivedAtBranch: 'Barracas' }
      ]
    },
    {
      ...serviceBase,
      customerNumber: 1003,
      quoteReference: 7103,
      code: 'B1003',
      publicId: 'DEMOB1003',
      userData: clientByNumber[1003],
      equipmentType: 'Celular',
      description: 'Motorola G84 no carga.',
      userDescription: 'El cable queda flojo y no toma carga.',
      brand: 'Motorola',
      model: 'G84',
      approximateValue: '$28.000 - $48.000',
      finalValue: 36000,
      repuestos: 12000,
      status: 'Reparación',
      workOrderStatus: 'Aceptada',
      workOrderSentAt: daysAgo(7),
      workOrderSentBy: demoUserEmail,
      workOrderAnsweredAt: daysAgo(6),
      workOrderAnsweredBy: demoUserEmail,
      receivedAtBranch: 'Barracas',
      receivedAt: daysAgo(10),
      receivedBy: demoUserEmail,
      budgetItems: [
        { cantidad: 1, descripcion: 'Pin de carga', precioUnitario: 12000 },
        { cantidad: 1, descripcion: 'Mano de obra', precioUnitario: 24000 }
      ],
      diagnosticoTecnico: 'Pin de carga sulfatado. Bateria en buen estado.',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(6),
      lastActivityAt: daysAgo(6),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(10) },
        { status: 'En Gestión', changedBy: demoUserEmail, changedAt: daysAgo(9), receivedAtBranch: 'Barracas' },
        { status: 'Reparación', changedBy: demoUserEmail, changedAt: daysAgo(6), note: 'Orden de trabajo aceptada.' }
      ]
    },
    {
      ...serviceBase,
      customerNumber: 1004,
      quoteReference: 7104,
      code: 'Q1004',
      publicId: 'DEMOQ1004',
      userData: clientByNumber[1004],
      equipmentType: 'Consola',
      description: 'PlayStation 5 se apaga por temperatura.',
      userDescription: 'Despues de media hora de juego se apaga sola.',
      brand: 'Sony',
      model: 'PlayStation 5',
      approximateValue: '$65.000 - $110.000',
      finalValue: 78000,
      repuestos: 0,
      status: 'Listo para retirar',
      workOrderStatus: 'Aceptada',
      workOrderSentAt: daysAgo(14),
      workOrderAnsweredAt: daysAgo(13),
      receivedAtBranch: 'Quilmes',
      receivedAt: daysAgo(18),
      receivedBy: demoUserEmail,
      budgetItems: [
        { cantidad: 1, descripcion: 'Limpieza profunda y cambio de pasta termica', precioUnitario: 78000 }
      ],
      diagnosticoTecnico: 'Temperatura normalizada despues de mantenimiento.',
      createdAt: daysAgo(18),
      updatedAt: daysAgo(2),
      lastActivityAt: daysAgo(2),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(18) },
        { status: 'En Gestión', changedBy: demoUserEmail, changedAt: daysAgo(17), receivedAtBranch: 'Quilmes' },
        { status: 'Reparación', changedBy: demoUserEmail, changedAt: daysAgo(13) },
        { status: 'Listo para retirar', changedBy: demoUserEmail, changedAt: daysAgo(2) }
      ]
    },
    {
      ...serviceBase,
      customerNumber: 1005,
      quoteReference: 7105,
      code: 'Q1005',
      publicId: 'DEMOQ1005',
      userData: clientByNumber[1005],
      equipmentType: 'Parlante Bluetooth',
      description: 'JBL Charge 5 con bateria agotada.',
      userDescription: 'Carga pero dura pocos minutos.',
      brand: 'JBL',
      model: 'Charge 5',
      approximateValue: '$35.000 - $55.000',
      finalValue: 48000,
      repuestos: 28000,
      status: 'Entregado',
      workOrderStatus: 'Aceptada',
      receivedAtBranch: 'Quilmes',
      receivedAt: daysAgo(24),
      deliveredAt: daysAgo(4),
      warrantyUntil: addDays(daysAgo(4), 30),
      isSatisfied: true,
      budgetItems: [
        { cantidad: 1, descripcion: 'Bateria compatible', precioUnitario: 28000 },
        { cantidad: 1, descripcion: 'Mano de obra y prueba de autonomia', precioUnitario: 20000 }
      ],
      diagnosticoTecnico: 'Bateria degradada. Se reemplazo y se probo carga completa.',
      createdAt: daysAgo(24),
      updatedAt: daysAgo(4),
      lastActivityAt: daysAgo(4),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(24) },
        { status: 'En Gestión', changedBy: demoUserEmail, changedAt: daysAgo(23), receivedAtBranch: 'Quilmes' },
        { status: 'Reparación', changedBy: demoUserEmail, changedAt: daysAgo(20) },
        { status: 'Listo para retirar', changedBy: demoUserEmail, changedAt: daysAgo(8) },
        { status: 'Entregado', changedBy: demoUserEmail, changedAt: daysAgo(4), isSatisfied: true }
      ]
    }
  ]

  const extraClients = [
    ['Valeria', 'Acosta', 1006, 7106, 'Notebook', 'HP', 'Pavilion 15', 'Quilmes'],
    ['Nicolas', 'Suarez', 1007, 7107, 'TV', 'LG', '43UP7500', 'Quilmes'],
    ['Camila', 'Ortega', 1008, 7108, 'Celular', 'Samsung', 'A54', 'Barracas'],
    ['Martin', 'Gomez', 1009, 7109, 'Consola', 'Microsoft', 'Xbox Series S', 'Quilmes'],
    ['Rocio', 'Ferreyra', 1010, 7110, 'Tablet', 'Apple', 'iPad 9', 'Barracas'],
    ['Andres', 'Luna', 1011, 7111, 'Notebook', 'Dell', 'Inspiron 3511', 'Quilmes'],
    ['Florencia', 'Vega', 1012, 7112, 'TV', 'Philips', '50PUD7406', 'Barracas'],
    ['Matias', 'Romero', 1013, 7113, 'Celular', 'Xiaomi', 'Redmi Note 12', 'Quilmes'],
    ['Julieta', 'Silva', 1014, 7114, 'Audio', 'Sony', 'SRS-XB33', 'Quilmes'],
    ['Pablo', 'Herrera', 1015, 7115, 'Notebook', 'Asus', 'Vivobook 14', 'Barracas']
  ].map(([firstName, lastName, customerNumber, requestNumber], index) => ({
    firstName,
    lastName,
    dniOrCuit: String(30000000 + customerNumber),
    email: `${firstName}.${lastName}.demo@example.com`.toLowerCase(),
    phone: `11555${String(customerNumber).slice(-5)}`,
    domicilio: `Calle Demo ${120 + index}`,
    province: index % 2 ? 'CABA' : 'Buenos Aires',
    municipio: index % 2 ? 'Barracas' : 'Quilmes',
    customerNumber,
    serviceRequestNumbers: [requestNumber]
  }))

  clients.push(...extraClients)

  const getClient = (customerNumber) => clients.find(client => client.customerNumber === customerNumber)

  const extraQuotes = [
    [7106, 1006, 'Notebook', 'HP', 'Pavilion 15', 'Pantalla rota', 'Pendiente', 'Quilmes'],
    [7107, 1007, 'TV', 'LG', '43UP7500', 'No prende', 'Respondido', 'Quilmes'],
    [7108, 1008, 'Celular', 'Samsung', 'A54', 'Modulo dañado', 'Pendiente', 'Barracas'],
    [7109, 1009, 'Consola', 'Microsoft', 'Xbox Series S', 'No lee juegos', 'Respondido', 'Quilmes'],
    [7110, 1010, 'Tablet', 'Apple', 'iPad 9', 'No carga', 'No Respondido', 'Barracas'],
    [7111, 1011, 'Notebook', 'Dell', 'Inspiron 3511', 'Bisagra rota', 'Respondido', 'Quilmes'],
    [7112, 1012, 'TV', 'Philips', '50PUD7406', 'Rayas en pantalla', 'Pendiente', 'Barracas'],
    [7113, 1013, 'Celular', 'Xiaomi', 'Redmi Note 12', 'Bateria hinchada', 'Respondido', 'Quilmes'],
    [7114, 1014, 'Audio', 'Sony', 'SRS-XB33', 'No carga bateria', 'Respondido', 'Quilmes'],
    [7115, 1015, 'Notebook', 'Asus', 'Vivobook 14', 'Teclado falla', 'Pendiente', 'Barracas']
  ].map(([serviceRequestNumber, customerNumber, categoryName, brand, model, fault, status, branch], index) => ({
    serviceRequestNumber,
    customerNumber,
    date: daysAgo(index + 3),
    category: { id: index + 10, name: categoryName },
    brand,
    model,
    faults: [fault],
    details: `Caso demo: ${fault}.`,
    userData: { ...getClient(customerNumber), additionalDetails: 'Datos cargados para portfolio demo.' },
    branch,
    status
  }))

  quotes.push(...extraQuotes)

  const extraServices = [
    [1006, 7106, 'Q1006', 'DEMOQ1006', 'Notebook', 'HP', 'Pavilion 15', 'Recibido', 'Sin presupuesto', 0, 4, 'Quilmes'],
    [1007, 7107, 'Q1007', 'DEMOQ1007', 'TV', 'LG', '43UP7500', 'En Gestión', 'Lista para enviar', 87000, 8, 'Quilmes'],
    [1008, 7108, 'B1008', 'DEMOB1008', 'Celular', 'Samsung', 'A54', 'Reparación', 'Aceptada', 52000, 11, 'Barracas'],
    [1009, 7109, 'Q1009', 'DEMOQ1009', 'Consola', 'Microsoft', 'Xbox Series S', 'Armado S/R', 'Rechazada', 0, 15, 'Quilmes'],
    [1010, 7110, 'B1010', 'DEMOB1010', 'Tablet', 'Apple', 'iPad 9', 'Sin respuesta', 'Enviada', 0, 19, 'Barracas'],
    [1011, 7111, 'Q1011', 'DEMOQ1011', 'Notebook', 'Dell', 'Inspiron 3511', 'Listo para retiro S/R', 'Sin reparación', 0, 21, 'Quilmes'],
    [1012, 7112, 'B1012', 'DEMOB1012', 'TV', 'Philips', '50PUD7406', 'Retirado a bodega', 'Rechazada', 0, 28, 'Barracas'],
    [1013, 7113, 'Q1013', 'DEMOQ1013', 'Celular', 'Xiaomi', 'Redmi Note 12', 'Entregado', 'Aceptada', 44000, 32, 'Quilmes'],
    [1014, 7114, 'Q1014', 'DEMOQ1014', 'Audio', 'Sony', 'SRS-XB33', 'Entregado', 'Aceptada', 39000, 38, 'Quilmes'],
    [1015, 7115, 'B1015', 'DEMOB1015', 'Notebook', 'Asus', 'Vivobook 14', 'En Gestión Garantía', 'Sin presupuesto', 72000, 45, 'Barracas']
  ].map(([customerNumber, quoteReference, code, publicId, equipmentType, brand, model, status, workOrderStatus, finalValue, age, branch]) => {
    const client = getClient(customerNumber)
    const delivered = status === 'Entregado'
    return {
      ...serviceBase,
      customerNumber,
      quoteReference,
      code,
      publicId,
      userData: client,
      equipmentType,
      description: `${equipmentType} ${brand} ${model} - caso demo operativo.`,
      userDescription: `Cliente informa falla en ${equipmentType.toLowerCase()} ${brand} ${model}.`,
      brand,
      model,
      approximateValue: '$30.000 - $120.000',
      finalValue,
      repuestos: Math.round(finalValue * 0.35),
      status,
      workOrderStatus,
      receivedAtBranch: branch,
      receivedAt: daysAgo(age),
      receivedBy: demoUserEmail,
      deliveredAt: delivered ? daysAgo(Math.max(age - 6, 1)) : null,
      warrantyUntil: delivered ? addDays(daysAgo(Math.max(age - 6, 1)), 30) : null,
      isSatisfied: delivered ? true : null,
      activeWarrantyEventId: status.includes('Garantía') ? new mongoose.Types.ObjectId() : null,
      budgetItems: finalValue > 0
        ? [
            { cantidad: 1, descripcion: 'Repuesto principal', precioUnitario: Math.round(finalValue * 0.35) },
            { cantidad: 1, descripcion: 'Mano de obra tecnica', precioUnitario: Math.round(finalValue * 0.65) }
          ]
        : [],
      diagnosticoTecnico: 'Diagnostico demo cargado para mostrar el flujo interno.',
      notes: 'Servicio demo editable desde el panel.',
      receptionChecklist: {
        wasRepairedBefore: false,
        isClean: true,
        hasAccessories: true,
        accessories: [{ name: 'cable', label: 'Cable de energia/carga' }],
        accessoriesNotes: '',
        completedAt: daysAgo(age),
        completedBy: demoUserEmail
      },
      createdAt: daysAgo(age),
      updatedAt: daysAgo(Math.max(age - 2, 1)),
      lastActivityAt: daysAgo(Math.max(age - 2, 1)),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(age) },
        { status, changedBy: demoUserEmail, changedAt: daysAgo(Math.max(age - 2, 1)), receivedAtBranch: branch }
      ]
    }
  })

  services.push(...extraServices)

  const firstNames = [
    'Agustin', 'Aldana', 'Bruno', 'Carolina', 'Daniel', 'Elena', 'Federico', 'Gabriela',
    'Hernan', 'Iara', 'Joaquin', 'Karen', 'Lautaro', 'Milagros', 'Natalia', 'Oscar',
    'Priscila', 'Ramiro', 'Sabrina', 'Tomas', 'Uma', 'Victor', 'Walter', 'Ximena',
    'Yamila', 'Zoe'
  ]
  const lastNames = [
    'Benitez', 'Castro', 'Dominguez', 'Escobar', 'Fernandez', 'Gimenez', 'Iglesias',
    'Lopez', 'Molina', 'Navarro', 'Pereyra', 'Quiroga', 'Ruiz', 'Sosa', 'Torres',
    'Vargas', 'Aguirre', 'Cabrera', 'Medina', 'Roldan'
  ]
  const demoDevices = [
    { equipmentType: 'Notebook', brand: 'Lenovo', model: 'ThinkPad E14', fault: 'no enciende', value: 86000, accessory: 'Cargador' },
    { equipmentType: 'Notebook', brand: 'HP', model: 'Pavilion 14', fault: 'pantalla sin imagen', value: 92000, accessory: 'Cargador' },
    { equipmentType: 'TV', brand: 'Samsung', model: 'UN55AU7000', fault: 'sin backlight', value: 135000, accessory: 'Control remoto' },
    { equipmentType: 'TV', brand: 'LG', model: '50UP7750', fault: 'reinicia solo', value: 118000, accessory: 'Control remoto' },
    { equipmentType: 'Celular', brand: 'Motorola', model: 'Edge 30', fault: 'pin de carga dañado', value: 42000, accessory: 'Funda' },
    { equipmentType: 'Celular', brand: 'Samsung', model: 'A34', fault: 'modulo golpeado', value: 76000, accessory: 'Chip' },
    { equipmentType: 'Consola', brand: 'Sony', model: 'PlayStation 4', fault: 'sobrecalienta', value: 68000, accessory: 'Cable HDMI' },
    { equipmentType: 'Consola', brand: 'Microsoft', model: 'Xbox One S', fault: 'no lee discos', value: 62000, accessory: 'Joystick' },
    { equipmentType: 'Audio', brand: 'JBL', model: 'Flip 6', fault: 'bateria agotada', value: 39000, accessory: 'Cable USB' },
    { equipmentType: 'Tablet', brand: 'Apple', model: 'iPad 8', fault: 'no carga', value: 58000, accessory: 'Cargador' }
  ]
  const quoteStatuses = ['Pendiente', 'Respondido', 'Respondido', 'No Respondido']
  const serviceStatuses = [
    'Pendiente',
    'Recibido',
    'En Gestión',
    'Reparación',
    'Listo para retirar',
    'Entregado',
    'Armado S/R',
    'Listo para retiro S/R',
    'Sin respuesta',
    'Retirado a bodega',
    'En Gestión Garantía',
    'Reparación Garantía',
    'Listo para retirar Garantía'
  ]

  for (let customerNumber = 1016; customerNumber <= 1100; customerNumber++) {
    const index = customerNumber - 1016
    const requestNumber = 7100 + customerNumber - 1000
    const device = demoDevices[index % demoDevices.length]
    const firstName = firstNames[index % firstNames.length]
    const lastName = lastNames[index % lastNames.length]
    const branch = index % 3 === 0 ? 'Barracas' : 'Quilmes'
    const status = serviceStatuses[index % serviceStatuses.length]
    const quoteStatus = quoteStatuses[index % quoteStatuses.length]
    const prefix = branch === 'Barracas' ? 'B' : 'Q'
    const age = 2 + (index % 75)
    const delivered = ['Entregado', 'Entregado S/R'].includes(status)
    const hasBudget = !['Pendiente', 'Recibido', 'Sin respuesta', 'Retirado a bodega'].includes(status)
    const finalValue = hasBudget ? device.value + ((index % 7) * 4500) : 0
    const workOrderStatus = delivered
      ? 'Aceptada'
      : status === 'Armado S/R' || status === 'Listo para retiro S/R'
        ? 'Sin reparación'
        : status === 'Sin respuesta'
          ? 'Enviada'
          : status === 'Retirado a bodega'
            ? 'Rechazada'
            : hasBudget
              ? (index % 2 ? 'Aceptada' : 'Lista para enviar')
              : 'Sin presupuesto'

    const client = {
      firstName,
      lastName,
      dniOrCuit: String(31000000 + index * 137),
      email: `${firstName}.${lastName}.${customerNumber}@demo.electrosafe.app`.toLowerCase(),
      phone: `11${String(60000000 + index * 831).slice(0, 8)}`,
      domicilio: `Demo ${240 + index}`,
      province: branch === 'Barracas' ? 'CABA' : 'Buenos Aires',
      municipio: branch,
      customerNumber,
      serviceRequestNumbers: [requestNumber]
    }

    clients.push(client)
    quotes.push({
      serviceRequestNumber: requestNumber,
      customerNumber,
      date: daysAgo(age + 1),
      category: { id: 100 + index, name: device.equipmentType },
      brand: device.brand,
      model: device.model,
      faults: [device.fault],
      details: `Solicitud demo generada para ${device.equipmentType}: ${device.fault}.`,
      userData: { ...client, additionalDetails: 'Carga automatica para demo Electrosafe.' },
      branch,
      status: quoteStatus
    })

    services.push({
      ...serviceBase,
      customerNumber,
      quoteReference: requestNumber,
      code: `${prefix}${customerNumber}`,
      publicId: `DEMO${prefix}${customerNumber}`,
      userData: client,
      equipmentType: device.equipmentType,
      description: `${device.equipmentType} ${device.brand} ${device.model}: ${device.fault}.`,
      userDescription: `Cliente informa que el equipo presenta ${device.fault}.`,
      brand: device.brand,
      model: device.model,
      approximateValue: '$35.000 - $160.000',
      finalValue,
      repuestos: finalValue ? Math.round(finalValue * 0.38) : 0,
      status,
      workOrderStatus,
      workOrderSentAt: hasBudget ? daysAgo(Math.max(age - 4, 1)) : null,
      workOrderSentBy: hasBudget ? demoUserEmail : null,
      workOrderAnsweredAt: workOrderStatus === 'Aceptada' ? daysAgo(Math.max(age - 3, 1)) : null,
      workOrderAnsweredBy: workOrderStatus === 'Aceptada' ? demoUserEmail : null,
      receivedAtBranch: status === 'Pendiente' ? 'No recibido' : branch,
      receivedAt: status === 'Pendiente' ? null : daysAgo(age),
      receivedBy: status === 'Pendiente' ? null : demoUserEmail,
      deliveredAt: delivered ? daysAgo(Math.max(age - 8, 1)) : null,
      warrantyUntil: delivered ? addDays(daysAgo(Math.max(age - 8, 1)), 30) : null,
      isSatisfied: delivered ? index % 5 !== 0 : null,
      activeWarrantyEventId: status.includes('Garantía') ? new mongoose.Types.ObjectId() : null,
      budgetItems: finalValue
        ? [
            { cantidad: 1, descripcion: 'Repuesto principal demo', precioUnitario: Math.round(finalValue * 0.38) },
            { cantidad: 1, descripcion: 'Mano de obra tecnica', precioUnitario: Math.round(finalValue * 0.62) }
          ]
        : [],
      diagnosticoTecnico: hasBudget ? `Diagnostico demo: ${device.fault}.` : '',
      notes: index % 4 === 0 ? 'Cliente solicita aviso por WhatsApp antes de avanzar.' : 'Servicio demo editable desde el panel.',
      receptionChecklist: {
        wasRepairedBefore: index % 6 === 0,
        isClean: index % 5 !== 0,
        hasAccessories: true,
        accessories: [{ name: device.accessory, label: device.accessory }],
        accessoriesNotes: '',
        completedAt: status === 'Pendiente' ? null : daysAgo(age),
        completedBy: status === 'Pendiente' ? null : demoUserEmail
      },
      createdAt: daysAgo(age + 1),
      updatedAt: daysAgo(Math.max(age - 2, 1)),
      lastActivityAt: daysAgo(Math.max(age - (index % 10), 1)),
      statusHistory: [
        { status: 'Pendiente', changedBy: demoUserEmail, changedAt: daysAgo(age + 1) },
        ...(status === 'Pendiente'
          ? []
          : [{ status, changedBy: demoUserEmail, changedAt: daysAgo(Math.max(age - 2, 1)), receivedAtBranch: branch }])
      ]
    })
  }

  const users = [
    {
      _id: DEMO_USER_ID,
      email: demoUserEmail,
      password: 'demo-password-placeholder',
      role: 'admin',
      firstName: 'Demo',
      lastName: 'Electrosafe',
      branch: 'Quilmes',
      phone: '1100000000',
      isActive: true,
      notes: 'Usuario automatico para portfolio demo.'
    }
  ]

  const conversations = [
    {
      phone: '5491121842237@c.us',
      contactName: 'Mariana Rivas',
      status: 'priority',
      humanRequestedAt: minutesAgo(95),
      lastMessage: 'Necesito hablar con alguien por el presupuesto.',
      lastMessageAt: minutesAgo(22),
      lastCustomerMessage: 'Necesito hablar con alguien por el presupuesto.',
      lastCustomerMessageAt: minutesAgo(22),
      unreadCount: 3,
      messages: [
        { sender: 'user', text: 'Hola, tengo una notebook Lenovo que no enciende.', createdAt: minutesAgo(130), provider: 'demo' },
        { sender: 'bot', text: 'Hola, soy el asistente de Electrosafe. Puedo ayudarte con estado de servicio, ubicacion o derivarte a un asesor.', createdAt: minutesAgo(128), provider: 'demo' },
        { sender: 'user', text: 'Necesito hablar con alguien por el presupuesto.', createdAt: minutesAgo(22), provider: 'demo' }
      ]
    },
    {
      phone: '5491136106124@c.us',
      contactName: 'Lucas Ferrer',
      status: 'waiting',
      humanRequestedAt: minutesAgo(34),
      lastMessage: 'Quiero autorizar la reparacion del TV.',
      lastMessageAt: minutesAgo(18),
      lastCustomerMessage: 'Quiero autorizar la reparacion del TV.',
      lastCustomerMessageAt: minutesAgo(18),
      unreadCount: 1,
      messages: [
        { sender: 'user', text: 'Buenas, ya vi el presupuesto.', createdAt: minutesAgo(40), provider: 'demo' },
        { sender: 'bot', text: 'Si queres, puedo derivarte con un asesor para continuar.', createdAt: minutesAgo(39), provider: 'demo' },
        { sender: 'user', text: 'Quiero autorizar la reparacion del TV.', createdAt: minutesAgo(18), provider: 'demo' }
      ]
    },
    {
      phone: '5491178967720@c.us',
      contactName: 'Sofia Campos',
      status: 'in_progress',
      humanRequestedAt: minutesAgo(210),
      assignedTo: demoUserEmail,
      lastAssignedTo: demoUserEmail,
      firstResponseAt: minutesAgo(180),
      inProgressAt: minutesAgo(180),
      lastOutboundAt: minutesAgo(12),
      lastMessage: 'Te confirmo apenas salga de pruebas.',
      lastMessageAt: minutesAgo(12),
      lastCustomerMessage: 'Me avisan cuando este listo?',
      lastCustomerMessageAt: minutesAgo(16),
      unreadCount: 0,
      messages: [
        { sender: 'user', text: 'Me avisan cuando este listo?', createdAt: minutesAgo(16), provider: 'demo' },
        { sender: 'human', text: 'Si, te confirmo apenas salga de pruebas.', createdAt: minutesAgo(12), provider: 'demo' }
      ]
    },
    {
      phone: '5491162458890@c.us',
      contactName: 'Diego Paz',
      status: 'resolved',
      humanRequestedAt: minutesAgo(1440),
      lastAssignedTo: demoUserEmail,
      firstResponseAt: minutesAgo(1380),
      lastOutboundAt: minutesAgo(1320),
      lastMessage: 'Gracias, paso a retirar manana.',
      lastMessageAt: minutesAgo(1310),
      lastCustomerMessage: 'Gracias, paso a retirar manana.',
      lastCustomerMessageAt: minutesAgo(1310),
      unreadCount: 0,
      messages: [
        { sender: 'user', text: 'Esta listo para retirar?', createdAt: minutesAgo(1400), provider: 'demo' },
        { sender: 'human', text: 'Si, ya podes pasar por Quilmes con tu ticket.', createdAt: minutesAgo(1320), provider: 'demo' },
        { sender: 'user', text: 'Gracias, paso a retirar manana.', createdAt: minutesAgo(1310), provider: 'demo' }
      ]
    }
  ]

  return { clients, quotes, services, users, conversations }
}
