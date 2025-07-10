#!/bin/bash

# VPS Data Streamer Deployment Script
# Citi Dashboard - Production Data Streaming Service

set -e  # Exit on any error

echo "🚀 VPS Data Streamer Deployment Script"
echo "======================================"

# Configuration
VPS_USER=${VPS_USER:-"root"}
VPS_HOST=${VPS_HOST:-""}
VPS_PORT=${VPS_PORT:-"22"}
DEPLOY_DIR=${DEPLOY_DIR:-"/home/zoha/citi-dashboard-streamer"}
SERVICE_NAME="citi-dashboard-streamer"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if VPS_HOST is provided
if [ -z "$VPS_HOST" ]; then
    log_error "VPS_HOST environment variable is required"
    echo "Usage: VPS_HOST=your-vps-ip ./deploy.sh"
    echo "Optional: VPS_USER=username VPS_PORT=22 DEPLOY_DIR=/opt/citi-dashboard-streamer"
    exit 1
fi

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    log_warning "No SSH key found. You may need to enter password multiple times."
fi

log_info "Deployment Configuration:"
echo "  VPS Host: $VPS_HOST"
echo "  VPS User: $VPS_USER"
echo "  VPS Port: $VPS_PORT"
echo "  Deploy Directory: $DEPLOY_DIR"
echo ""

# Test SSH connection
log_info "Testing SSH connection to VPS..."
log_warning "You will be prompted for your VPS password multiple times during deployment."
echo "Testing connection (you may need to enter your password)..."
if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST exit; then
    log_success "SSH connection successful"
else
    log_error "Cannot connect to VPS. Please check your SSH configuration."
    exit 1
fi

# Create deployment directory on VPS
log_info "Creating deployment directory on VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $DEPLOY_DIR"

# Copy files to VPS
log_info "Copying files to VPS..."
scp -P $VPS_PORT -r ./* $VPS_USER@$VPS_HOST:$DEPLOY_DIR/

# Install dependencies and setup on VPS
log_info "Setting up VPS environment..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    cd $DEPLOY_DIR
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install dependencies
    echo "Installing npm dependencies..."
    npm install
    
    # Make scripts executable
    chmod +x vps-streamer.js
    chmod +x deploy.sh
    
    # Test the installation
    echo "Testing VPS Data Streamer..."
    node vps-streamer.js --test
    
    echo "✅ VPS setup completed successfully"
EOF

# Create systemd service (optional)
log_info "Creating systemd service..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << 'EOL'
[Unit]
Description=Citi Dashboard VPS Data Streamer
After=network.target

[Service]
Type=simple
User=$VPS_USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node vps-streamer.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=VPS_SERVER_NAME=VPS-DataStreamer-01
Environment=VPS_REGION=LATAM

[Install]
WantedBy=multi-user.target
EOL

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    
    echo "✅ Systemd service created and enabled"
EOF

# Start the service
log_info "Starting VPS Data Streamer service..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "sudo systemctl start $SERVICE_NAME"

# Check service status
log_info "Checking service status..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "sudo systemctl status $SERVICE_NAME --no-pager"

log_success "🎉 VPS Data Streamer deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Check service logs: ssh $VPS_USER@$VPS_HOST 'journalctl -u $SERVICE_NAME -f'"
echo "2. Check service status: ssh $VPS_USER@$VPS_HOST 'systemctl status $SERVICE_NAME'"
echo "3. Stop service: ssh $VPS_USER@$VPS_HOST 'systemctl stop $SERVICE_NAME'"
echo "4. Restart service: ssh $VPS_USER@$VPS_HOST 'systemctl restart $SERVICE_NAME'"
echo ""
echo "🔧 Configuration:"
echo "- Service runs automatically on boot"
echo "- Logs are available via journalctl"
echo "- Configuration can be updated in $DEPLOY_DIR"
echo ""
echo "🌐 Your VPS is now streaming data to your MacBook!"
echo "Configure your MacBook to connect to: $VPS_HOST:9092"
