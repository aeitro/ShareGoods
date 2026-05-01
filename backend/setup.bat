@echo off
echo Installing backend dependencies...
npm install

echo.
echo Dependencies installed successfully!
echo.
echo To start the backend server, run one of the following commands:
echo npm start     - For production mode
echo npm run dev   - For development mode with auto-restart
echo.
echo Make sure MongoDB is running before starting the server.
echo.
pause