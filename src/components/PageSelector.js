// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const PageSelector = ({ accessToken, onPageSelect }) => {
//   const [pages, setPages] = useState([]);

//   useEffect(() => {
//     const fetchPages = async () => {
//       try {
//         const response = await axios.get(
//           `https://graph.facebook.com/v13.0/me/accounts?access_token=${accessToken}`
//         );
//         setPages(response.data.data);
//       } catch (error) {
//         console.error('Error fetching pages:', error);
//       }
//     };
//     fetchPages();
//   }, [accessToken]);

//   return (
//     <div>
//       <label>Select a page:</label>
//       <select onChange={(e) => onPageSelect(e.target.value)}>
//         {pages.map((page) => (
//           <option key={page.id} value={page.id}>
//             {page.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default PageSelector;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const PageSelector = ({ accessToken, onPageSelect }) => {
//   const [pages, setPages] = useState([]);
//   const [selectedPage, setSelectedPage] = useState('');

//   useEffect(() => {
//     const fetchPages = async () => {
//       try {
//         const response = await axios.get(
//           `https://graph.facebook.com/v13.0/me/accounts?access_token=${accessToken}`
//         );
//         setPages(response.data.data);
//       } catch (error) {
//         console.error('Error fetching pages:', error);
//       }
//     };
//     fetchPages();
//   }, [accessToken]);

//   const handlePageChange = (e) => {
//     const pageId = e.target.value;
//     setSelectedPage(pageId);
//     onPageSelect(pageId);
//   };

//   return (
//     <div style={{ marginBottom: '20px' }}>
//       <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
//         Select a page:
//       </label>
//       <select 
//         value={selectedPage} 
//         onChange={handlePageChange}
//         style={{
//           width: '100%',
//           padding: '10px',
//           fontSize: '16px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           backgroundColor: '#fff'
//         }}
//       >
//         <option value="" disabled>Choose a page</option>
//         {pages.map((page) => (
//           <option key={page.id} value={page.id}>
//             {page.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default PageSelector;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PageSelector = ({ accessToken, onPageSelect }) => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v13.0/me/accounts?access_token=${accessToken}`
        );
        setPages(response.data.data);
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };
    fetchPages();
  }, [accessToken]);

  const handlePageChange = (e) => {
    setSelectedPage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPage) {
      onPageSelect(selectedPage);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        Select a page:
      </label>
      <select 
        value={selectedPage} 
        onChange={handlePageChange}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff',
          marginBottom: '10px'
        }}
      >
        <option value="" disabled>Choose a page</option>
        {pages.map((page) => (
          <option key={page.id} value={page.id}>
            {page.name}
          </option>
        ))}
      </select>
      <button 
        type="submit"
        disabled={!selectedPage}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4267B2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: selectedPage ? 1 : 0.6
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default PageSelector;