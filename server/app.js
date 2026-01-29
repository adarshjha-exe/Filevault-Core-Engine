import { readdir, open } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';
import mime from 'mime-types';

//server
const server = http.createServer(async (req, res) => {
  // handle CORS err
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/') {
    serveDirectory(req, res);
  } else {
    try {
      let [url, queryString] = req.url.split('?');
      let queryParam = {};
      if (queryString) {
        queryString.split('&')?.forEach((pair) => {
          const [key, value] = pair.split('=');
          queryParam[key] = value;
        });
      }
      // Ignore Chrome DevTools specific paths
      if (url.startsWith('/.well-known')) {
        res.end('File Not found');
        return;
      }

      const fileHandle = await open(`./storage${decodeURIComponent(url)}`);
      // check if url is directory or file
      const stats = await fileHandle.stat();
      if (stats.isDirectory()) {
        serveDirectory(req, res);
      } else {
        const readStream = fileHandle.createReadStream();

        // setting up the headers
        const mimeType = mime.contentType(url.slice(1));
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', stats.size);

        if (queryParam.action === 'download') {
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${url.slice(1)}"`,
          );
        }
        readStream.pipe(res);
      }
    } catch (error) {
      console.log(error.message);
      res.end('File Not found');
    }
  }
});

async function serveDirectory(req, res) {
  let [url] = req.url.split('?');
  const filesAndFolderItems = await readdir(`./storage${url}`);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(filesAndFolderItems));
}

server.listen(4000, '0.0.0.0', () => {
  console.log('Server is up & running on port 4000');
});
