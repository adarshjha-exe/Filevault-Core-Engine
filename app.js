import { readdir } from 'node:fs/promises';
import http from 'node:http';

//server
const server = http.createServer(async (req, res) => {
  // get all files/folder from the directory
  const filesAndFolderItems = await readdir('./storage', { recursive: true });
  res.end(`Directory items : ${filesAndFolderItems}`);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is up & running on port 4000');
});
