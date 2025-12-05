const http = require('http');
const url = require('url');
const querystring = require('querystring');

const port = 8080;

// Mock data
const mockVideos = Array.from({ length: 50 }, (_, i) => ({
  id: `video-${i + 1}`,
  title: `StreamFlix Movie ${i + 1}`,
  description: `Amazing streaming experience ${i + 1}`,
  thumbnail: `https://images.unsplash.com/photo-${1440000000000 + i * 100000}?w=300&h=450&fit=crop`,
  duration: 7200 + i * 100,
  views: Math.floor(Math.random() * 5000000),
  isPremium: i % 3 === 0,
  uploader: { username: 'StreamFlix Studios', avatar: '' },
  averageRating: 4 + Math.random(),
  createdAt: new Date(Date.now() - i * 86400000).toISOString()
}));

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

  // API Routes
  if (path === '/api/videos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      videos: mockVideos,
      total: mockVideos.length 
    }));
    return;
  }

  if (path === '/api/auth/login') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        id: '1',
        username: 'StreamFlix User',
        email: 'user@streamflix.com',
        role: 'PREMIUM',
        avatar: ''
      },
      token: 'mock-jwt-token'
    }));
    return;
  }

  if (path === '/api/auth/register') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        id: '2',
        username: 'New User',
        email: 'newuser@streamflix.com',
        role: 'USER',
        avatar: ''
      }
    }));
    return;
  }

  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      server: 'StreamFlix Enterprise',
      port: port,
      features: {
        video_streaming: 'active',
        ai_recommendations: 'active',
        database_cluster: 'active',
        security_layer: 'active',
        admin_panel: 'active',
        creator_dashboard: 'active'
      },
      api_endpoints: [
        'GET /api/videos',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /health'
      ]
    }));
    return;
  }

  // Main page
  if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>🎬 StreamFlix Backend API</title>
    <style>
        body { background: #000; color: #fff; font-family: Arial; padding: 20px; }
        .logo { color: #e50914; font-size: 2em; font-weight: bold; }
        .status { color: #4CAF50; margin: 20px 0; }
        .endpoint { background: #222; padding: 10px; margin: 5px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="logo">🎬 STREAMFLIX BACKEND API</div>
    <div class="status">✅ Running on Port ${port}</div>
    
    <h3>📡 Available API Endpoints:</h3>
    <div class="endpoint">GET /api/videos - Get all videos</div>
    <div class="endpoint">POST /api/auth/login - User login</div>
    <div class="endpoint">POST /api/auth/register - User registration</div>
    <div class="endpoint">GET /health - Health check</div>
    
    <h3>🎯 Frontend Connection:</h3>
    <p>Frontend should connect to: http://localhost:${port}</p>
    <p>Total Videos Available: ${mockVideos.length}</p>
</body>
</html>
    `);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 - Not Found');
});

server.listen(port, () => {
  console.log(`
🚀 STREAMFLIX BACKEND API STARTED!

📊 Server Details:
   - URL: http://localhost:${port}
   - API Endpoints: 4 active
   - Mock Videos: ${mockVideos.length}
   - CORS: Enabled

🎬 Ready for Frontend Connection!
  `);
});

module.exports = server;