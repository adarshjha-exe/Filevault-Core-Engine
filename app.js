import { readdir, open } from 'node:fs/promises';
import http from 'node:http';

//server
const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    // get all files/folder from the directory
    const filesAndFolderItems = await readdir('./storage', { recursive: true });

    //dynamic HTML
    let dynamicHTML = '';
    filesAndFolderItems.forEach((file) => {
      dynamicHTML += `<li>${file} </li>`;
    });

    // server response
    res.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Your Files :</h1>
    <ul> ${dynamicHTML} </ul>
  </body>
</html>`);
  } else {
    try {
      const fileHandle = await open(`./storage${req.url}`);
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
