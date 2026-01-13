import { readdir, open } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';

//server
const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    serveDirectory(req, res);
  } else {
    let [url, queryString] = req.url.split('?');
    let queryParam = {};
    if (queryString) {
      queryString.split('&')?.forEach((pair) => {
        const [key, value] = pair.split('=');
        queryParam[key] = value;
      });
    }
    console.log(queryParam);
    try {
      const fileHandle = await open(`./storage${decodeURIComponent(url)}`);
      // check if url is directory or file
      const stats = await fileHandle.stat();
      if (stats.isDirectory()) {
        serveDirectory(req, res);
      } else {
        const readStream = fileHandle.createReadStream();
        readStream.pipe(res);
      }
    } catch (error) {
      console.log(error.message);
      res.end('File Not found');
    }
  }
});

async function serveDirectory(req, res) {
  const filesAndFolderItems = await readdir(
    `./storage${decodeURIComponent(req.url)}`,
    {
      recursive: true,
    }
  );
  //dynamic HTML
  let dynamicHTML = '';
  filesAndFolderItems.forEach((file) => {
    const baseUrl = req.url.endsWith('/') ? req.url : req.url + '/';
    dynamicHTML += `${file} <a href="${baseUrl}${file}?action=download"> Download </a> <a href="${baseUrl}${file}?action=preview">  Preview</a></br>`;
  });

  //Read HTML file
  let htmlFile = await fs.readFile('./Homepage.html', 'utf-8');

  // server response
  htmlFile = htmlFile.replace('${dynamicHTML}', dynamicHTML);
  res.end(htmlFile);
}

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is up & running on port 3000');
});
