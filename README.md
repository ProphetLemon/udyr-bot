# udyr-bot

Bot de Discord para reproducir musica de YouTube usando comandos de texto.

## Comandos

- `udyr yt <url o busqueda>` - Reproduce una URL de YouTube, playlist, o busca en YouTube y te deja elegir.
- `udyr pause` - Pausa la reproduccion.
- `udyr resume` - Reanuda la reproduccion.
- `udyr skip` - Salta la cancion actual.
- `udyr stop` - Detiene todo y desconecta.
- `udyr queue` - Muestra la cola.
- `udyr clean <num>` - Borra los ultimos <num> mensajes.
- `udyr lol <campeon> <linea> [build#]` - Screenshot de build de u.gg. `build#` es opcional para elegir una build alternativa (1, 2, 3...).
- `udyr lol equipo` - Asigna champs y lineas aleatorias a tu canal de voz.
- `udyr retar @usuario` - Duelo por turnos con clases, stats, pasivas, combos y muerte subita.
- `udyr ruleta` - Tragaperras de frutas con patrones y multiplicadores.
- `udyr blackjack` - Blackjack contra el dealer con doblar y dividir.
- `udyr ppt @usuario` - Piedra, papel o tijera 1v1.
- `udyr dados` - Craps: tira los dados contra la casa.
- `udyr mayor` - Mayor o menor: adivina la siguiente carta.
- `udyr carrera` - Apuesta a caballos y mira la carrera.
- `udyr conecta4 @usuario` - Conecta 4 por turnos.
- `udyr ajedrez @usuario` - Ajedrez 1v1 (notacion algebraica).
- `udyr chat <mensaje>` - Preguntale lo que sea a la IA (DeepSeek, via OpenCode Zen).
- `udyr help` / `udyr h` - Muestra esta ayuda.

Cualquier mensaje en el canal permitido que no empiece por `udyr` se rutea automaticamente al chat AI. No hace falta escribir `udyr chat`; puedes hablarle directamente al bot. Usa `udyr chat reset` para borrar el historial de la conversacion.

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
udyr ruleta
udyr blackjack
udyr ajedrez @usuario
udyr chat explicame que es una closure en JS
```

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- ffmpeg instalado en el sistema
- yt-dlp instalado en el sistema
- Navegador Chromium/Chrome instalado (para el comando `udyr lol`, se instala automaticamente con `npx playwright install chromium`)

## Instalacion local

1. Clona el repositorio o descarga los archivos.
2. Renombra `.env.example` a `.env` y rellena las variables:
   ```
   DISCORD_TOKEN=TU_TOKEN_AQUI
   OPENCODE_API_KEY=TU_API_KEY_OPCIONAL_PARA_CHAT
   ALLOWED_GUILD_ID=ID_DE_TU_SERVIDOR_DISCORD
   ALLOWED_CHANNEL_ID=ID_DEL_CANAL_PERMITIDO
   PI_USER=TU_USUARIO_SSH_PI
   PI_HOST=TU_IP_O_HOST_PI
   ```
   `ALLOWED_GUILD_ID` y `ALLOWED_CHANNEL_ID` se obtienen activando "Developer Mode" en Discord y haciendo clic derecho sobre el servidor/canal → "Copy Server ID" / "Copy Channel ID". `OPENCODE_API_KEY` es necesaria para el chat AI; sin ella el bot responde "Falta API key". `PI_USER` y `PI_HOST` son para el script `control.sh` de despliegue remoto en Raspberry Pi.
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el bot:
   ```bash
   npm start
   ```

## Despliegue en Raspberry Pi

`install-rpi.sh` automatiza la instalacion completa en una Pi (Debian/Raspberry Pi OS): instala Node.js, ffmpeg, yt-dlp, pm2, Chromium y clona el repo. Solo necesitas ejecutarlo desde la Pi:

```bash
bash install-rpi.sh
```

`control.sh` permite controlar el bot remotamente via SSH desde tu maquina local. Necesita `PI_USER` y `PI_HOST` configurados en tu `.env`:

```bash
./control.sh status        # Ver estado del bot
./control.sh logs          # Ver logs en tiempo real
./control.sh restart       # Reiniciar
./control.sh stop          # Detener
./control.sh start         # Iniciar
./control.sh update        # Actualizar desde GitHub y reiniciar
./control.sh update --force  # Igual pero hace stash de cambios locales antes
```

## Permisos necesarios

El bot necesita estos permisos en tu servidor de Discord:
- Ver canales
- Enviar mensajes
- Gestionar mensajes (para `udyr clean`)
- Conectar a canales de voz
- Hablar en canales de voz
- Anadir reacciones (para el menu de seleccion de `udyr yt` y el chat AI)
- Moderar miembros (para el chat AI)

Tambien asegurate de activar estos Privileged Gateway Intents en Discord Developer Portal → Bot:
- **Message Content Intent** — necesario para leer el contenido de los mensajes y procesar comandos.
- **Server Members Intent** — necesario para resolver miembros en el chat AI y en `udyr lol equipo`.

## Hosting recomendado

- **Railway** — Plan gratuito, no se duerme. Bueno para empezar sin pagar.
- **Fly.io** — $5/mes de créditos gratuitos. Funciona bien con Playwright hasta que se agoten.
- **Oracle Cloud Free Tier** — Servicios "Always Free" (1GB RAM). Requiere tarjeta de crédito para registrarse.
- **Hetzner / Contabo** — ~3-5€/mes. VPS barato, estable y sin sorpresas para bots con Playwright.
