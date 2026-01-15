import { readdir, open } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';
import mime from 'mime-types';

//server
const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    serveDirectory(req, res);
  } else {
    try {
      let [url, queryString] = req.url.split('?');
      console.log(url);
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
            `attachment; filename="${url.slice(1)}"`
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
  console.log(url);
  const filesAndFolderItems = await readdir(`./storage${url}`);
  //dynamic HTML
  let dynamicHTML = '';
  filesAndFolderItems.forEach((file) => {
    dynamicHTML += `${file} <a href=".${
      url === '/' ? '' : url
    }/${file}?action=preview">Preview</a>  &nbsp; <a href=".${
      url === '/' ? '' : url
    }/${file}?action=download">Download</a></br>`;
  });

  //Read HTML file
  let htmlFile = await fs.readFile('./Homepage.html', 'utf-8');

  // server response
  htmlFile = htmlFile.replace('${dynamicHTML}', dynamicHTML);
  res.end(htmlFile);
}

server.listen(4000, '0.0.0.0', () => {
  console.log('Server is up & running on port 3000');
});
