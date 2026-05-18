# AGENTS.md — Instrucciones para OpenCode

## Reglas de oro

- **NO hacer `git commit` ni `git push` bajo ninguna circunstancia** salvo que el usuario lo pida explícitamente con frases como "haz commit", "sube los cambios", "git commit push", etc.
- **NO crear slash commands**. El bot usa exclusivamente comandos de texto con prefijo (`udyr <comando>`).
- **NO instalar dependencias globales** ni modificar nada fuera del directorio de trabajo sin confirmación previa.

## Proyecto: udyr-bot

Bot de Discord con prefijo `udyr`. Arquitectura modular:

```
udyr-bot/
├── index.js          # Solo bootstrap, eventos y enrutamiento
├── commands/         # Un archivo por comando (exports function)
├── lib/              # Shared logic (colas, datos de LoL, etc.)
├── .env              # Variables de entorno (NO commitear)
└── AGENTS.md         # Este archivo
```

### Convenciones de código

- Usar **CommonJS** (`require` / `module.exports`).
- Nombres de archivos en **kebab-case** o **camelCase**.
- Mensajes de consola con prefijo `[COMANDO]` en mayúsculas.
- Manejar errores con `try/catch` y loggear con `console.error`.

### Filtrado de mensajes

El bot solo escucha en el par `(ALLOWED_GUILD_ID, ALLOWED_CHANNEL_ID)` configurado en `.env`. Cualquier mensaje fuera de ese par guild+canal debe ser ignorado.

### Comandos existentes

| Comando | Descripción |
|---------|-------------|
| `udyr yt <url>` | Reproduce URL de YouTube o playlist |
| `udyr yt <busqueda>` | Busca en YouTube (fallback a yt-dlp si play-dl falla) |
| `udyr pause` / `resume` / `skip` / `stop` | Control de reproducción |
| `udyr queue` | Muestra la cola |
| `udyr clean <num>` | Bulk delete de mensajes |
| `udyr lol <campeon> <linea> [build#]` | Screenshots de build en u.gg |
| `udyr lol equipo` | Asigna líneas y champs aleatorios a la gente en VC |
| `udyr retar @usuario` | Duelo por turnos con HP, críticos, defensa, parry |
| `udyr help` / `udyr h` | Ayuda |

### Playwright / u.gg

- Usar `browser.newContext()` + `context.addCookies()` para cookies de consentimiento.
- Bloquear scripts de CMP (Quantcast, OneTrust, etc.) vía `page.route()`.
- Si falla un selector, usar `page.evaluate()` como nuclear option.
- Capturas de LoL: enviar **3 mensajes separados** (runas, skills, items).

### Git

- **Nunca** ejecutar `git commit`, `git push`, `git reset`, `git rebase` sin autorización explícita del usuario.
- Si el usuario modifica algo manualmente y luego pide commit, revisar `git status` y `git diff` antes de proceder.

### Estilo de comunicación con el usuario

- Responder en **español**.
- **Directo y conciso.** Sin rodeos, sin disclaimers innecesarios, sin respuestas genéricas.
- Adapta la profundidad técnica a la pregunta — si es código, responde como a un desarrollador; si es una duda simple, no des un ensayo.
- **Evaluación honesta:** Si el usuario presenta un razonamiento o solución, evalúalo con honestidad. Señala debilidades directamente si las hay. Si es sólido, dilo sin buscar pegas artificiales. Nada de elogios automáticos ni cumplidos de apertura tipo "buena pregunta".
- **Incertidumbre:** Si no estás seguro, dilo. Prefiere "no lo sé" o "habría que verificar X" a una respuesta con tono confiado pero especulativa. Distingue claramente entre lo que sabes, lo que deduces y lo que supones.
- **Alcance:** Responde a lo que se pregunta. No añadas "próximos pasos", recomendaciones colaterales ni alternativas no pedidas, salvo que sean críticas para el problema. Si detectas algo importante fuera del alcance, menciónalo en una línea al final, no lo desarrolles sin permiso.
- Si algo puede interpretarse como tarea o pregunta, asumir que es una **tarea** y actuar con herramientas.
