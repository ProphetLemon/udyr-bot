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
- `udyr retar @usuario` - Reta a un usuario a un duelo por turnos con ataques, criticos, defensas y parrys.
- `udyr help` / `udyr h` - Muestra la ayuda.

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

## Hospedar en Render.com

> **IMPORTANTE**: El plan gratuito de Render.com tiene una limitacion critica para bots de Discord: los **Web Services** se duermen despues de 15 minutos de inactividad. Para un bot de Discord que necesita estar siempre conectado, esto es problematico.

### Opciones en Render:

1. **Background Worker (recomendado)**:
   - No se duerme automaticamente
   - Ve a tu dashboard de Render > New > Background Worker
   - Conecta tu repositorio de GitHub/GitLab
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Anade tu `DISCORD_TOKEN` en Environment Variables

2. **Web Service + UptimeRobot** (hack gratuito):
   - Crea un Web Service
   - El bot incluye un servidor HTTP interno que responde a pings
   - Usa UptimeRobot para hacer ping cada 5 minutos y evitar que se duerma
   - Nota: No es 100% fiable, puede haber cortes breves

### Mejores alternativas gratuitas para bots de Discord:

- **Oracle Cloud Free Tier**: VPS siempre gratis (1GB RAM, 2 CPU). Ideal para bots.
- **Fly.io**: Da $5/mes de creditos gratuitos. Suficiente para un bot pequeno.
- **Railway**: Plan gratuito con limites, pero no se duerme como Render.
- **VPS barato**: OVH, Hetzner, Contabo (~3-5€/mes). La opcion mas estable.

### Despliegue rapido en Render (Background Worker):

1. Sube tu codigo a GitHub/GitLab
2. En Render: **New** > **Background Worker**
3. Conecta tu repositorio
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Ve a **Environment** y anade:
   - `DISCORD_TOKEN` = tu token de bot
7. Click en **Create Background Worker**

### Notas para Render:
- No necesitas `ffmpeg` ni `yt-dlp` en Render (ya estan preinstalados en los workers de Ubuntu)
- Si no estan disponibles, anadelos como comandos de build:
  ```bash
  apt-get update && apt-get install -y ffmpeg yt-dlp && npm install
  ```
