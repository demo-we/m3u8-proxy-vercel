const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  // /play/ এর পরের অংশটাই আসল URL
  const rawUrl = req.url.replace(/^\/play\//, '');
  const targetUrl = decodeURIComponent(rawUrl);

  if (!targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid target URL');
  }

  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: () => '',
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
      proxyReq.setHeader('Referer', targetUrl);
      proxyReq.setHeader('Origin', targetUrl);
    },
    onProxyRes: (proxyRes) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  });

  return proxy(req, res);
};
