export interface LegalSection {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}

export interface LegalDocument {
  slug: string
  eyebrow: string
  title: string
  description: string
  version: string
  updatedAt: string
  intro: string
  sections: LegalSection[]
}

export const CONTACT_EMAIL = 'restobarmaminco@gmail.com'
export const CONTACT_WHATSAPP = '+591 70012572'

export const TERMS: LegalDocument = {
  slug: 'terminos',
  eyebrow: 'Legal',
  title: 'Términos y condiciones',
  description:
    'Condiciones de uso del servicio Maminco: licencia, planes y pagos, disponibilidad, datos, terminación y ley aplicable.',
  version: '1.0',
  updatedAt: '19 de noviembre de 2026',
  intro:
    'Estos términos regulan el uso del sistema Maminco, un servicio de punto de venta y gestión para restaurantes. Al crear una cuenta o usar el servicio, el restaurante acepta estas condiciones.',
  sections: [
    {
      id: 'proveedor',
      title: '1. Identificación del proveedor',
      paragraphs: [
        'El servicio es ofrecido por Maminco, con domicilio en Santa Cruz de la Sierra, Bolivia (en adelante, «Maminco»). «Cliente» es el restaurante o negocio que contrata el servicio.',
        `Contacto: ${CONTACT_EMAIL} · WhatsApp ${CONTACT_WHATSAPP}.`,
      ],
    },
    {
      id: 'objeto',
      title: '2. Objeto del servicio',
      paragraphs: [
        'Maminco permite gestionar mesas y órdenes en tiempo real, cobros y caja, cocina, reportes y pronósticos de ventas, desde la web y desde la aplicación móvil.',
      ],
    },
    {
      id: 'cuentas',
      title: '3. Cuentas y usuarios',
      paragraphs: [
        'Cada usuario accede con credenciales personales y un rol (administrador, gerente, cajero, mesero o cocinero) que define lo que puede hacer.',
      ],
      items: [
        'El Cliente es responsable de las personas a las que da acceso y de mantener sus credenciales en reserva.',
        'Toda actividad realizada con una cuenta se atribuye a su titular.',
        'El Cliente debe avisar de inmediato ante cualquier uso no autorizado.',
      ],
    },
    {
      id: 'licencia',
      title: '4. Licencia de uso',
      paragraphs: [
        'Maminco otorga al Cliente una licencia limitada, no exclusiva, no transferible y revocable para usar el servicio, dentro de los límites de sucursales y usuarios de su plan. No se transfiere la propiedad del software ni de su código fuente.',
      ],
    },
    {
      id: 'planes-pagos',
      title: '5. Planes y pagos',
      paragraphs: [
        'Los planes y precios vigentes se publican en el sitio de Maminco y se expresan en bolivianos (Bs). Los precios incluyen el IVA cuando el Cliente solicite factura.',
        'La suscripción se factura por periodos mensuales, con opción de pago anual, y los pagos son exigibles por adelantado. En caso de mora superior a 15 días calendario, Maminco podrá suspender el acceso previa notificación, sin perjuicio de que los datos se conserven según la sección 7.',
      ],
    },
    {
      id: 'disponibilidad',
      title: '6. Disponibilidad y soporte',
      paragraphs: [
        'Maminco se propone mantener una disponibilidad mensual objetivo de 99,0 %. Es un objetivo y no una garantía, y el servicio se ofrece «tal cual», sin penalizaciones ni acuerdos de nivel de servicio. Pueden existir interrupciones por mantenimiento o por causas ajenas a Maminco.',
        'El soporte se presta de lunes a sábado, de 09:00 a 22:00 (hora de Bolivia), por WhatsApp y correo. Tiempos de primera respuesta: 2 horas para incidentes críticos (el servicio no opera), 8 horas para incidentes altos y 24 horas para incidentes medios y consultas.',
      ],
    },
    {
      id: 'datos',
      title: '7. Datos del Cliente y copias de seguridad',
      paragraphs: [
        'Los datos que el Cliente ingresa (productos, órdenes, pagos, personal y reportes) son del Cliente. Maminco los trata solo para prestar el servicio, según la Política de privacidad.',
        'Maminco realiza copias de seguridad diarias de los datos, con retención de 7 días. Las copias son una medida de recuperación y no sustituyen los respaldos que el Cliente considere necesarios.',
      ],
    },
    {
      id: 'uso-aceptable',
      title: '8. Uso aceptable',
      paragraphs: ['El Cliente se compromete a no:'],
      items: [
        'usar el servicio para fines ilícitos ni para vulnerar derechos de terceros;',
        'intentar acceder sin autorización a cuentas, datos o sistemas de Maminco o de otros clientes;',
        'interferir con el funcionamiento del servicio, ni realizar pruebas de carga o de seguridad sin autorización escrita;',
        'copiar, descompilar o revender el software.',
      ],
    },
    {
      id: 'propiedad-intelectual',
      title: '9. Propiedad intelectual',
      paragraphs: [
        'El software, la marca Maminco, los logotipos y la documentación son propiedad de Maminco o de sus licenciantes. Estos términos no conceden otros derechos que los indicados en la sección 4. Maminco usa componentes de código abierto bajo sus respectivas licencias.',
      ],
    },
    {
      id: 'responsabilidad',
      title: '10. Limitación de responsabilidad',
      paragraphs: [
        'En la medida permitida por la ley, la responsabilidad total de Maminco frente al Cliente se limita al monto pagado por el Cliente por el servicio en los 12 meses previos al hecho que originó el reclamo. Maminco no responde por lucro cesante ni por daños indirectos. Esta cláusula no excluye la responsabilidad que la ley boliviana no permita limitar.',
        'Los cálculos de ventas, los reportes y los pronósticos son herramientas de apoyo: el Cliente es responsable de sus decisiones comerciales, contables y tributarias.',
      ],
    },
    {
      id: 'terminacion',
      title: '11. Terminación y reversibilidad',
      paragraphs: [
        'Cualquiera de las partes puede terminar la suscripción con un preaviso de 30 días calendario. Maminco puede suspender o terminar el servicio de inmediato por incumplimiento grave de estos términos.',
        'Terminada la suscripción, el Cliente podrá solicitar la exportación de sus datos durante 30 días calendario, tras lo cual Maminco los eliminará o anonimizará, salvo las obligaciones legales de conservación.',
      ],
    },
    {
      id: 'modificaciones',
      title: '12. Modificaciones',
      paragraphs: [
        'Maminco puede actualizar estos términos o los planes notificando al Cliente por el servicio o por correo con al menos 30 días calendario de anticipación. El uso continuado después de esa fecha implica aceptación; si el Cliente no está de acuerdo, puede terminar la suscripción según la sección 11.',
      ],
    },
    {
      id: 'ley',
      title: '13. Ley aplicable y jurisdicción',
      paragraphs: [
        'Estos términos se rigen por las leyes del Estado Plurinacional de Bolivia. Las partes procurarán resolver las controversias de buena fe y, de no lograrlo, se someten a los tribunales competentes de la ciudad de Santa Cruz de la Sierra, Bolivia.',
      ],
    },
    {
      id: 'contacto',
      title: '14. Contacto y notificaciones',
      paragraphs: [
        `Las consultas y notificaciones a Maminco se envían a ${CONTACT_EMAIL}. Las notificaciones al Cliente se enviarán a las direcciones de correo registradas en su cuenta.`,
      ],
    },
  ],
}

export const PRIVACY: LegalDocument = {
  slug: 'privacidad',
  eyebrow: 'Legal',
  title: 'Política de privacidad',
  description:
    'Cómo Maminco trata los datos personales: qué datos recopila, para qué, cuánto tiempo los conserva, con quién los comparte y cómo ejercer tus derechos.',
  version: '1.0',
  updatedAt: '19 de noviembre de 2026',
  intro:
    'Esta política explica cómo trata Maminco los datos personales en el sitio y en el sistema. Maminco aplica los derechos a la intimidad y a la privacidad reconocidos por la Constitución Política del Estado y las buenas prácticas de protección de datos.',
  sections: [
    {
      id: 'responsable',
      title: '1. Responsable y encargado',
      paragraphs: [
        'Maminco, con domicilio en Santa Cruz de la Sierra, Bolivia, trata datos personales en dos calidades: como responsable de los datos de cuenta de los usuarios y como encargado de los datos que cada restaurante ingresa al sistema, sobre los cuales el restaurante decide.',
        `Contacto de privacidad: ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: 'datos',
      title: '2. Datos que tratamos',
      items: [
        'Datos de cuenta: nombre, correo electrónico, rol y contraseña (almacenada solo como hash, nunca en texto legible).',
        'Datos de personal que el restaurante registra: nombre, teléfono, dirección, fecha de contratación y pagos al personal.',
        'Datos operativos: mesas, órdenes, productos, montos y métodos de pago, y el historial de cambios.',
        'Datos técnicos: registros de errores y de actividad del servidor, con retención corta.',
      ],
      paragraphs: [
        'Maminco no almacena números de tarjeta. Los comensales no son usuarios del sistema y el servicio no solicita sus datos de contacto; si en el futuro se agregaran campos del comensal, por ejemplo NIT y razón social para facturar, esta política se actualizará antes de activarlos.',
      ],
    },
    {
      id: 'finalidades',
      title: '3. Finalidades',
      items: [
        'Prestar el servicio: autenticar usuarios, gestionar órdenes, cobros, caja y reportes.',
        'Mantener la seguridad, la auditoría y la prevención de fraude.',
        'Generar pronósticos de ventas con los datos del propio restaurante.',
        'Brindar soporte y comunicar cambios importantes del servicio.',
      ],
      paragraphs: ['No vendemos datos personales ni los usamos para publicidad de terceros.'],
    },
    {
      id: 'conservacion',
      title: '4. Conservación',
      items: [
        'Datos operativos y de cuenta: mientras dure la suscripción y 30 días calendario después para su exportación; luego se eliminan o anonimizan, salvo obligaciones legales.',
        'Registros de auditoría: hasta 3 años.',
        'Registros técnicos del servidor: 3 días.',
        'Copias de seguridad: 7 días.',
      ],
    },
    {
      id: 'encargados',
      title: '5. Proveedores y transferencias internacionales',
      paragraphs: [
        'Hoy el alojamiento se realiza en Amazon Web Services, en la región us-east-1 (Estados Unidos), es decir, fuera de Bolivia. Cualquier proveedor adicional que trate datos se informará a los administradores de cada cuenta.',
        'Maminco podrá comunicar datos a autoridades competentes cuando la ley lo exija.',
      ],
    },
    {
      id: 'seguridad',
      title: '6. Seguridad',
      items: [
        'Comunicaciones cifradas (HTTPS) y acceso por roles con permisos mínimos.',
        'Contraseñas almacenadas con hash y límite de intentos de inicio de sesión.',
        'Auditoría de las acciones críticas y registros que no incluyen contraseñas ni credenciales.',
        'Servicios internos aislados de Internet.',
      ],
      paragraphs: [
        'Ante una vulneración de seguridad que afecte datos personales, Maminco notificará por correo al administrador de la cuenta dentro de las 72 horas siguientes a confirmarla, indicando su alcance y las medidas adoptadas.',
      ],
    },
    {
      id: 'derechos',
      title: '7. Tus derechos',
      paragraphs: [
        `Toda persona titular de datos puede ejercer sus derechos de acceso, rectificación, cancelación y oposición escribiendo a ${CONTACT_EMAIL}. Si los datos fueron ingresados por un restaurante, la solicitud se coordina con este. Se responderá en un plazo de 15 días hábiles.`,
        'Bolivia reconoce la intimidad y la privacidad como derechos fundamentales y la Acción de Protección de Privacidad frente a su vulneración.',
      ],
    },
    {
      id: 'cookies',
      title: '8. Cookies y almacenamiento en el navegador',
      paragraphs: [
        'Al iniciar sesión, el sistema guarda en tu navegador la información de sesión y las preferencias de interfaz (por ejemplo, el tema claro u oscuro), con fines estrictamente funcionales. No usamos cookies publicitarias y el sitio no incluye herramientas de analítica; si se agregaran, se informará y se pedirá tu consentimiento.',
      ],
    },
    {
      id: 'menores',
      title: '9. Menores de edad',
      paragraphs: [
        'El servicio es de uso profesional y no está dirigido a menores de edad. Si detectamos datos de un menor registrados sin autorización, los eliminaremos.',
      ],
    },
    {
      id: 'cambios',
      title: '10. Cambios a esta política',
      paragraphs: [
        'Podemos actualizar esta política. Los cambios sustanciales se notificarán a los administradores de cada cuenta y la versión vigente siempre estará disponible en esta página, con su fecha de actualización.',
      ],
    },
    {
      id: 'contacto',
      title: '11. Contacto',
      paragraphs: [
        `Para consultas sobre privacidad: ${CONTACT_EMAIL} · WhatsApp ${CONTACT_WHATSAPP}.`,
      ],
    },
  ],
}

export const LEGAL_DOCUMENTS = [TERMS, PRIVACY]
