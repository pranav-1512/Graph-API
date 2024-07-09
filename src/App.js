import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import PageSelector from './components/PageSelector';
import Insights from './components/Insights';

const App = () => {
  const [accessToken, setAccessToken] = useState('');
  const [user, setUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);

  const handleLogin = (token) => {
    setAccessToken(token);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(
          `https://graph.facebook.com/v13.0/me?fields=name,email,picture&access_token=${accessToken}`
        );
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [accessToken]);

  const handlePageSelect = (pageId) => {
    setSelectedPage(pageId);
  };

  //   return (
  //     <div className="App">
  //       {!accessToken ? (
  //         <Login onLogin={handleLogin} />
  //       ) : (
  //         <>
  //           <Profile user={user} />
  //           <PageSelector accessToken={accessToken} onPageSelect={handlePageSelect} />
  //           {selectedPage && (
  //             <Insights accessToken={accessToken} pageId={selectedPage} />
  //           )}
  //         </>
  //       )}
  //     </div>
  //   );
  // };
  return (
    <div className="App" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {!accessToken ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div style={{ marginBottom: '40px' }}>
            <Profile user={user} />
          </div>
          <div style={{ marginBottom: '40px' }}>
            <PageSelector accessToken={accessToken} onPageSelect={handlePageSelect} />
          </div>
          {selectedPage && (
            <Insights
              accessToken={accessToken}
              pageId={selectedPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;

// import React, { useState, useEffect } from 'react';
// import Login from './components/Login';
// import Profile from './components/Profile';
// import PageSelector from './components/PageSelector';
// import Insights from './components/Insights';

// const App = () => {
//   const [accessToken, setAccessToken] = useState('');
//   const [user, setUser] = useState(null);
//   const [selectedPage, setSelectedPage] = useState(null);
//   const [startDate, setStartDate] = useState('');
//   // Remove end date state
//   const endDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

//   const handleLogin = (token) => {
//     setAccessToken(token);
//   };

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (!accessToken) return;

//       try {
//         const response = await fetch(
//           `https://graph.facebook.com/v13.0/me?fields=name,email,picture&access_token=${accessToken}`
//         );
//         const data = await response.json();
//         setUser(data);
//       } catch (error) {
//         console.error('Error fetching user profile:', error);
//       }
//     };

//     fetchUserProfile();
//   }, [accessToken]);

//   const handlePageSelect = (pageId) => {
//     setSelectedPage(pageId);
//   };

//   const handleDateChange = (event) => {
//     const value = event.target.value;
//     setStartDate(new Date(value).toISOString().split('T')[0]);
//   };

//   return (
//     <div className="App">
//       {!accessToken ? (
//         <Login onLogin={handleLogin} />
//       ) : (
//         <>
//           <Profile user={user} />
//           <PageSelector accessToken={accessToken} onPageSelect={handlePageSelect} />
//           <div>
//             <label>Start Date: </label>
//             <input type="date" value={startDate} onChange={handleDateChange} />
//           </div>
//           {/* Remove end date input */}
//           {selectedPage && startDate && (
//             <Insights
//               accessToken={accessToken}
//               pageId={selectedPage}
//               startDate={startDate}
//               endDate={endDate}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default App;