#!/usr/bin/env bash
set -e

# Always use the vscode user's home for nvm
export NVM_DIR="/home/vscode/.nvm"
set -x
if [ -s "$NVM_DIR/nvm.sh" ]; then
	echo "NVM already installed."
else
	echo "Installing NVM..."
	sudo -u vscode curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | sudo -u vscode bash || true
fi

# Source nvm and install Node.js as vscode user
if [ -s "$NVM_DIR/nvm.sh" ]; then
	export NVM_DIR="/home/vscode/.nvm"
	echo "Installing Node.js LTS..."
	[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && echo "nvm sourced"
	[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion" && echo "nvm bash_completion sourced"
	echo "Running: nvm install --lts"
	nvm install --lts && echo "nvm install --lts succeeded" || echo "nvm install failed, continuing..."
	echo "Running: nvm use --lts"
	nvm use --lts && echo "nvm use --lts succeeded" || echo "nvm use failed, continuing..."
	echo "Node version: $(node --version 2>/dev/null || echo 'not found')"
	echo "NPM version: $(npm --version 2>/dev/null || echo 'not found')"
	echo "✅ NVM and Node.js LTS installed"
else
	echo "❌ NVM not found after install. Skipping Node.js setup."
fi

# Install Azure CLI
echo "Installing Azure CLI..."
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
echo "✅ Azure CLI installed"  

# Install Co-pilot CLI
echo "Installing Co-pilot CLI..."
curl -fsSL https://gh.io/copilot-install | bash
echo "✅ Co-pilot CLI installed"
if curl -fsSL https://gh.io/copilot-install | bash; then
	echo "✅ Co-pilot CLI installed"
else
	echo "❌ Co-pilot CLI install failed, continuing..."
fi

# Install kubelogin for AKS authentication
echo "Installing kubelogin..."
KUBELOGIN_VERSION=$(curl -s https://api.github.com/repos/Azure/kubelogin/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
curl -sSL "https://github.com/Azure/kubelogin/releases/download/${KUBELOGIN_VERSION}/kubelogin-linux-amd64.zip" -o /tmp/kubelogin.zip
unzip -q /tmp/kubelogin.zip -d /tmp
sudo mv /tmp/bin/linux_amd64/kubelogin /usr/local/bin/
sudo chmod +x /usr/local/bin/kubelogin
rm -rf /tmp/kubelogin.zip /tmp/bin
echo "✅ kubelogin ${KUBELOGIN_VERSION} installed"
if curl -sSL "https://github.com/Azure/kubelogin/releases/download/${KUBELOGIN_VERSION}/kubelogin-linux-amd64.zip" -o /tmp/kubelogin.zip \
	&& unzip -q /tmp/kubelogin.zip -d /tmp \
	&& sudo mv /tmp/bin/linux_amd64/kubelogin /usr/local/bin/ \
	&& sudo chmod +x /usr/local/bin/kubelogin \
	&& rm -rf /tmp/kubelogin.zip /tmp/bin; then
	echo "✅ kubelogin ${KUBELOGIN_VERSION} installed"
else
	echo "❌ kubelogin install failed, continuing..."
fi

# Configure bash history for unlimited size
echo "Configuring bash history..."
cat >> /home/vscode/.bashrc << 'EOF'

# Unlimited bash history
HISTSIZE=-1
HISTFILESIZE=-1
EOF
echo "✅ Bash history configured"
if cat >> /home/vscode/.bashrc << 'EOF'

# Unlimited bash history
HISTSIZE=-1
HISTFILESIZE=-1
EOF
then
	echo "✅ Bash history configured"
else
	echo "❌ Bash history config failed, continuing..."
fi

echo "✅ Dev container setup complete."

echo "Install PostgreSQL Client"
sudo apt-get update && sudo apt-get install -y postgresql-client && echo "✅ PostgreSQL Client installed" || echo "❌ PostgreSQL Client install failed, continuing..."


