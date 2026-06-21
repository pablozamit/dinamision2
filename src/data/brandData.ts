export interface BrandResult {
  contexto: string;
  conexion: string;
  tactica: string;
  fraseClave: string;
}

export interface Brand {
  id: string;
  name: string;
  result: BrandResult;
}

export interface PillarData {
  id: string;
  name: string;
  color: number;
  glowColor: number;
  brands: Brand[];
}

export const pillars: PillarData[] = [
  {
    id: 'gamification',
    name: 'GAMIFICACIÓN',
    color: 0x4a1a6b,
    glowColor: 0x9b59b6,
    brands: [
      {
        id: 'foursquare',
        name: 'Foursquare',
        result: {
          contexto: "Foursquare nació como una aplicación móvil de geolocalización donde los usuarios hacían 'check-in' en lugares reales para competir por 'alcaldías', un título honorífico otorgado de forma lúdica a quien más veces visitaba un local.",
          conexion: "Su estrategia fracasó cuando decidieron dividir la app y eliminar por completo estas mecánicas de juego originales y las medallas virtuales que mantenían el interés y la competencia activa entre los usuarios.",
          tactica: "Al quitar el incentivo del juego y la visibilidad del progreso, transformaron una experiencia social altamente adictiva en una utilidad plana y aburrida, provocando la migración masiva de su audiencia.",
          fraseClave: '"ANTÍDOTO: Nunca elimines las mecánicas que enganchan a tu tribu. Si necesitas evolucionar, añade capas nuevas sin destruir el núcleo lúdico que generó la adicción original".',
        },
      },
      {
        id: 'klout',
        name: 'Klout',
        result: {
          contexto: "Klout fue una plataforma diseñada para medir la influencia online de las personas otorgando una puntuación pública del 1 al 100 basada en su actividad y alcance en redes sociales.",
          conexion: "El error fatal en su estrategia de gamificación fue crear mecánicas opacas y algoritmos cambiantes que generaban frustración y una enorme ansiedad social en lugar de un sentimiento de logro positivo.",
          tactica: "Al ser percibida por la comunidad como una herramienta de fiscalización y castigo psicológico más que como un juego de progreso sano, el descontento destruyó su reputación y arrastró a la marca hasta su cierre definitivo.",
          fraseClave: '"ANTÍDOTO: La gamificación debe generar orgullo y logro, nunca ansiedad. Si tu sistema de puntos humilla en lugar de motivar, estás cavando tu propia tumba".',
        },
      },
      {
        id: 'subway',
        name: 'Subway',
        result: {
          contexto: "La cadena de comida rápida Subway basaba la fidelidad de sus clientes en una exitosa tarjeta física donde coleccionabas sellos con cada compra hasta completar un panel y obtener un bocadillo gratis.",
          conexion: "Su caída ocurrió al sustituir bruscamente este sistema por un complejo programa digital que eliminaba por completo el feedback inmediato y la recompensa rápida en el mostrador.",
          tactica: "Al convertir la acumulación de ventajas en un proceso tedioso, confuso y sin un camino lúdico claro, los consumidores habituales sintieron que su esfuerzo ya no valía la pena y abandonaron la marca.",
          fraseClave: '"ANTÍDOTO: La recompensa debe sentirse inmediata y tangible. Si conviertes un sistema simple y adictivo en un laberinto digital, perderás la confianza ganada".',
        },
      },
    ],
  },
  {
    id: 'acompanamiento',
    name: 'ACOMPAÑAMIENTO',
    color: 0x1a3a2b,
    glowColor: 0x27ae60,
    brands: [
      {
        id: 'udacity',
        name: 'Udacity',
        result: {
          contexto: "Udacity nació como una de las grandes plataformas pioneras de educación online abierta (MOOC), ofreciendo cursos especializados en tecnología desarrollados por los mejores expertos del sector.",
          conexion: "Su estrategia inicial fracasó estrepitosamente, sufriendo tasas de abandono superiores al 95%, porque se limitaron a empaquetar y vender vídeos de alta calidad, dejando al alumno completamente solo y aislado frente a la pantalla.",
          tactica: "Comprendieron tarde que el contenido sin una guía humana es inútil, viéndose obligados a refundar todo su modelo para incorporar mentores y dinámicas de rendición de cuentas que sostuvieran al estudiante.",
          fraseClave: '"ANTÍDOTO: El mejor contenido del mundo no vale nada sin acompañamiento humano. Diseña siempre un sistema de soporte que sostenga al usuario en los momentos de flaqueza".',
        },
      },
      {
        id: 'fitbit',
        name: 'Fitbit',
        result: {
          contexto: "Fitbit revolucionó el mercado tecnológico con sus pulseras inteligentes diseñadas para registrar la actividad física diaria, monitorizar los pasos y medir el rendimiento corporal de los usuarios.",
          conexion: "Su debilidad radicó en limitar su estrategia a un hardware que arrojaba métricas y datos biológicos fríos, sin ofrecer una verdadera guía humana sobre hábitos de salud.",
          tactica: "Al no sostener de forma empática al usuario en los momentos de fatiga ni enseñarle qué hacer con esos números, millones de dispositivos terminaron abandonados en cajones a los pocos meses.",
          fraseClave: '"ANTÍDOTO: Los datos sin contexto humano son ruido. Transforma cada métrica en una conversación empática que guíe al usuario hacia su siguiente paso".',
        },
      },
      {
        id: 'googleglass',
        name: 'Google Glass',
        result: {
          contexto: "Google Glass fue el ambicioso proyecto de gafas de realidad aumentada desarrollado por Google para integrar la navegación por internet y las notificaciones digitales directamente en la línea de visión del usuario.",
          conexion: "La marca fracasó de forma frontal al lanzar este producto disruptivo al mercado masivo sin diseñar ningún protocolo de bienvenida ni acompañamiento social para mitigar los miedos del entorno.",
          tactica: "Al dejar a los primeros compradores completamente solos e indefensos ante la sospecha de privacidad de los demás, el producto generó un estigma y rechazo social tan agresivo que arruinó la reputación del proyecto.",
          fraseClave: '"ANTÍDOTO: Un producto disruptivo necesita un onboarding social, no solo técnico. Acompaña a tu usuario ante el mundo, no solo ante la pantalla".',
        },
      },
    ],
  },
  {
    id: 'celebracion',
    name: 'CELEBRACIÓN',
    color: 0x6b1a1a,
    glowColor: 0xc0392b,
    brands: [
      {
        id: 'ratners',
        name: 'Ratners Group',
        result: {
          contexto: "Ratners Group era el mayor gigante de la joyería masiva en el Reino Unido, un imperio comercial que basaba su éxito en vender piezas accesibles para celebrar momentos especiales de la clase trabajadora.",
          conexion: "Su consejero delegado destruyó la compañía en un solo día al declarar públicamente en una conferencia que sus propios productos eran 'basura barata' y que sus pendientes duraban menos que un sándwich.",
          tactica: "Esta brutal anti-celebración maltrató de forma directa el orgullo de su clientela, destruyendo la confianza en la marca e infligiendo una caída inmediata de 500 millones de libras en su valor de mercado.",
          fraseClave: '"ANTÍDOTO: Jamás humilles el orgullo de tu cliente. Si él celebra tu producto, tú celebras su elección. Romper esa alianza es destruir tu negocio".',
        },
      },
      {
        id: 'netflix_horror',
        name: 'Netflix',
        result: {
          contexto: "Netflix vivió una de sus crisis reputacionales más severas al anunciar por sorpresa la separación de sus servicios de alquiler de DVD y streaming bajo una nueva marca llamada Qwikster.",
          conexion: "En lugar de celebrar, premiar y cuidar la veteranía de su base de suscriptores más leales, la directiva penalizó su permanencia obligándolos a sufrir un aumento de precio del 60% y una incómoda doble facturación.",
          tactica: "Al maltratar la lealtad del cliente en lugar de festejarla, la marca sufrió la baja fulminante de 800.000 usuarios en tres meses.",
          fraseClave: '"ANTÍDOTO: Tus clientes más antiguos merecen ser premiados, no penalizados. Cada cambio de precio debe ir envuelto en una celebración de su lealtad".',
        },
      },
      {
        id: 'blockbuster',
        name: 'Blockbuster',
        result: {
          contexto: "Blockbuster dominó de forma absoluta el mercado internacional de alquiler de películas físicas en videoclubes gracias a una gigantesca red de tiendas y un catálogo imbatible.",
          conexion: "Su estrategia comercial condenó su futuro al basar una parte masiva de sus ingresos anuales en penalizar económicamente a sus clientes mediante recargos abusivos por retrasos en las devoluciones.",
          tactica: "Al estructurar su rentabilidad sobre el castigo del error del usuario en lugar de celebrar y premiar su recurrencia, la marca cavó su propia fosa en cuanto apareció una alternativa que eliminaba esa fricción.",
          fraseClave: '"ANTÍDOTO: Nunca bases tu modelo de negocio en castigar al cliente. La rentabilidad sostenible nace de premiar la recurrencia, no de penalizar el error".',
        },
      },
    ],
  },
  {
    id: 'comunidad',
    name: 'COMUNIDAD Y CO-CREACIÓN',
    color: 0x1a1a4b,
    glowColor: 0x3498db,
    brands: [
      {
        id: 'digg',
        name: 'Digg',
        result: {
          contexto: "Digg fue el agregador de noticias más influyente del planeta, una plataforma donde la portada del sitio era co-creada de forma orgánica por los usuarios mediante un sistema democrático de votación de enlaces.",
          conexion: "La marca cayó en la irrelevancia absoluta al lanzar un rediseño que eliminaba estas herramientas de control comunitario para priorizar los contenidos patrocinados de grandes corporaciones de medios.",
          tactica: "Al silenciar a su propia tribu y destruir el poder de la co-creación, los usuarios se sintieron traicionados y emigraron en masa hacia Reddit en cuestión de días, extinguiendo el negocio.",
          fraseClave: '"ANTÍDOTO: La comunidad que co-crea tu producto es tu activo más valioso. Si la silencias para monetizar, no perderás usuarios: perderás el alma de tu marca".',
        },
      },
      {
        id: 'tumblr',
        name: 'Tumblr',
        result: {
          contexto: "Tumblr se consolidó como una plataforma de microblogueo única en internet, un ecosistema seguro donde millones de usuarios co-creaban la identidad de la red mediante arte, contenido visual y blogs de nicho.",
          conexion: "La directiva destruyó más del 30% del tráfico global de la noche a la mañana al prohibir de forma abrupta todo el contenido adulto sin consultar ni involucrar a su base de creadores.",
          tactica: "Al atacar directamente las raíces del espacio de expresión libre co-creado por su propia tribu, la marca rompió el vínculo de confianza, provocando un éxodo irreversible.",
          fraseClave: '"ANTÍDOTO: Antes de cambiar las reglas del juego, consulta a tu tribu. Una decisión impuesta sin diálogo destruye la confianza más rápido que cualquier error técnico".',
        },
      },
      {
        id: 'blackberry',
        name: 'BlackBerry',
        result: {
          contexto: "BlackBerry lideró de forma absoluta el mercado de la telefonía móvil profesional gracias a sus dispositivos con teclado físico y su sistema cerrado de mensajería instantánea enfocado en la seguridad corporativa.",
          conexion: "La marca perdió todo su pastel de mercado al cerrarse por completo a la co-creación externa de aplicaciones y software que demandaba su comunidad de desarrolladores y usuarios.",
          tactica: "Al ignorar la evolución cultural de su tribu, que pedía pantallas táctiles modernas y un ecosistema abierto, su insistencia obstinada los aisló por completo del mercado hasta su total desaparición.",
          fraseClave: '"ANTÍDOTO: Escucha lo que tu comunidad te pide antes de que sea tarde. Un ecosistema cerrado es una tumba con fecha de caducidad".',
        },
      },
    ],
  },
];

/** Busca una marca por id en todos los pilares. */
export function findBrandById(brandId: string): Brand | undefined {
  for (const pillar of pillars) {
    const brand = pillar.brands.find((b) => b.id === brandId);
    if (brand) return brand;
  }
  return undefined;
}