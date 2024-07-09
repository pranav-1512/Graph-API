
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Insights = ({ accessToken, pageId }) => {
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fancount, setFancount] = useState("");

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days ago
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    console.log("New start date:", event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    console.log("New end date:", event.target.value);
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };  

  const fetchCurrentFanCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v16.0/${pageId}`,
        {
          params: {
            fields: 'fan_count',
            access_token: accessToken
          }
        }
      );
      console.log('Current fan count:', response.data.fan_count);
      return response.data.fan_count;
    } catch (error) {
      console.error('Error fetching current fan count:', error);
      return 'N/A';
    }
  }, [accessToken, pageId]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        // Fetch page access token first
        const pageTokenResponse = await axios.get(
          `https://graph.facebook.com/v16.0/${pageId}?fields=access_token&access_token=${accessToken}`
        );
        const pageAccessToken = pageTokenResponse.data.access_token;

        // Fetch each metric separately
        const metrics = ['page_fans', 'page_post_engagements', 'page_impressions', 'page_actions_post_reactions_total'];
        const insightsData = await Promise.all(metrics.map(async (metric) => {
          try {
            const response = await axios.get(
              `https://graph.facebook.com/v16.0/${pageId}/insights`,
              {
                params: {
                  metric: metric,
                  access_token: pageAccessToken,
                  period: 'total_over_range',
                  since: formatDate(startDate) || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
                  until: formatDate(endDate) || formatDate(new Date())
                }
              }
            );
            console.log(`Raw data for ${metric}:`, response.data);
            return response.data.data[0];
          } catch (error) {
            console.warn(`Failed to fetch ${metric}:`, error.response ? error.response.data : error);
            return { name: metric, values: [{ value: 'N/A' }] };
          }
        }));

        setInsights(insightsData.filter(insight => insight !== null));
        console.log("Updated insights:", insightsData.filter(insight => insight !== null));
        setError(null);
      } catch (error) {
        console.error('Error fetching insights:', error.response ? JSON.stringify(error.response.data, null, 2) : error);
        setError(`Failed to fetch insights: ${error.response ? error.response.data.error.message : error.message}`);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    
    console.log("Effect triggered. PageId:", pageId, "AccessToken:", !!accessToken, "StartDate:", startDate, "EndDate:", endDate);
    if (pageId && accessToken) {
      fetchInsights();
      fetchCurrentFanCount().then(count => setFancount(count));
    }
  }, [accessToken, pageId, startDate, endDate, fetchCurrentFanCount]);

  if (loading) {
    return <div>Loading insights...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const getInsightValue = (metricName) => {
    const metric = insights.find(insight => insight && insight.name === metricName);
    if (!metric) {
      console.log(`Metric ${metricName} not found`);
      return 'N/A';
    }
    if (!metric.values || metric.values.length === 0) {
      console.log(`No values for metric ${metricName}`);
      return 'N/A';
    }
    
    if (metricName === 'page_fans') {
      // For page_fans, we want the most recent value
      const lastValue = metric.values[metric.values.length - 1].value;
      return typeof lastValue === 'object' ? JSON.stringify(lastValue) : String(lastValue);
    }
    
    if (metricName === 'page_actions_post_reactions_total') {
      // For reactions, we need to sum up all types of reactions
      const lastValue = metric.values[metric.values.length - 1].value;
      if (typeof lastValue === 'object') {
        return Object.values(lastValue).reduce((sum, val) => sum + val, 0).toString();
      }
      return String(lastValue);
    }
    
    // For other metrics, sum up all values
    const totalValue = metric.values.reduce((sum, item) => {
      const itemValue = typeof item.value === 'object' ? Object.values(item.value).reduce((s, v) => s + v, 0) : item.value;
      return sum + (itemValue || 0);
    }, 0);
    return String(totalValue);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <label style={{ marginRight: '20px' }}>
          Since:
          <input type="date" value={startDate} onChange={handleStartDateChange} style={{ marginLeft: '10px' }} />
        </label>
        <label>
          Until:
          <input type="date" value={endDate} onChange={handleEndDateChange} style={{ marginLeft: '10px' }} />
        </label>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '20px'
      }}>
        <Card title="Total Followers / Fans" value={fancount} />
        <Card title="Total Engagement" value={getInsightValue('page_post_engagements') || 'N/A'} />
        <Card title="Total Impressions" value={getInsightValue('page_impressions') || 'N/A'} />
        <Card title="Total Reactions" value={getInsightValue('page_actions_post_reactions_total') || 'N/A'} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div style={{ 
    border: '1px solid #ccc', 
    borderRadius: '5px', 
    padding: '20px', 
    flex: '1 1 200px',
    maxWidth: 'calc(25% - 15px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9'
  }}>
    <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{title}</h3>
    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{typeof value === 'object' ? JSON.stringify(value) : value}</p>
  </div>
);

export default Insights;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Insights = ({ accessToken, pageId }) => {
//   const [insights, setInsights] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [fancount, setFancount] = useState("");

//   const [startDate, setStartDate] = useState(() => {
//     const date = new Date();
//     date.setDate(date.getDate() - 30); // 30 days ago
//     return date.toISOString().split('T')[0];
//   });

//   const [endDate, setEndDate] = useState(() => {
//     const date = new Date();
//     return date.toISOString().split('T')[0];
//   });

//   const handleStartDateChange = (event) => {
//     setStartDate(event.target.value);
//     console.log("New start date:", event.target.value);
//   };

//   const handleEndDateChange = (event) => {
//     setEndDate(event.target.value);
//     console.log("New end date:", event.target.value);
//   };

//   const formatDate = (date) => {
//     if (!date) return null;
//     const d = new Date(date);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
//   };  

//   const fetchCurrentFanCount = async () => {
//     try {
//       const response = await axios.get(
//         `https://graph.facebook.com/v16.0/${pageId}`,
//         {
//           params: {
//             fields: 'fan_count',
//             access_token: accessToken
//           }
//         }
//       );
//       console.log('Current fan count:', response.data.fan_count);
//       return response.data.fan_count;
//     } catch (error) {
//       console.error('Error fetching current fan count:', error);
//       return 'N/A';
//     }
//   };

  
//   useEffect(() => {
//     const fetchInsights = async () => {
//       setLoading(true);
//       try {
//         // Fetch page access token first
//         const pageTokenResponse = await axios.get(
//           `https://graph.facebook.com/v16.0/${pageId}?fields=access_token&access_token=${accessToken}`
//         );
//         const pageAccessToken = pageTokenResponse.data.access_token;

//         // Fetch each metric separately
//         // const metrics = ['page_fans', 'page_post_engagements', 'page_impressions', 'page_reactions_total'];
//         const metrics = ['page_fans', 'page_post_engagements', 'page_impressions', 'page_actions_post_reactions_total'];
//         const insightsData = await Promise.all(metrics.map(async (metric) => {
//           try {
//             const response = await axios.get(
//               `https://graph.facebook.com/v16.0/${pageId}/insights`,
//               {
//                 params: {
//                   metric: metric,
//                   access_token: pageAccessToken,
//                   period: 'total_over_range',
//                   since: formatDate(startDate) || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
//                   until: formatDate(endDate) || formatDate(new Date())
//                 }
//               }
//             );
//             console.log(`Raw data for ${metric}:`, response.data);
//             return response.data.data[0];
//           } catch (error) {
//             console.warn(`Failed to fetch ${metric}:`, error.response ? error.response.data : error);
//             return { name: metric, values: [{ value: 'N/A' }] };
//           }
//         }));

//         setInsights(insightsData.filter(insight => insight !== null));
//         console.log("Updated insights:", insightsData.filter(insight => insight !== null));
//         setError(null);
//       } catch (error) {
//         console.error('Error fetching insights:', error.response ? JSON.stringify(error.response.data, null, 2) : error);
//         setError(`Failed to fetch insights: ${error.response ? error.response.data.error.message : error.message}`);
//         setInsights([]);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     console.log("Effect triggered. PageId:", pageId, "AccessToken:", !!accessToken, "StartDate:", startDate, "EndDate:", endDate);
//     if (pageId && accessToken) {
//       fetchInsights();
//       fetchCurrentFanCount().then(count => setFancount(count));
//     }
//   // eslint-disable-next-line
//   }, [accessToken, pageId, startDate, endDate]);

//   if (loading) {
//     return <div>Loading insights...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   const getInsightValue = (metricName) => {
//     const metric = insights.find(insight => insight && insight.name === metricName);
//     if (!metric) {
//       console.log(`Metric ${metricName} not found`);
//       return 'N/A';
//     }
//     if (!metric.values || metric.values.length === 0) {
//       console.log(`No values for metric ${metricName}`);
//       return 'N/A';
//     }
    
//     if (metricName === 'page_fans') {
//       // For page_fans, we want the most recent value
//       const lastValue = metric.values[metric.values.length - 1].value;
//       return typeof lastValue === 'object' ? JSON.stringify(lastValue) : String(lastValue);
//     }
    
//     if (metricName === 'page_actions_post_reactions_total') {
//       // For reactions, we need to sum up all types of reactions
//       const lastValue = metric.values[metric.values.length - 1].value;
//       if (typeof lastValue === 'object') {
//         return Object.values(lastValue).reduce((sum, val) => sum + val, 0).toString();
//       }
//       return String(lastValue);
//     }
    
//     // For other metrics, sum up all values
//     const totalValue = metric.values.reduce((sum, item) => {
//       const itemValue = typeof item.value === 'object' ? Object.values(item.value).reduce((s, v) => s + v, 0) : item.value;
//       return sum + (itemValue || 0);
//     }, 0);
//     return String(totalValue);
//   };

// return (
//   <div style={{ padding: '20px' }}>
//     <div style={{ marginBottom: '30px' }}>
//       <label style={{ marginRight: '20px' }}>
//         Since:
//         <input type="date" value={startDate} onChange={handleStartDateChange} style={{ marginLeft: '10px' }} />
//       </label>
//       <label>
//         Until:
//         <input type="date" value={endDate} onChange={handleEndDateChange} style={{ marginLeft: '10px' }} />
//       </label>
//     </div>
//     <div style={{ 
//       display: 'flex', 
//       justifyContent: 'space-between', 
//       flexWrap: 'wrap', 
//       gap: '20px'
//     }}>
//       <Card title="Total Followers / Fans" value={fancount} />
//       <Card title="Total Engagement" value={getInsightValue('page_post_engagements') || 'N/A'} />
//       <Card title="Total Impressions" value={getInsightValue('page_impressions') || 'N/A'} />
//       <Card title="Total Reactions" value={getInsightValue('page_actions_post_reactions_total') || 'N/A'} />
//     </div>
//   </div>
// );
// };

// const Card = ({ title, value }) => (
// <div style={{ 
//   border: '1px solid #ccc', 
//   borderRadius: '5px', 
//   padding: '20px', 
//   flex: '1 1 200px',
//   maxWidth: 'calc(25% - 15px)',
//   boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//   backgroundColor: '#f9f9f9'
// }}>
//   <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{title}</h3>
//   <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{typeof value === 'object' ? JSON.stringify(value) : value}</p>
// </div>
// );

// export default Insights;
