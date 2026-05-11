#!/bin/bash

# Script de control remoto para udyr-bot en Raspberry Pi
# Uso: ./control.sh [status|logs|restart|stop|start|update]

PI_USER="REDACTED_PI_USER"
PI_HOST="REDACTED_IP"

# Buscar pm2 en el Pi
find_pm2() {
    ssh ${PI_USER}@${PI_HOST} "bash -c 'which pm2 || find /usr -name pm2 -type f 2>/dev/null | head -1 || find /opt -name pm2 -type f 2>/dev/null | head -1'"
}

PM2_CMD=$(find_pm2)

if [ -z "$PM2_CMD" ]; then
    echo "Error: pm2 no encontrado en el Raspberry Pi."
    echo "Instala el bot primero con: ./install-rpi.sh"
    exit 1
fi

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
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && pm2 status udyr-bot'"
        ;;
    logs)
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && pm2 logs udyr-bot'"
        ;;
    restart)
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && pm2 restart udyr-bot'"
        echo "Bot reiniciado."
        ;;
    stop)
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && pm2 stop udyr-bot'"
        echo "Bot detenido."
        ;;
    start)
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && pm2 start udyr-bot'"
        echo "Bot iniciado."
        ;;
    update)
        ssh ${PI_USER}@${PI_HOST} "bash -c 'export PATH=\\\$(dirname $PM2_CMD):\\\$PATH && cd ~/udyr-bot && git pull && npm install && pm2 restart udyr-bot'"
        echo "Bot actualizado y reiniciado."
        ;;
    *)
        show_help
        ;;
esac
