# Auto-Deploy Backend on Push

Backend automatically deploys to your VM whenever you push to `main` branch.

## Setup (One-Time)

### Step 1: Generate SSH Key (if you don't have one)

On your local machine:
```bash
ssh-keygen -t ed25519 -C "github-deploy" -N "" -f ~/.ssh/github_deploy
```

### Step 2: Add Public Key to VM

```bash
# Copy the public key
cat ~/.ssh/github_deploy.pub

# SSH to VM and add it
ssh ubuntu@144.24.147.134
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 3: Add Secret to GitHub

1. Go to: https://github.com/ronak301/parivaar-unified/settings/secrets/actions
2. Click "New repository secret"
3. Add three secrets:

| Name | Value |
|------|-------|
| `VM_HOST` | `144.24.147.134` |
| `VM_USER` | `ubuntu` |
| `VM_SSH_KEY` | Paste contents of `~/.ssh/github_deploy` (private key) |

**⚠️ Private key only** — copy the entire key starting with `-----BEGIN` and ending with `-----END`.

### Step 4: Test It

Push a small change to backend and watch it deploy:

```bash
git push origin main
```

Go to: https://github.com/ronak301/parivaar-unified/actions

You'll see "Deploy Backend" workflow running. Once it finishes (green ✓), your backend is live on port 3002!

## How It Works

1. You push to `main` → GitHub Actions triggers
2. Workflow SSHes to VM
3. Pulls latest code: `git pull origin main`
4. Runs: `bash deploy.sh`
5. Verifies API is responding
6. Done! 🚀

## What Triggers Deploy

- ✅ Push to `main` branch
- ✅ Changes in `backend/` folder
- ✅ Changes to this workflow file

## View Logs

- GitHub Actions: https://github.com/ronak301/parivaar-unified/actions
- VM logs: `ssh ubuntu@144.24.147.134` then `docker-compose -f backend/docker-compose.prod.yml logs -f`

## Disable Auto-Deploy

Comment out the workflow or delete `.github/workflows/deploy-backend.yml`.

## Manual Deploy (If Needed)

```bash
ssh ubuntu@144.24.147.134
cd /apps/ronak/parivaar-web-unified/backend
bash deploy.sh
```

---

That's it! **Every push automatically deploys.** ✨
