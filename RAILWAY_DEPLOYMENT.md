# Railway Deployment Guide for OwerFlowNFT

This guide will walk you through deploying your Solana NFT Marketplace to Railway.

## Prerequisites

1. Create a [Railway](https://railway.app/) account
2. Push your code to a GitHub repository
3. Have your Helius API key ready

## Deployment Steps

### Method 1: Direct from GitHub (Recommended)

1. **Login to Railway Dashboard**
   - Go to [https://railway.app/dashboard](https://railway.app/dashboard)
   - Log in with GitHub or create a new account

2. **Create a New Project**
   - Click "New Project" in the dashboard
   - Select "Deploy from GitHub repo"

3. **Connect Your Repository**
   - Select the GitHub repository containing your Solana marketplace app
   - Railway will automatically detect the settings from your railway.json file

4. **Add Environment Variables** (if needed)
   - Click on the "Variables" tab in your project
   - Add:
     ```
     VITE_HELIUS_API_KEY=288226ba-2ab1-4ba5-9cae-15fa18dd68d1
     ```

5. **Deploy**
   - Railway will automatically build and deploy your application
   - Monitor the build logs to ensure everything is working

6. **Access Your Deployed App**
   - Once deployed, click on the "Settings" tab 
   - Railway will provide a custom domain where your app is hosted
   - You can also configure a custom domain in the settings

### Method 2: Using Railway CLI

If you prefer using the command line:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project** (if not connecting to existing project)
   ```bash
   railway init
   ```

4. **Deploy Your App**
   ```bash
   railway up
   ```

5. **Add Environment Variables** (if needed)
   ```bash
   railway variables set VITE_HELIUS_API_KEY=288226ba-2ab1-4ba5-9cae-15fa18dd68d1
   ```

6. **Open Your Deployed App**
   ```bash
   railway open
   ```

## Troubleshooting

If you encounter any issues during deployment:

1. **Build Failures**
   - Check the build logs in the Railway dashboard
   - Common issues include TypeScript errors or missing dependencies

2. **Runtime Errors**
   - Check application logs in the "Logs" tab
   - Verify that your environment variables are set correctly

3. **API Issues**
   - Ensure your Helius API key is correctly set in the environment variables
   - Check CORS settings if API calls are failing

4. **Redeployment**
   - Railway automatically redeploys when you push changes to your GitHub repository
   - You can also manually trigger deployments in the dashboard

## Maintaining Your Deployment

- Railway provides 500 hours of free usage per month
- Monitor your usage in the Railway dashboard
- Consider upgrading your plan for production applications with high traffic

## Useful Railway Commands

```bash
# View project information
railway status

# View project logs
railway logs

# Run a local command within your Railway environment
railway run [command]

# List environment variables
railway variables list

# Delete a service
railway service delete
``` 