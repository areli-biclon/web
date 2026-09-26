// Aurora 示例:零依赖 Node.js 静态服务器
// 仅使用 node 内置模块,无需 npm install 即可部署。
// 用法: node server.js  或  PORT=8080 node server.js

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME 白名单:不在表内的扩展名一律按 application/octet-stream 处理
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(body);
}

function notFound(res) {
  // 优先使用 public/404.html(与 Cloudflare Pages 的 404 约定一致)
  fs.readFile(path.join(PUBLIC_DIR, '404.html'), (err, data) => {
    if (err) {
      return send(res, 404,
        `<!DOCTYPE html><meta charset="utf-8"><title>404</title>
         <body style="background:#0B0E14;color:#9AA3B5;font-family:sans-serif;
         display:grid;place-items:center;height:100vh;margin:0">
         <div style="text-align:center"><div style="font-size:72px;color:#FF7A45;font-weight:900">404</div>
         <p>资源不存在 · <a href="/" style="color:#FFC53D">返回首页</a></p></div>`,
        'text/html; charset=utf-8');
    }
    send(res, 404, data, 'text/html; charset=utf-8');
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
  }

  // 解码并规范化 URL,拒绝路径穿越
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    return notFound(res);
  }
  if (urlPath.includes('\0')) return notFound(res);

  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    return notFound(res);
  }

  fs.stat(filePath, (err, st) => {
    // 目录请求 → 找 index.html;文件不存在 → 404
    const target = !err && st.isDirectory() ? path.join(filePath, 'index.html') : filePath;

    fs.readFile(target, (err2, data) => {
      if (err2) return notFound(res);
      const ext = path.extname(target).toLowerCase();
      const isHtml = ext === '.html';
      // HTML 不缓存,静态资源可由反向代理层再加长缓存
      res.setHeader('Cache-Control', isHtml ? 'no-cache' : 'public, max-age=86400');
      send(res, 200, data, MIME[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, HOST, () => {
  const banner = `
  ┌─────────────────────────────────────────────┐
  │  ✓ Aurora Edge 已启动                        │
  │  本机访问   http://localhost:${PORT}          │
  │  局域网访问  http://<手机IP>:${PORT}          │
  │  停止服务   Ctrl + C                         │
  └─────────────────────────────────────────────┘`;
  console.log(banner);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器…');
  server.close(() => process.exit(0));
});
