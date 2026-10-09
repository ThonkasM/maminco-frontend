export type FaqCategory =
  | 'general'
  | 'funcionalidad'
  | 'planes'
  | 'seguridad'
  | 'soporte'

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: FaqCategory
  keywords: string[]
}

export interface ChatbotReply {
  answer: string
  matched?: FaqItem
  suggestions: FaqItem[]
}

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  general: 'General',
  funcionalidad: 'Funcionalidad',
  planes: 'Planes y precios',
  seguridad: 'Seguridad',
  soporte: 'Soporte',
}

export const FAQS: FaqItem[] = [
  {
    id: 'que-es-maminco',
    question: '¿Qué es Maminco?',
    answer:
      'Es un sistema de punto de venta (POS) y gestión para restaurantes: mesas y órdenes en tiempo real, pagos y caja, reportes y pronósticos de ventas con IA. Incluye panel web administrativo, POS web, pantalla de cocina (Cocina Digitalizada) y una app móvil para gerentes, meseros y cocina.',
    category: 'general',
    keywords: [
      'maminco',
      'sistema',
      'producto',
      'pos',
      'restaurante',
      'gestion',
      'software',
      'que',
      'es',
    ],
  },
  {
    id: 'hardware',
    question: '¿Necesito comprar hardware especial?',
    answer:
      'No. El POS funciona en cualquier navegador (tablet, laptop o PC). Opcionalmente puedes conectar impresora y gaveta de dinero; no es obligatorio para operar.',
    category: 'funcionalidad',
    keywords: [
      'hardware',
      'computadora',
      'computador',
      'tablet',
      'laptop',
      'pc',
      'impresora',
      'gaveta',
      'comprar',
      'equipo',
      'necesito',
    ],
  },
  {
    id: 'sin-internet',
    question: '¿Funciona sin internet?',
    answer:
      'El POS web requiere conexión. El modelo On-Premise permite instalar el sistema en tu propio equipo para operar de forma local; la nube es la opción recomendada.',
    category: 'funcionalidad',
    keywords: [
      'internet',
      'conexion',
      'offline',
      'sin',
      'linea',
      'local',
      'on-premise',
      'on',
      'premise',
      'nube',
      'conectividad',
    ],
  },
  {
    id: 'precio',
    question: '¿Cuánto cuesta?',
    answer:
      'Hay un plan Básico desde Bs 250/mes por sucursal, un plan Pro con reportes avanzados e IA, y un plan Cadena multi-sucursal. También existe una licencia On-Premise de pago único. Revisa la sección Planes para el detalle.',
    category: 'planes',
    keywords: [
      'cuanto',
      'cuesta',
      'precio',
      'precios',
      'costo',
      'plan',
      'planes',
      'tarifa',
      'mensual',
      'bs',
      'bolivianos',
      'pagar',
    ],
  },
  {
    id: 'implementacion',
    question: '¿Cuánto tarda la implementación?',
    answer:
      'La configuración inicial (áreas, mesas, categorías y productos) toma minutos con el panel administrativo. Un restaurante típico queda operando el mismo día, con acompañamiento en la puesta en marcha.',
    category: 'general',
    keywords: [
      'implementacion',
      'tarda',
      'tiempo',
      'configurar',
      'configuracion',
      'instalacion',
      'puesta',
      'marcha',
      'empezar',
      'rapido',
      'demora',
    ],
  },
  {
    id: 'metodos-pago',
    question: '¿Qué métodos de pago acepta?',
    answer:
      'Efectivo, transferencia y tarjeta. El sistema maneja propinas, denominaciones de billetes y monedas, y cierre de caja por turno.',
    category: 'funcionalidad',
    keywords: [
      'metodo',
      'metodos',
      'pago',
      'pagos',
      'efectivo',
      'transferencia',
      'tarjeta',
      'propina',
      'propinas',
      'caja',
      'billetes',
      'monedas',
    ],
  },
  {
    id: 'dividir-cuenta',
    question: '¿Puedo dividir la cuenta o cobrar por partes?',
    answer:
      'Sí. Los pagos se registran por orden y el sistema cierra la orden y libera la mesa cuando se cubre el saldo completo, en una operación atómica que evita cobros duplicados.',
    category: 'funcionalidad',
    keywords: [
      'dividir',
      'cuenta',
      'partes',
      'parcial',
      'parciales',
      'cobrar',
      'separar',
      'saldo',
    ],
  },
  {
    id: 'seguridad',
    question: '¿Mis datos están seguros?',
    answer:
      'Sí. Autenticación con JWT, control de acceso por roles (administrador, gerente, cajero, mesero y cocinero), validación de todas las entradas y cifrado de disco en la nube. Los datos operativos pertenecen a tu restaurante.',
    category: 'seguridad',
    keywords: [
      'seguridad',
      'datos',
      'seguros',
      'jwt',
      'roles',
      'permisos',
      'cifrado',
      'privacidad',
      'contrasena',
      'acceso',
    ],
  },
  {
    id: 'pronostico-ia',
    question: '¿Qué es el pronóstico con IA?',
    answer:
      'El servicio de IA estima ventas futuras, demanda por producto y horas pico, y detecta días anómalos a partir de tu historial. Si aún no hay suficientes datos, lo indica en lugar de inventar cifras.',
    category: 'funcionalidad',
    keywords: [
      'ia',
      'inteligencia',
      'artificial',
      'pronostico',
      'pronosticos',
      'demanda',
      'ventas',
      'prediccion',
      'forecast',
      'anomalias',
    ],
  },
  {
    id: 'celular',
    question: '¿Puedo usarlo desde el celular?',
    answer:
      'Sí. La app móvil tiene tres experiencias: gerencial (dashboard, métricas y pronósticos), POS/mesero (mesas, órdenes y cobro) y cocina (Cocina Digitalizada).',
    category: 'funcionalidad',
    keywords: [
      'celular',
      'movil',
      'telefono',
      'app',
      'aplicacion',
      'android',
      'ios',
      'mesero',
      'gerente',
      'gerencial',
      'cocina',
      'cocinero',
    ],
  },
  {
    id: 'cocina',
    question: '¿Tienen pantalla para la cocina?',
    answer:
      'Sí, con la función Cocina Digitalizada. El equipo de cocina entra con el rol Cocinero y ve una pantalla con las órdenes abiertas y su avance (Pendiente, En preparación y Listo), sincronizada en tiempo real con el salón y la caja. Es opcional: se activa con un interruptor y, si está apagada, se mantiene el flujo actual.',
    category: 'funcionalidad',
    keywords: [
      'cocina',
      'cocinero',
      'cocineros',
      'pantalla',
      'kds',
      'preparacion',
      'preparación',
      'listo',
      'pedidos',
      'comanda',
      'orden',
      'rol',
      'digitalizada',
    ],
  },
  {
    id: 'usuarios',
    question: '¿Cuántos usuarios puedo crear?',
    answer:
      'Depende del plan contratado. Cada usuario tiene un rol con permisos distintos, y el administrador gestiona el alta y la baja de cuentas.',
    category: 'planes',
    keywords: [
      'usuarios',
      'usuario',
      'crear',
      'cuantos',
      'roles',
      'permisos',
      'limite',
      'cuentas',
    ],
  },
  {
    id: 'sucursales',
    question: '¿Se puede usar en varias sucursales?',
    answer:
      'Sí, con el plan Cadena. Cada sucursal opera sus mesas y su caja, y la administración centraliza reportes y control de todas las sucursales.',
    category: 'planes',
    keywords: [
      'sucursal',
      'sucursales',
      'varias',
      'cadena',
      'multi',
      'franquicia',
      'local',
      'locales',
    ],
  },
  {
    id: 'equivocarse-orden',
    question: '¿Qué pasa si me equivoco al tomar una orden?',
    answer:
      'Se pueden agregar, editar o quitar ítems mientras la orden esté en borrador. Un feature flag permite además configurar si el mesero puede o no quitar productos.',
    category: 'funcionalidad',
    keywords: [
      'error',
      'equivoco',
      'equivocarse',
      'editar',
      'quitar',
      'eliminar',
      'orden',
      'borrador',
      'mesero',
      'corregir',
    ],
  },
  {
    id: 'soporte',
    question: '¿Ofrecen capacitación y soporte?',
    answer:
      'Sí. Incluye puesta en marcha, capacitación del personal y soporte por WhatsApp en español, de lunes a sábado.',
    category: 'soporte',
    keywords: [
      'soporte',
      'capacitacion',
      'ayuda',
      'whatsapp',
      'entrenamiento',
      'atencion',
      'contacto',
      'asistencia',
    ],
  },
  {
    id: 'reportes',
    question: '¿Puedo exportar reportes?',
    answer:
      'Sí. Los reportes de ventas, productos y cierres de caja se pueden consultar en el panel y exportar para contabilidad.',
    category: 'funcionalidad',
    keywords: [
      'reporte',
      'reportes',
      'exportar',
      'contabilidad',
      'ventas',
      'excel',
      'pdf',
      'descargar',
      'cierre',
    ],
  },
]

const STOPWORDS = new Set([
  'que',
  'como',
  'cual',
  'cuales',
  'donde',
  'cuando',
  'por',
  'para',
  'con',
  'los',
  'las',
  'del',
  'una',
  'uno',
  'unos',
  'unas',
  'este',
  'esta',
  'esto',
  'son',
  'hay',
  'me',
  'mi',
  'tu',
  'su',
  'el',
  'la',
  'en',
  'y',
  'o',
  'es',
  'se',
  'al',
  'lo',
])

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

function scoreFaq(
  item: FaqItem,
  queryTokens: string[],
  normalizedQuery: string,
): number {
  const questionTokens = new Set(tokenize(item.question))
  const keywordTokens = new Set(item.keywords.flatMap((keyword) => tokenize(keyword)))

  let score = 0
  for (const token of queryTokens) {
    if (STOPWORDS.has(token)) continue
    if (keywordTokens.has(token)) score += 3
    if (questionTokens.has(token)) score += 2
  }

  if (
    normalizedQuery.length > 4 &&
    normalizeText(item.question).includes(normalizedQuery)
  ) {
    score += 6
  }

  return score
}

/**
 * FAQ keyword matcher. Deterministic and dependency-free; this is the default
 * responder and the extension point for a future AI/RAG backend.
 */
export function respondWithFaq(query: string): ChatbotReply {
  const normalizedQuery = normalizeText(query)
  const queryTokens = tokenize(query)

  const ranked = FAQS.map((item) => ({
    item,
    score: scoreFaq(item, queryTokens, normalizedQuery),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (!best || best.score < 3) {
    return {
      answer:
        'No encontré una respuesta exacta a tu consulta. Puedes revisar las preguntas frecuentes o escribirnos por correo o WhatsApp; con gusto te ayudamos.',
      suggestions: FAQS.slice(0, 4),
    }
  }

  const seen = new Set<string>([best.item.id])
  const suggestions: FaqItem[] = []
  for (const entry of ranked.slice(1)) {
    if (suggestions.length >= 3) break
    if (seen.has(entry.item.id)) continue
    seen.add(entry.item.id)
    suggestions.push(entry.item)
  }
  for (const item of FAQS) {
    if (suggestions.length >= 3) break
    if (seen.has(item.id)) continue
    seen.add(item.id)
    suggestions.push(item)
  }

  return {
    answer: best.item.answer,
    matched: best.item,
    suggestions,
  }
}
