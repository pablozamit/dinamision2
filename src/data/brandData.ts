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
    color: 0x3a7bd5,
    glowColor: 0x6ec6ff,
    brands: [
      {
        id: 'ikea',
        name: 'IKEA',
        result: {
          contexto:
            'Transformó tareas rutinarias como el montaje de muebles en un juego digital colaborativo donde los puntos acumulados se cambian por descuentos y ventajas reales.',
          conexion:
            'Conecta con el "Efecto IKEA": un patrón psicológico por el cual valoramos un 1000% más aquello en lo que invertimos nuestro propio esfuerzo físico y mental.',
          tactica:
            'Creación de una dinámica interactiva donde los clientes juegan a diseñar y montar digitalmente, convirtiendo la pereza del proceso en un activo de compra.',
          fraseClave: '"No vendes muebles, vendes la sensación de haber creado algo tuyo".',
        },
      },
      {
        id: 'starbucks',
        name: 'Starbucks',
        result: {
          contexto:
            'Transformó la tarjeta de puntos tradicional en un sistema de misiones y retos en la aplicación móvil para coleccionar sellos digitales.',
          conexion:
            'Abre pequeños huecos de curiosidad en el cerebro del cliente y activa la necesidad psicológica de progreso visible.',
          tactica:
            'Diseño de desafíos semanales aleatorios (como probar tres granos distintos) para desbloquear recetas ocultas y estatus de cliente privilegiado.',
          fraseClave: '"La gamificación bien hecha no se siente como un juego, se siente como un privilegio".',
        },
      },
      {
        id: '8belts',
        name: '8Belts',
        result: {
          contexto:
            'Revolucionó la retención de alumnos en la enseñanza de idiomas implementando un sistema lúdico de onboarding de alta intensidad durante los primeros 15 días.',
          conexion:
            'Ataca la resistencia inicial creando un pico de dopamina y logro temprano que frena en seco el deseo subconsciente de abandonar el programa.',
          tactica:
            'Establecimiento de mecánicas lúdicas de impacto inmediato en la fase de bienvenida del servicio para reducir drásticamente las bajas y devoluciones.',
          fraseClave:
            '"El destino de un cliente se decide en los primeros quince días; hazlo una aventura interactiva y se quedará de por vida".',
        },
      },
    ],
  },
  {
    id: 'acompanamiento',
    name: 'ACOMPAÑAMIENTO',
    color: 0x4caf50,
    glowColor: 0x80e27e,
    brands: [
      {
        id: 'duolingo',
        name: 'Duolingo',
        result: {
          contexto:
            'Empareja a los usuarios con un amigo cada semana para superar un reto juntos y evitar perder la racha mediante el compromiso social.',
          conexion:
            'Demuestra que el acompañamiento no consiste en vigilar ni fiscalizar al usuario, sino en activar la responsabilidad compartida para eliminar la soledad.',
          tactica:
            'Lanzamiento de misiones conjuntas por parejas semanales apoyadas en notificaciones empáticas y alertas de racha comunitaria.',
          fraseClave: '"El mejor acompañamiento hace que tu cliente sienta que abandonarte sería abandonar a un amigo".',
        },
      },
      {
        id: 'nike',
        name: 'Nike',
        result: {
          contexto:
            'Incluye en su aplicación voces de entrenadores reales que te hablan al oído como si fueran amigos íntimos para que no abandones la meta.',
          conexion:
            'Cambia el foco de la autocompetición fría hacia una transformación identitaria guiada y profundamente empática.',
          tactica:
            'Integración en Nike Run Club de planes personalizados y audio coaching emocional enfocado en sostener al usuario en los momentos de fatiga.',
          fraseClave: '"Cuando acompañas la transformación, tu producto deja de ser un gasto y se convierte en inversión".',
        },
      },
      {
        id: 'clubvida10',
        name: 'Club Vida 10',
        result: {
          contexto:
            'Transformó un curso tradicional de hábitos saludables en una comunidad viva donde las alumnas se rinden cuentas y se apoyan mutuamente.',
          conexion:
            'Combate de raíz el aislamiento crónico del alumno en el entorno digital mediante la creación de redes de soporte íntimo a largo plazo.',
          tactica:
            'Diseño estratégico de dinámicas de "accountability partners" y retos semanales cruzados para generar adherencia real al servicio.',
          fraseClave: '"Acompañar no es dar información técnica; acompañar es dar un espacio humano de pertenencia".',
        },
      },
    ],
  },
  {
    id: 'celebracion',
    name: 'CELEBRACIÓN',
    color: 0xf6a000,
    glowColor: 0xffd54f,
    brands: [
      {
        id: 'spotify',
        name: 'Spotify',
        result: {
          contexto:
            'Transforma los datos de uso de todo un año en diapositivas coloridas y un juego visual que celebra tu "estado de ánimo musical" con su Wrapped.',
          conexion:
            'Activa la celebración de la identidad, logrando que el usuario se sienta el héroe y protagonista absoluto de la historia de la marca.',
          tactica:
            'Despliegue anual de un resumen interactivo hiper-personalizado optimizado de forma nativa para ser compartido en canales sociales.',
          fraseClave: '"La mejor celebración no es premiar al cliente, es devolverle su propia historia".',
        },
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        result: {
          contexto:
            'Crea experiencias que juegan con los cinco sentidos, como un sonido característico al pagar o clases de repostería en directo bajo el concepto Priceless.',
          conexion:
            'Apela al subconsciente asociando el acto transaccional con momentos memorables e invaluables de felicidad y autorrealización.',
          tactica:
            'Desarrollo de una plataforma de recompensas sensoriales y accesos exclusivos a eventos únicos imposibles de comprar con dinero.',
          fraseClave: '"Cuando celebras a tu cliente con algo invaluable, tu marca se vuelve invaluable".',
        },
      },
      {
        id: 'volkswagen',
        name: 'Volkswagen',
        result: {
          contexto:
            'Lanzó el proyecto "Speed Camera Lottery" en Suecia, utilizando el dinero de las multas de tráfico para sortear un premio en metálico entre los conductores que respetaban el límite.',
          conexion:
            'Sustituye el castigo tradicional por una dinámica de motivación positiva, sentimiento de logro inmediato y expectativa de recompensa.',
          tactica:
            'Campaña interactiva "The Fun Theory" en radares reales, logrando reducir la velocidad media de circulación en un 22% de forma totalmente voluntaria.',
          fraseClave: '"Premiar el comportamiento correcto engancha diez veces más que castigar el error".',
        },
      },
    ],
  },
  {
    id: 'comunidad',
    name: 'COMUNIDAD Y CO-CREACIÓN',
    color: 0xe91e63,
    glowColor: 0xff6090,
    brands: [
      {
        id: 'netflix',
        name: 'Netflix',
        result: {
          contexto:
            'Monta réplicas físicas e inmersivas de los escenarios de sus series para que los fans jueguen y se hagan fotos, convirtiéndolos en difusores de la marca.',
          conexion:
            'Transforma al consumidor pasivo en un co-creador activo de contenido y difusor orgánico del universo de la marca.',
          tactica:
            'Activación de escenografías efímeras y experiencias interactivas en el mundo real conectadas con dinámicas digitales.',
          fraseClave: '"Dale a tu comunidad un escenario épico y ellos se encargarán de expandir tu imperio".',
        },
      },
      {
        id: 'lego',
        name: 'LEGO',
        result: {
          contexto:
            'Une el juego físico y el digital mediante una dinámica familiar que usa la cámara del móvil para buscar piezas virtuales ocultas entre los bloques reales.',
          conexion:
            'Une dos identidades en un mismo espacio de co-creación: el niño que explora jugando y el adulto nostálgico que reconecta con su familia.',
          tactica:
            'Lanzamiento de la plataforma LEGO Insiders donde la propia comunidad propone, vota y decide los próximos sets que la empresa fabricará de forma oficial.',
          fraseClave: '"Una marca verdaderamente amada es una marca que ha sido co-creada por su propia tribu".',
        },
      },
      {
        id: 'yamaha',
        name: 'Yamistar Yamaha',
        result: {
          contexto:
            'Eliminó las barreras de acceso regalando unas plantillas de cartón sencillas para convertirlas en gafas de realidad virtual caseras con el propio teléfono.',
          conexion:
            'Quita el freno económico y tecnológico haciendo sentir al fan de a pie que está metido dentro del box del equipo de carreras.',
          tactica:
            'Dinámica híbrida de co-creación analógica (diseño de cartón) para consumir contenidos inmersivos premium de forma masiva.',
          fraseClave:
            '"La alta tecnología por sí sola no genera pertenencia; la sencillez compartida y accesible, sí".',
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