# Render Deployment Guide for Leap360

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com - free!)
- Supabase account (sign up at https://supabase.com - free!)
- Your code pushed to a GitHub repository

## Deployment Steps

### Step 0: Set Up Supabase Database (Do This First!)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Name: `leap360`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
   - Plan: **Free** (500MB database, 50,000 monthly active users)
   - Click "Create new project"

3. **Get Database Connection String**:
   - Go to Project Settings (gear icon) → Database
   - Scroll to "Connection string" section
   - Copy the **"Connection pooling"** URI (Transaction mode recommended)
   - Format: `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - **Save this URL - you'll need it for Render!**

4. **Important Supabase Notes**:
   - Use **Connection Pooling URI** (port 6543) not Direct Connection (port 5432)
   - Transaction mode is best for FastAPI/SQLAlchemy
   - Free tier: No expiration (unlike Render's 90-day limit!)

### Option 1: Automatic Deployment with Blueprint (Recommended)

1. **Push your code to GitHub** (including the `render.yaml` file)

2. **Go to Render Dashboard**: https://dashboard.render.com

3. **Create New Blueprint Instance**:
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your code
   - Render will automatically detect the `render.yaml` file
   - Click "Apply"

4. **Render will create**:
   - Backend API service (`leap360-api`)
   - Frontend client service (`leap360-client`)

5. **Configure DATABASE_URL** (critical!):
   - Go to `leap360-api` service
   - Environment → Click "Add Environment Variable"
   - Key: `DATABASE_URL`
   - Value: Paste your Supabase connection string from Step 0
   - Save changes (service will auto-redeploy)

6. **Update CORS settings** (after first deploy):
   - Go to `leap360-api` service settings
   - Update `ALLOWED_ORIGINS` environment variable
   - Replace with your actual client URL: `["https://leap360-client.onrender.com"]`
   - Save and redeploy

### Option 2: Manual Deployment

#### Step 1: Create Supabase Database
Follow **Step 0** above to set up your Supabase database and get the connection string.

#### Step 2: Deploy Backend API
1. Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `leap360-api`
   - **Runtime**: Docker
   - **Region**: Choose closest to your users (preferably same as Supabase)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `kernel/web`
   - **Dockerfile Path**: `ops/remote/Dockerfile.web`
   - **Plan**: Free
4. **Environment Variables**:
   - `DATABASE_URL`: Paste your Supabase connection pooling URL from Step 1
   - `SECRET_KEY`: Generate a strong random string (e.g., use `openssl rand -hex 32`)
   - `DEBUG`: `false`
   - `ALLOWED_ORIGINS`: `["*"]` (we'll update this after client deploys)
5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. **Copy your API URL** (e.g., `https://leap360-api.onrender.com`)

#### Step 3: Deploy Frontend Client
1. Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `leap360-client`
   - **Runtime**: Docker
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `kernel/client`
   - **Dockerfile Path**: `ops/remote/Dockerfile.client`
   - **Docker Command**: `bash -c "exec yarn start --hostname 0.0.0.0 --port ${PORT}"`
   - **Plan**: Free
4. **Docker Build Arguments** (click "Add Build Arg"):
   - Key: `NEXT_PUBLIC_LEAP360_API_BASE_URL`
   - Value: Your API URL from Step 2 (e.g., `https://leap360-api.onrender.com`)
5. Click "Create Web Service"
6. Wait for deployment
7. **Copy your Client URL** (e.g., `https://leap360-client.onrender.com`)

#### Step 4: Update CORS
1. Go back to `leap360-api` service
2. Environment → Edit `ALLOWED_ORIGINS`
3. Update to: `["https://leap360-client.onrender.com"]` (use your actual URL)
4. Save → Service will auto-redeploy

## Post-Deployment

### Access Your App
- **Frontend**: https://leap360-client.onrender.com
- **Backend API**: https://leap360-api.onrender.com
- **Database**: Managed in Supabase Dashboard (includes Table Editor, SQL Editor, and monitoring)

### Important Notes

#### Free Tier Limitations (Render)
- Services **spin down after 15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** to wake up
- 750 hours/month per service (enough for 1 service running 24/7)

#### Free Tier Limitations (Supabase)
- 500MB database storage
- 50,000 monthly active users
- 2GB bandwidth
- 1GB file storage
- **No time limit** - Free forever!

#### Performance Tips
- Keep Render services active: Use a cron job or uptime monitor (e.g., UptimeRobot) to ping every 10 minutes
- Consider upgrading Render to paid plans ($7/month per service) for always-on services
- Supabase free tier is generous - can stay free much longer!

#### Supabase Advantages
- **Built-in Table Editor**: View and edit data directly in Supabase dashboard
- **SQL Editor**: Run queries and migrations easily
- **Real-time monitoring**: See database usage and performance
- **Automatic backups**: Available on Pro plan ($25/month)
- **PostgREST API**: Auto-generated REST API (if you need it later)
- **No expiration**: Unlike Render's free database (90 days)

#### Environment Variables
Your backend needs these environment variables:
- `DATABASE_URL` - Your Supabase connection pooling URI (from Supabase dashboard)
- `SECRET_KEY` - Generate with: `openssl rand -hex 32`
- `DEBUG` - Set to `false` for production
- `ALLOWED_ORIGINS` - JSON array of allowed frontend URLs
- `PORT` - Auto-provided by Render (don't set manually)

Your frontend needs these:
- `NEXT_PUBLIC_LEAP360_API_BASE_URL` - Your backend API URL
- `PORT` - Auto-provided by Render

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Verify Dockerfile paths are correct
- Ensure all dependencies are in `pyproject.toml` and `package.json`

### Database Connection Issues
- Use **Supabase Connection Pooling URI** (port 6543, not Direct Connection port 5432)
- Verify `DATABASE_URL` format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
- Ensure password in connection string is correctly URL-encoded
- Check Supabase project is active and healthy

### CORS Errors
- Ensure `ALLOWED_ORIGINS` includes your client URL
- Format: `["https://your-client-url.onrender.com"]` (JSON array as string)
- No trailing slashes in URLs

### Client Can't Connect to API
- Verify `NEXT_PUBLIC_LEAP360_API_BASE_URL` is set correctly
- Check if API service is running (check logs)
- Ensure both services are in the same region for better performance

## Updating Your App

### Automatic Deploys (Recommended)
1. Push changes to your GitHub repository
2. Render automatically detects and deploys changes
3. Monitor deployment in Render dashboard

### Manual Deploys
1. Go to service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## Cost Summary

**Free Tier** (Perfect for development/testing):
- Database (Supabase): **Free forever** (500MB, 50,000 monthly active users, no time limit!)
- 2 Web Services (Render): Free (750 hours/month each, spins down after 15 min inactivity)
- **Total: $0/month**

**Paid Tier** (Production-ready):
- Database (Supabase Pro): $25/month (8GB, 100,000 monthly active users, daily backups)
- 2 Web Services (Render): $7/month each (always-on, no spin-down)
- **Total: $39/month**

**Note**: You can mix and match! Keep Supabase free while upgrading Render services ($14/month) or vice versa.

## Next Steps

1. ✅ Deploy using steps above
2. ✅ Test your application thoroughly
3. ✅ Set up custom domain (optional, available on paid plans)
4. ✅ Configure SSL certificates (automatic on Render)
5. ✅ Set up monitoring and alerts
6. ✅ Consider upgrading to paid plans for production use

## Database Management with Supabase

### Viewing Your Data
1. Go to Supabase Dashboard → Table Editor
2. See all tables created by your FastAPI app
3. Click any table to view, edit, or add data

### Running SQL Queries
1. Go to Supabase Dashboard → SQL Editor
2. Write and execute custom SQL queries
3. Save frequently used queries for later

### Monitoring Database Usage
1. Go to Supabase Dashboard → Reports
2. View database size, active connections, and query performance
3. Set up alerts for usage limits

### Database Backups
- **Free tier**: No automatic backups
- **Pro tier ($25/month)**: Daily automatic backups with point-in-time recovery

## Support

- **Render**: 
  - Docs: https://render.com/docs
  - Community: https://community.render.com
- **Supabase**: 
  - Docs: https://supabase.com/docs
  - Community: https://github.com/supabase/supabase/discussions
- Your team for environment-specific values

---

**Good luck with your deployment! 🚀**
