import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);

  async function getDirectoryItems() {
    let response = await fetch('http://localhost:4000');
    let data = await response.json();
    console.log(data);
    setDirectoryItems(data);
  }

  useEffect(() => {
    getDirectoryItems();
  }, []);

  return (
    <>
      <h1>My files</h1>
      {directoryItems.map((item, index) => (
        <div key={index}>
          {item}
          <a href={`http://localhost:4000/${item}?action=open`}>Open</a>

          <a href={`http://localhost:4000/${item}?action=download`}>Download</a>
          <br></br>
        </div>
      ))}
    </>
  );
}

export default App;
