#!/bin/bash
set -e

echo "========================================"
echo "  Instalador automatico de udyr-bot"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- PASO 1: Actualizar sistema ---
echo -e "${YELLOW}[1/9] Actualizando sistema...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ Sistema actualizado${NC}"
echo ""

# --- PASO 2: Instalar Node.js 20 ---
echo -e "${YELLOW}[2/9] Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo -e "${GREEN}✓ Node.js $(node -v) instalado${NC}"
echo ""

# --- PASO 3: Instalar ffmpeg y yt-dlp ---
echo -e "${YELLOW}[3/9] Instalando ffmpeg y yt-dlp...${NC}"
apt install -y ffmpeg wget
wget -q https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp
echo -e "${GREEN}✓ ffmpeg y yt-dlp instalados${NC}"
echo ""

# --- PASO 4: Instalar git y pm2 ---
echo -e "${YELLOW}[4/9] Instalando git y pm2...${NC}"
apt install -y git
npm install -g pm2
echo -e "${GREEN}✓ git y pm2 instalados${NC}"
echo ""

# --- PASO 5: Clonar repositorio ---
echo -e "${YELLOW}[5/9] Clonando repositorio...${NC}"
cd ~
if [ -d "udyr-bot" ]; then
    echo "La carpeta udyr-bot ya existe. Actualizando..."
    cd udyr-bot
    git pull
else
    git clone https://github.com/ProphetLemon/udyr-bot.git
    cd udyr-bot
fi
echo -e "${GREEN}✓ Repositorio listo${NC}"
echo ""

# --- PASO 6: Instalar dependencias npm ---
echo -e "${YELLOW}[6/9] Instalando dependencias de Node...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# --- PASO 7: Instalar Chromium para Playwright ---
echo -e "${YELLOW}[7/9] Instalando Chromium para Playwright...${NC}"
npx playwright install chromium
echo -e "${GREEN}✓ Chromium instalado${NC}"
echo ""

# --- PASO 8: Crear archivo .env ---
echo -e "${YELLOW}[8/9] Configurando token de Discord...${NC}"
if [ -f ".env" ]; then
    echo "El archivo .env ya existe."
    read -p "¿Quieres sobrescribirlo? (s/N): " overwrite
    if [[ "$overwrite" =~ ^[Ss]$ ]]; then
        read -sp "Pega tu DISCORD_TOKEN: " token
        echo ""
        echo "DISCORD_TOKEN=$token" > .env
        echo -e "${GREEN}✓ Token actualizado${NC}"
    else
        echo "Conservando .env existente."
    fi
else
    read -sp "Pega tu DISCORD_TOKEN: " token
    echo ""
    echo "DISCORD_TOKEN=$token" > .env
    echo -e "${GREEN}✓ Token guardado${NC}"
fi
echo ""

# --- PASO 9: Iniciar bot con PM2 ---
echo -e "${YELLOW}[9/9] Iniciando bot con PM2...${NC}"
pm2 delete udyr-bot 2>/dev/null || true
pm2 start index.js --name udyr-bot
pm2 save
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}✓ Bot iniciado${NC}"
echo ""

echo "========================================"
echo -e "${GREEN}  ¡Instalacion completa!${NC}"
echo "========================================"
echo ""
echo "Comandos utiles:"
echo "  pm2 status          - Ver estado del bot"
echo "  pm2 logs udyr-bot   - Ver logs en tiempo real"
echo "  pm2 restart udyr-bot - Reiniciar el bot"
echo "  pm2 stop udyr-bot   - Detener el bot"
echo ""
echo "Para actualizar el bot en el futuro:"
echo "  cd ~/udyr-bot && git pull && npm install && pm2 restart udyr-bot"
echo ""
