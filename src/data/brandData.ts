export interface BrandResult {
  contexto: string;
  conexion: string;
  tactica: string;
  fraseClave: string;
  /**
   * Frases cortas para el mini-juego "ordena de menos a más gamificado".
   * Solo presente en marcas con mecánica drag-drop (MVP: IKEA).
   * El array debe estar en orden ascendente de impacto (índice 0 = menos gamificado).
   */
  gamificationPhrases?: string[];
}

export interface Brand {
  name: string;
  result: BrandResult;
}

export const gamificationBrands: Brand[] = [
  {
    name: 'IKEA',
    result: {
      contexto: 'IKEA transformó la experiencia de compra de muebles —algo que nadie disfrutaba— en un recorrido interactivo donde cada paso desbloquea una recompensa emocional.',
      conexion: 'Conecta con el deseo humano de sentirse competente y reconocido. La gamificación no es solo puntos: es hacer que tu cliente se sienta el héroe de su propia historia.',
      tactica: 'Su app IKEA Place usa realidad aumentada para que los usuarios "ganen" la visualización perfecta de su espacio. Cada interacción es un mini-logro que refuerza la decisión de compra.',
      fraseClave: '"No vendes muebles, vendes la sensación de haber creado algo tuyo".',
      gamificationPhrases: [
        'Ver un anuncio de un mueble en su feed',
        'Guardar productos en una lista de favoritos',
        'Acumular puntos por cada visita a la tienda',
        'Proyectar el mueble en su propia habitación con realidad aumentada',
      ],
    },
  },
  {
    name: 'Starbucks',
    result: {
      contexto: 'Starbucks no vende café, vende estatus. Su programa de recompensas convierte cada compra en puntos que desbloquean niveles, como en un videojuego.',
      conexion: 'Toca la necesidad psicológica de progreso visible. Cuando tu cliente ve que "avanza", gasta más y con mayor frecuencia —no por el producto, sino por la sensación de logro.',
      tactica: 'Sistema de estrellas con niveles (Green → Gold) que crean urgencia por mantener el estatus. Las notificaciones personalizadas activan el efecto de pérdida aversiva: "Te faltan 2 estrellas para tu bebida gratis".',
      fraseClave: '"La gamificación bien hecha no se siente como un juego, se siente como un privilegio".',
    },
  },
  {
    name: 'AXA',
    result: {
      contexto: 'AXA revolucionó un sector tan aburrido como los seguros convirtiendo la prevención en un juego. Con su app, los usuarios ganan puntos por hábitos saludables.',
      conexion: 'Demuestra que la gamificación funciona incluso en industrias "imposibles". Si puedes gamificar seguros, puedes gamificar cualquier cosa.',
      tactica: 'Programa "AXA Drive" donde los conductores seguros acumulan puntos y reducen su prima. Cada viaje sin incidente es una victoria que se celebra y se recompensa con descuentos reales.',
      fraseClave: '"Cuando gamificas lo aburrido, conviertes obligación en motivación".',
    },
  },
];

export const acompanamientoBrands: Brand[] = [
  {
    name: 'Duolingo',
    result: {
      contexto: 'Duolingo convirtió el aprendizaje de idiomas —tradicionalmente solitario y frustrante— en una experiencia donde nunca estás solo. Su búho verde es el acompañante que siempre te necesita.',
      conexion: 'El acompañamiento no es vigilar al usuario, es caminar a su lado. Duolingo lo entiende: cada notificación es un "te echo de menos", no un "tienes que estudiar".',
      tactica: 'Sistema de rachas (streaks) que genera compromiso emocional, leagues competitivas que crean comunidad, y notificaciones hiper-personalizadas con el tono justo de culpa cariñosa.',
      fraseClave: '"El mejor acompañamiento hace que tu cliente sienta que abandonarte sería abandonar a un amigo".',
    },
  },
  {
    name: 'Peloton',
    result: {
      contexto: 'Peloton no vende bicicletas, vende la sensación de tener un entrenador personal que te conoce, una comunidad que te espera y un compromiso que no puedes romper.',
      conexion: 'El acompañamiento premium crea dependencia positiva. Cuando tu cliente siente que sin ti perdería algo irremplazable, no busca alternativas.',
      tactica: 'Clases en vivo con métricas en tiempo real, leaderboards que crean competencia sana, y entrenadores que mencionan tu nombre. Cada sesión es un evento social, no un entrenamiento.',
      fraseClave: '"Acompañar no es dar información, es dar pertenencia".',
    },
  },
  {
    name: 'Nike',
    result: {
      contexto: 'Nike acompañó a millones de personas comunes a correr su primera carrera. No con zapatillas, sino con una app que les dijo: "Tú puedes, y yo te guío paso a paso".',
      conexion: 'El acompañamiento más poderoso es el que transforma la identidad. Nike no te ayuda a correr —te convierte en corredor. Y una vez que eres corredor, necesitas a Nike.',
      tactica: 'Nike Run Club ofrece planes personalizados gratuitos con audio coaching, desafíos grupales y celebraciones de hitos. El acompañamiento es tan bueno que el producto se vende solo.',
      fraseClave: '"Cuando acompañas la transformación de tu cliente, tu producto deja de ser un gasto y se convierte en inversión".',
    },
  },
];

export const celebracionBrands: Brand[] = [
  {
    name: 'Spotify',
    result: {
      contexto: 'Spotify convirtió datos de escucha en el evento cultural del año. Su Wrapped no es un resumen: es una fiesta de celebración personal que millones esperan como si fuera Navidad.',
      conexion: 'La celebración más poderosa es la que refleja quién es tu cliente. Cuando Spotify te dice "tuviste un año increíble", no celebra la plataforma —te celebra a ti.',
      tactica: 'Wrapped combina storytelling visual, datos personalizados y compartibilidad social. Cada historia es única, cada usuario se siente especial, y cada compartición es marketing orgánico gratuito.',
      fraseClave: '"La mejor celebración no es premiar al cliente, es devolverle su propia historia convertida en obra de arte".',
    },
  },
  {
    name: 'Mastercard',
    result: {
      contexto: 'Mastercard transformó transacciones financieras en momentos de celebración con su plataforma "Priceless". Cada compra con tarjeta se convierte en acceso a experiencias inolvidables.',
      conexion: 'La celebración comercial más sofisticada no dice "gracias por comprar", dice "mereces algo que el dinero no puede comprar". Y luego te lo da.',
      tactica: 'Experiencias Priceless que recompensan a los clientes con acceso exclusivo a conciertos, cenas con chefs estrella y eventos únicos. La tarjeta es la llave, la celebración es el castillo.',
      fraseClave: '"Cuando celebras a tu cliente con algo que no puede comprar, tu marca se vuelve invaluable".',
    },
  },
];
