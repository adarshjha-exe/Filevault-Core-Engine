import { readdir, open } from 'node:fs/promises';
import http from 'node:http';
import fs from 'node:fs/promises';

//server
const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    // get all files/folder from the directory
    const filesAndFolderItems = await readdir('./storage', { recursive: true });

    //dynamic HTML
    let dynamicHTML = '';
    filesAndFolderItems.forEach((file) => {
      dynamicHTML += `<a href="./${file}">${file} </a> </br>`;
    });

    //Read HTML file
    let htmlFile = await fs.readFile('./Homepage.html', 'utf-8');

    // server response
    htmlFile = htmlFile.replace('${dynamicHTML}', dynamicHTML);
    res.end(htmlFile);
  } else {
    try {
      const fileHandle = await open(`./storage${decodeURIComponent(req.url)}`);
      const readStream = fileHandle.createReadStream();
      readStream.pipe(res);
    } catch (error) {
      console.log(error.message);
      res.end('File Not found');
    }
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is up & running on port 3000');
});
