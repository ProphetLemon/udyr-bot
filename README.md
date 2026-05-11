# udyr-bot

Bot de Discord para reproducir musica de YouTube usando comandos de texto.

## Comandos

- `udyr yt <url de youtube>` - Reproduce directamente el video de la URL.
- `udyr yt <busqueda>` - Busca 5 resultados en YouTube y te deja elegir del 1 al 5.
- `udyr yt <url de playlist>` - Anade toda la playlist a la cola.
- `udyr pause` - Pausa la reproduccion.
- `udyr resume` - Reanuda la reproduccion.
- `udyr skip` - Salta la cancion actual.
- `udyr stop` - Detiene todo y desconecta.
- `udyr queue` - Muestra la cola.
- `udyr clean <num>` - Borra los ultimos <num> mensajes.
- `udyr lol <campeon> <linea> [build#]` - Captura de pantalla de la build en u.gg. `build#` es opcional para elegir una build alternativa (1, 2, 3...).
- `udyr lol equipo` - Asigna una linea y un campeon aleatorio a cada integrante del canal de voz.
- `udyr retar @usuario` - Reta a un usuario a un duelo por turnos. Cada jugador recibe una clase aleatoria (Tanque, Asesino, Mago, Tirador), stats de combate y una pasiva unica. Sistema de combos, criticos, defensas, parrys, empates y muerte subita a partir de la ronda 11.
- `udyr help` / `udyr h` - Muestra esta ayuda.

Ejemplos:
```
udyr yt https://www.youtube.com/watch?v=dQw4w9WgXcQ
udyr yt loba shakira
udyr yt https://www.youtube.com/playlist?list=...
udyr skip
udyr clean 10
udyr lol akali mid
udyr lol yasuo top
udyr lol soraka supp 2
udyr lol equipo
udyr retar @usuario
```

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- ffmpeg instalado en el sistema
- yt-dlp instalado en el sistema
- Navegador Chromium/Chrome instalado (para el comando `udyr lol`, se instala automaticamente con `npx playwright install chromium`)

## Instalacion local

1. Clona el repositorio o descarga los archivos.
2. Renombra `.env.example` a `.env` y pon tu token de bot de Discord:
   ```
   DISCORD_TOKEN=TU_TOKEN_AQUI
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el bot:
   ```bash
   npm start
   ```

## Permisos necesarios

El bot necesita estos permisos en tu servidor de Discord:
- Ver canales
- Enviar mensajes
- Gestionar mensajes (para `udyr clean`)
- Conectar a canales de voz
- Hablar en canales de voz

Tambien asegurate de activar el **Message Content Intent** en el portal de desarrolladores de Discord (Discord Developer Portal > Bot > Privileged Gateway Intents).

## Hosting recomendado

- **Railway** — Plan gratuito, no se duerme. Bueno para empezar sin pagar.
- **Fly.io** — $5/mes de créditos gratuitos. Funciona bien con Playwright hasta que se agoten.
- **Oracle Cloud Free Tier** — Servicios "Always Free" (1GB RAM). Requiere tarjeta de crédito para registrarse.
- **Hetzner / Contabo** — ~3-5€/mes. VPS barato, estable y sin sorpresas para bots con Playwright.
