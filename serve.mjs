import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'

const DIST = new URL('./dist', import.meta.url).pathname
const PORT = 18082

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
}

createServer((req, res) => {
  let url = req.url.split('?')[0]
  let file = join(DIST, url === '/' ? 'index.html' : url)

  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(DIST, 'index.html')
  }

  try {
    const data = readFileSync(file)
    const ext = extname(file)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not Found')
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`api2json serving dist on http://127.0.0.1:${PORT}`)
})
