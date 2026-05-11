#!/bin/bash

# Script de control remoto para udyr-bot en Raspberry Pi
# Uso: ./control.sh [status|logs|restart|stop|start|update]

PI_USER="REDACTED_PI_USER"
PI_HOST="REDACTED_IP"
PM2="/usr/bin/pm2"

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
        ssh ${PI_USER}@${PI_HOST} "${PM2} status udyr-bot"
        ;;
    logs)
        ssh ${PI_USER}@${PI_HOST} "${PM2} logs udyr-bot"
        ;;
    restart)
        ssh ${PI_USER}@${PI_HOST} "${PM2} restart udyr-bot"
        echo "Bot reiniciado."
        ;;
    stop)
        ssh ${PI_USER}@${PI_HOST} "${PM2} stop udyr-bot"
        echo "Bot detenido."
        ;;
    start)
        ssh ${PI_USER}@${PI_HOST} "${PM2} start udyr-bot"
        echo "Bot iniciado."
        ;;
    update)
        ssh ${PI_USER}@${PI_HOST} "cd ~/udyr-bot && git pull && npm install && ${PM2} restart udyr-bot"
        echo "Bot actualizado y reiniciado."
        ;;
    *)
        show_help
        ;;
esac
