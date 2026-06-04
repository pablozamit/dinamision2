# Lead Magnet Gamificado

Juego 2D interactivo educativo basado en un lead-magnet de dinamización digital.

Convierte el funnel tradicional (quiz lineal de 5 pantallas) en una experiencia
gamificada con Phaser 4 + React 19 + Framer Motion.

## Stack

- **Phaser 4** — motor 2D para escenas, entidades y mecánicas
- **React 19 + TypeScript** — UI overlay, formularios, panel drag-drop
- **Framer Motion** — animaciones declarativas y drag-drop
- **Vite 7** — bundler y dev server
- **Tailwind CSS 4** — instalado pero no usado (todo es CSS custom `fi-*`)
- **Web Audio API** — efectos de sonido procedurales (sin assets externos)
- **localStorage** — persistencia de progreso

## Estructura

```
src/
├── App.tsx                              # Orquestador del flujo principal
├── data/brandData.ts                    # 8 marcas × 3 pilares (IKEA, Duolingo, etc.)
├── game/
│   ├── EventBus.ts                      # Canal único Phaser ↔ React
│   ├── main.ts                          # Config Phaser 4 + StartGame()
│   ├── scenes/                          # Hub + pilares
│   ├── entities/                        # Player + Portal (procedurales)
│   └── utils/                           # audio (Web Audio) + storage (localStorage)
├── components/
│   ├── PhaserGame.tsx                   # Wrapper React del juego Phaser
│   ├── MissionIntro.tsx                 # Landing + form + bienvenida
│   ├── ProgressBar.tsx                  # HUD React overlay
│   └── BrandPanel.tsx                   # Panel drag-drop sobre el canvas
└── index.css                            # Estilos custom `fi-*`
```

## Reglas de arquitectura

- **Comunicación React ↔ Phaser:** únicamente vía `EventBus`
- **Eventos clave:**
  - `current-scene-ready` — escena lista
  - `portal-entered` — jugador entra a un pilar
  - `brand-selected` — Phaser → React (abre panel)
  - `mechanic-complete` — React → Phaser (éxito)
  - `mechanic-fail` — React → Phaser (error)
  - `frase-clave-collected` — frase recogida
- **Acceso a `game`/`scene` desde React:** solo a través del `ref` que `App.tsx` pasa a `<PhaserGame />`
- **TypeScript estricto** — cero `any`, todo tipado
- **JSDoc** en funciones públicas

## MVP actual (Slice 1-3)

- ✅ Landing oscuro con CTA "Comenzar la Misión"
- ✅ Formulario de lead capture con validación
- ✅ Bienvenida con partículas brillantes + localStorage
- ✅ HubScene con 3 portales, jugador procedural, movimiento teclado/touch
- ✅ PillarGamification con 1 marca (IKEA) + mini-mecánica drag-drop
- ✅ Panel overlay con brand info + ordenable de 4 frases
- ✅ Feedback: partículas, sonido procedural, frase clave flotante
- ✅ ProgressBar HUD superior

## Próximos slices

- Starbuck + AXA en Gamificación
- Pilar Acompañamiento (Duolingo, Peloton, Nike) + mecánica #2
- Pilar Celebración (Spotify, Mastercard) + mecánica #3
- FinalScene con celebración + CTA real a agatapuig.com
- Quitar `three.js` del package.json (no se usa)

## Comandos

```bash
npm install      # instalar deps
npm run dev      # dev server (Vite, puerto 5173)
npm run build    # build producción
npm run preview  # preview del build
npm run lint     # ESLint
```

## Convenciones de UI

Todas las clases usan el prefijo `fi-` (de "funnel interactivo") y están en `src/index.css`.
Los design tokens (colores, fuentes, sombras) están en `:root` con CSS custom properties.

## Licencia

Privado — Ágata Puig / El Nodo Digital.
