#!/bin/bash

# Auto-Deploy Setup Helper
# This script generates SSH key and shows you what to do next

set -e

echo "🚀 Setting up auto-deploy..."
echo ""

# Step 1: Generate SSH key
KEY_FILE="$HOME/.ssh/github_deploy"

if [ -f "$KEY_FILE" ]; then
    echo "✓ SSH key already exists at $KEY_FILE"
else
    echo "📝 Generating SSH key..."
    ssh-keygen -t ed25519 -C "github-deploy" -N "" -f "$KEY_FILE"
    echo "✓ SSH key generated"
fi

echo ""
echo "================================"
echo "STEP 1: Copy Public Key to VM"
echo "================================"
echo ""
echo "Run these commands on your VM:"
echo ""
echo "ssh ubuntu@144.24.147.134"
echo ""
echo "Then paste this:"
echo "---"
cat "$KEY_FILE.pub"
echo "---"
echo ""
echo "Into this command (on the VM):"
echo ""
echo "mkdir -p ~/.ssh && echo 'PASTE_KEY_ABOVE' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
echo ""
read -p "Press Enter when you've done that on the VM... "

echo ""
echo "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@144.24.147.134 'echo ✓ SSH works!' 2>/dev/null; then
    echo "✓ SSH connection successful!"
else
    echo "✗ SSH failed. Make sure you added the public key to VM's ~/.ssh/authorized_keys"
    exit 1
fi

echo ""
echo "================================"
echo "STEP 2: Add GitHub Secrets"
echo "================================"
echo ""
echo "Go to: https://github.com/ronak301/parivaar-unified/settings/secrets/actions"
echo ""
echo "Click 'New repository secret' and add these (copy-paste ready):"
echo ""
echo "---"
echo ""

echo "Secret 1:"
echo "Name: VM_HOST"
echo "Value: 144.24.147.134"
echo ""

echo "Secret 2:"
echo "Name: VM_USER"
echo "Value: ubuntu"
echo ""

echo "Secret 3:"
echo "Name: VM_SSH_KEY"
echo "Value: (copy from below)"
echo ""
echo "---"
cat "$KEY_FILE"
echo "---"
echo ""
echo "Copy EVERYTHING between the --- lines (including -----BEGIN and -----END)"
echo ""

read -p "Press Enter when you've added all 3 secrets to GitHub... "

echo ""
echo "================================"
echo "✓ All done!"
echo "================================"
echo ""
echo "Auto-deploy is now ready!"
echo ""
echo "Test it:"
echo "  1. Make a small change to backend/"
echo "  2. git push origin main"
echo "  3. Watch: https://github.com/ronak301/parivaar-unified/actions"
echo "  4. Your backend auto-deploys! 🚀"
echo ""
