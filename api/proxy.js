const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = createProxyMiddleware({
  target: 'http://163.61.227.29:8000',
  changeOrigin: true,
  secure: false,
  pathRewrite: (path, req) => {
    const newPath = path.replace('/api/proxy',''); // remove prefix
    console.log('[Proxy] Requested:', newPath);
    return newPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Referer','http://163.61.227.29:8000/');
    proxyReq.setHeader('Origin','http://163.61.227.29:8000');
    proxyReq.setHeader('User-Agent','Mozilla/5.0');
    console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin']='*';
    proxyRes.headers['Access-Control-Allow-Methods']='GET, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers']='*';
  }
});

module.exports = (req, res) => {
  if(req.method === 'OPTIONS'){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','*');
    return res.status(200).end();
  }
  return proxy(req,res);
};
