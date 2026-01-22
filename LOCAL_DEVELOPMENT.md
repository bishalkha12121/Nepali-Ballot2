# Local Development Guide - Nepali Ballot

## Prerequisites
- Node.js 18+ 
- Yarn (recommended) or npm
- Python 3.9+ (for backend)
- MongoDB (optional - for local database)

## Quick Start (Frontend Only - Using Cloud Backend)

If you just want to run the frontend locally while using the cloud backend:

```bash
cd frontend

# Install dependencies
yarn install

# Create local environment file
cp .env.local.example .env.local

# Edit .env.local and use the cloud backend:
# REACT_APP_BACKEND_URL=https://nepali-election-1.preview.emergentagent.com

# Start the development server
yarn start
```

The app will open at **http://localhost:3000**

## Full Local Development (Frontend + Backend)

### Step 1: Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file for backend
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=nepali_ballot" >> .env

# Start the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will run at **http://localhost:8001**

### Step 2: Start the Frontend

```bash
cd frontend

# Install dependencies
yarn install

# Create local environment file
cp .env.local.example .env.local

# Edit .env.local to point to local backend:
# REACT_APP_BACKEND_URL=http://localhost:8001

# Start the development server
yarn start
```

The frontend will open at **http://localhost:3000**

## Important Notes

1. **Port 3000**: This project uses Create React App with CRACO, NOT Vite. It runs on port 3000.

2. **If you see port 5173**: You might have Vite installed globally or are running from the wrong directory. Make sure to:
   - Run `yarn start` (not `npm run dev` or `vite`)
   - Be in the `/frontend` directory

3. **Path Aliases**: The project uses `@/` as an alias for `src/`. This is configured in `craco.config.js` and `jsconfig.json`.

4. **Backend Required**: The app needs a backend to function. Either:
   - Use the cloud backend URL in `.env.local`
   - Run the local backend as described above

## Troubleshooting

### Blank Page
- Check browser console for errors
- Ensure `.env.local` has the correct `REACT_APP_BACKEND_URL`
- Verify backend is running and accessible

### Wrong Port (5173 instead of 3000)
Port 5173 is Vite's default port. This project uses Create React App (CRACO) which runs on port 3000.

**Troubleshooting steps:**
1. Kill any existing processes: 
   - Windows: `taskkill /F /IM node.exe` or close all terminal windows
   - Mac/Linux: `pkill -f node` or `killall node`

2. Check if you have a global Vite installation:
   ```bash
   npm list -g vite
   # If vite is installed globally, uninstall it:
   npm uninstall -g vite
   ```

3. Make sure you're in the `frontend` folder:
   ```bash
   cd frontend
   pwd  # Should show .../frontend
   ```

4. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   yarn install
   ```

5. Run the correct command:
   ```bash
   yarn start
   # OR
   yarn dev
   ```

6. Check what's running on ports:
   - Windows: `netstat -ano | findstr :5173`
   - Mac/Linux: `lsof -i :5173`

### Module Not Found Errors
- Run `yarn install` to install all dependencies
- Check that `craco.config.js` exists

### CORS Errors
- Backend must allow requests from your frontend origin
- The cloud backend is already configured for this
