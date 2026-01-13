import { readdir, open } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';

//server
const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    serveDirectory(req, res);
  } else {
    try {
      const fileHandle = await open(`./storage${decodeURIComponent(req.url)}`);
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
    dynamicHTML += `${file} <a href="${baseUrl}${file}"> Download </a> <a href="${baseUrl}${file}">  Preview</a></br>`;
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
