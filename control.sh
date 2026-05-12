#!/bin/bash
set -euo pipefail

# Script de control remoto para udyr-bot en Raspberry Pi
# Uso: ./control.sh [status|logs|restart|stop|start|update [--force]]

PI_USER="REDACTED_PI_USER"
PI_HOST="REDACTED_IP"
PM2="/usr/bin/pm2"
REMOTE_DIR="~/udyr-bot"

show_help() {
    cat <<EOF
Uso: ./control.sh [comando]

Comandos:
  status            Ver estado del bot
  logs              Ver logs en tiempo real (Ctrl+C para salir)
  restart           Reiniciar el bot
  stop              Detener el bot
  start             Iniciar el bot
  update            Actualizar desde GitHub y reiniciar
  update --force    Igual que update pero hace stash de cambios locales en la Pi
                    antes del pull (recuperable con 'git stash list' desde la Pi)
EOF
}

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

run_remote() {
    ssh "${PI_USER}@${PI_HOST}" "$1"
}

COMMAND=$1
shift || true

case $COMMAND in
    status)
        run_remote "${PM2} status udyr-bot"
        ;;
    logs)
        run_remote "${PM2} logs udyr-bot"
        ;;
    restart)
        run_remote "${PM2} restart udyr-bot"
        echo "Bot reiniciado."
        ;;
    stop)
        run_remote "${PM2} stop udyr-bot"
        echo "Bot detenido."
        ;;
    start)
        run_remote "${PM2} start udyr-bot"
        echo "Bot iniciado."
        ;;
    update)
        FORCE=0
        if [ "${1:-}" = "--force" ]; then
            FORCE=1
        fi

        if [ "$FORCE" -eq 1 ]; then
            STASH_MSG="control.sh pre-update $(date +%s)"
            run_remote "cd ${REMOTE_DIR} \
                && git stash push -u -m '${STASH_MSG}' || true \
                && git pull \
                && npm install \
                && ${PM2} restart udyr-bot"
        else
            run_remote "cd ${REMOTE_DIR} \
                && git pull \
                && npm install \
                && ${PM2} restart udyr-bot"
        fi
        echo "Bot actualizado y reiniciado."
        ;;
    *)
        show_help
        exit 1
        ;;
esac
