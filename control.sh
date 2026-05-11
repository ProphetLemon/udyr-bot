#!/bin/bash

# Script de control remoto para udyr-bot en Raspberry Pi
# Uso: ./control.sh [status|logs|restart|stop|start|update]

PI_USER="REDACTED_PI_USER"
PI_HOST="REDACTED_IP"

# Función para ejecutar comandos en el Pi con PATH correcto
pi_exec() {
    ssh ${PI_USER}@${PI_HOST} "export PATH=\$HOME/.local/bin:\$HOME/.npm-global/bin:/usr/local/bin:\$PATH && $1"
}

show_help() {
    echo "Uso: ./control.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  status   - Ver estado del bot"
    echo "  logs     - Ver logs en tiempo real (Ctrl+C para salir)"
    echo "  restart  - Reiniciar el bot"
    echo "  stop     - Detener el bot"
    echo "  start    - Iniciar el bot"
    echo "  update   - Actualizar desde GitHub y reiniciar"
    echo ""
}

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

COMMAND=$1

case $COMMAND in
    status)
        pi_exec "pm2 status udyr-bot"
        ;;
    logs)
        pi_exec "pm2 logs udyr-bot"
        ;;
    restart)
        pi_exec "pm2 restart udyr-bot"
        echo "Bot reiniciado."
        ;;
    stop)
        pi_exec "pm2 stop udyr-bot"
        echo "Bot detenido."
        ;;
    start)
        pi_exec "pm2 start udyr-bot"
        echo "Bot iniciado."
        ;;
    update)
        pi_exec "cd ~/udyr-bot && git pull && npm install && pm2 restart udyr-bot"
        echo "Bot actualizado y reiniciado."
        ;;
    *)
        show_help
        ;;
esac
