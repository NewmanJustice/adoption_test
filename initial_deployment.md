# Initial Azure Deployment Guide

This guide documents the step-by-step process for deploying the Adoption Digital Platform to Azure App Service.

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- GitHub repository with Actions enabled
- Existing Azure resource group: `CFT-software-engineering`
- Existing Azure Database for PostgreSQL

## Overview

| Component | Azure Service | Name |
|-----------|--------------|------|
| Resource Group | - | CFT-software-engineering |
| App Service Plan | App Service Plan | cft-adoption-plan |
| Web App | App Service (Linux) | cft-adoption-dev |
| Database | PostgreSQL Flexible Server | (existing) |
| Region | UK South | uksouth |

---

## Part 1: Azure Infrastructure Setup

Run these commands from your local machine (outside dev container) where Azure CLI is installed.

### Step 1.1: Verify Azure Login

```bash
az login
az account show
```

### Step 1.2: Set Variables

```bash
# Set these variables for use in subsequent commands
RESOURCE_GROUP="CFT-software-engineering"
LOCATION="uksouth"
APP_SERVICE_PLAN="cft-adoption-plan"
APP_NAME="cft-adoption-dev"
```

### Step 1.3: Create App Service Plan

```bash
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux
```

> **Note:** B1 is suitable for dev/test. For production, consider S1 or P1V2.

### Step 1.4: Create Web App

```bash
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "NODE:20-lts"
```

### Step 1.5: Configure App Settings

```bash
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV="production" \
    PORT="8080" \
    ANNOTATION_ENABLED="true" \
    ANNOTATION_DB_PATH="/home/prototype-annotator/annotator.sqlite"
```

> **Note:** `ANNOTATION_ENABLED=true` for dev environment. Set to `false` for production.

### Step 1.6: Configure Database Connection

Replace the placeholder values with your actual PostgreSQL connection details:

```bash
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    DATABASE_URL="postgresql://USERNAME:PASSWORD@HOSTNAME:5432/DATABASE?sslmode=require"
```

> **Security:** Consider using Azure Key Vault references instead of storing credentials directly.
> Format: `@Microsoft.KeyVault(VaultName=myvault;SecretName=mysecret)`

### Step 1.7: Configure Startup Command

```bash
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "node dist/index.js"
```

---

## Part 2: GitHub Actions Setup

### Step 2.1: Create Azure Service Principal

This creates credentials for GitHub Actions to deploy to Azure:

```bash
az ad sp create-for-rbac \
  --name "github-actions-cft-adoption" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

This outputs JSON - **copy the entire output** for the next step.

### Step 2.2: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste the JSON output from Step 2.1

### Step 2.3: Verify Workflow File

The workflow file has been created at `.github/workflows/deploy.yml`. It will:
- Trigger on pushes to `main` branch
- Build client and server
- Package everything together
- Deploy to Azure App Service

---

## Part 3: Code Changes Required

Before deployment, the server needs to serve the client's static files.

### Step 3.1: Update Server to Serve Static Files

Add this to `server/src/app.ts` after the middleware setup:

```typescript
import path from 'path';

// Serve static files from client build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle client-side routing - serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}
```

### Step 3.2: Update Vite Config for Production Base URL

In `client/vite.config.ts`, ensure the base URL is set correctly:

```typescript
export default defineConfig({
  base: '/',
  // ... rest of config
});
```

---

## Part 4: Deploy

### Step 4.1: Trigger Deployment

Once GitHub secret is configured, push to main to trigger deployment:

```bash
git add .
git commit -m "chore: Add Azure deployment configuration"
git push origin main
```

### Step 4.2: Monitor Deployment

- GitHub: Check **Actions** tab for workflow progress
- Azure: Check deployment logs in Azure Portal → App Service → Deployment Center

### Step 4.3: Verify Deployment

```bash
# Check app is running
curl https://cft-adoption-dev.azurewebsites.net/api/health

# Or open in browser
az webapp browse --name $APP_NAME --resource-group $RESOURCE_GROUP
```

---

## Part 5: Post-Deployment Configuration

### Step 5.1: Run Database Migrations

Option A: Via Azure CLI (Kudu SSH)
```bash
az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP
# Then in SSH session:
cd /home/site/wwwroot
npm run migrate:up
```

Option B: Add migration to startup (recommended)
Add to GitHub workflow or create a startup script.

### Step 5.2: Configure Custom Domain (Optional)

```bash
az webapp config hostname add \
  --webapp-name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname your-custom-domain.gov.uk
```

### Step 5.3: Enable HTTPS Only

```bash
az webapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --https-only true
```

---

## Environment Variables Reference

| Variable | Dev Value | Prod Value | Description |
|----------|-----------|------------|-------------|
| `NODE_ENV` | `production` | `production` | Node environment |
| `PORT` | `8080` | `8080` | Server port (Azure default) |
| `DATABASE_URL` | (connection string) | (connection string) | PostgreSQL connection |
| `SESSION_SECRET` | (generate unique) | (generate unique) | Express session secret |
| `ANNOTATION_ENABLED` | `true` | `false` | Enable prototype annotator |
| `ANNOTATION_DB_PATH` | `/home/prototype-annotator/annotator.sqlite` | N/A | SQLite path (persistent) |

### Generate Session Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### View Application Logs

```bash
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### View Deployment Logs

```bash
az webapp log deployment show --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### SSH into Container

```bash
az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### Restart App

```bash
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP
```

---

## Adding Production Slot Later

When ready to add a production slot:

```bash
# Create the production app
az webapp create \
  --name cft-adoption-prod \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "NODE:20-lts"

# Configure with ANNOTATION_ENABLED=false
az webapp config appsettings set \
  --name cft-adoption-prod \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV="production" \
    ANNOTATION_ENABLED="false" \
    # ... other settings
```

Update the GitHub workflow to deploy to different apps based on branch.

---

## Security Checklist

- [ ] Database credentials stored in App Settings (or Key Vault)
- [ ] Session secret is unique per environment
- [ ] HTTPS-only enabled
- [ ] ANNOTATION_ENABLED=false for production
- [ ] GitHub secret AZURE_CREDENTIALS configured
- [ ] Service principal has minimal required permissions
