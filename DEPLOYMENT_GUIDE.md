# 🚀 Odd Genius Deployment Guide

This guide will help you deploy the Odd Genius football analytics application to the internet.

## 📋 Prerequisites

- ✅ Frontend build completed successfully
- ✅ Backend configured with proper CORS settings
- ✅ Environment variables configured
- ✅ Deployment configuration files created

## 🌐 Deployment Options

### Option 1: Render (Backend) + Netlify (Frontend) - RECOMMENDED

#### Backend Deployment (Render)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository or upload the backend folder
4. Configure the service:
   - **Name**: `odd-genius-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (for testing)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   ALL_SPORTS_API_KEY=9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4
   FRONTEND_URL=https://odd-genius.netlify.app
   LOG_LEVEL=info
   CACHE_TTL=30000
   ```

6. Deploy and note the URL (e.g., `https://odd-genius-api.onrender.com`)

#### Frontend Deployment (Netlify)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag and drop the `frontend/build` folder to Netlify
3. Or connect your GitHub repository:
   - Click "New site from Git"
   - Connect GitHub and select your repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `build`
     - **Base directory**: `frontend`

4. Add Environment Variables in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://odd-genius-api.onrender.com/api
   REACT_APP_ENVIRONMENT=production
   NODE_OPTIONS=--max-old-space-size=8192
   GENERATE_SOURCEMAP=false
   ```

5. Deploy and note the URL (e.g., `https://odd-genius.netlify.app`)

### Option 2: Railway (Backend) + Vercel (Frontend)

#### Backend Deployment (Railway)
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and the backend folder
4. Railway will auto-detect Node.js and deploy
5. Add environment variables in the Railway dashboard
6. Note the generated URL

#### Frontend Deployment (Vercel)
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project" → Import from GitHub
3. Select your repository and the frontend folder
4. Vercel will auto-detect React and deploy
5. Add environment variables in the Vercel dashboard
6. Note the generated URL

## 🔧 Manual Deployment Steps

Since CLI authentication requires browser interaction, here are the manual steps:

### 1. Build the Frontend
```powershell
cd frontend
npm run build
```

### 2. Prepare Backend
```powershell
cd backend
npm install
```

### 3. Deploy via Web Interfaces
Follow the web-based deployment steps above.

## 🧪 Testing the Deployment

Once deployed, test these URLs:

### Backend API Endpoints
- Health check: `https://your-backend-url.com/health`
- API root: `https://your-backend-url.com/api`
- Live matches: `https://your-backend-url.com/api/matches/live`
- H2H data: `https://your-backend-url.com/api/h2h/93/4973`

### Frontend Application
- Main app: `https://your-frontend-url.com`
- Special match page: `https://your-frontend-url.com/match/123456`
- Test all tabs: H2H, Corner Stats, Card Stats

## 🔍 Verification Checklist

- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] API calls work from frontend to backend
- [ ] CORS is properly configured
- [ ] AllSportsAPI integration works
- [ ] SpecialMatch.tsx page loads correctly
- [ ] All statistics tabs display real data
- [ ] No console errors in browser

## 🚨 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration includes your frontend URL
2. **API Errors**: Verify AllSportsAPI key is set correctly
3. **Build Errors**: Check Node.js version and memory settings
4. **404 Errors**: Ensure routing is configured for SPA

### Debug Steps:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Test API endpoints directly
4. Check deployment logs

## 📱 Expected URLs

After successful deployment, you should have:
- **Frontend**: `https://odd-genius.netlify.app` or `https://odd-genius.vercel.app`
- **Backend**: `https://odd-genius-api.onrender.com` or `https://odd-genius-api.railway.app`

## 🎉 Success!

Your Odd Genius application is now live and accessible worldwide!
