// test_api_key.js
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

async function testApiKey() {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;
  console.log('🔑 Testing OpenSanctions API Key...');
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT FOUND'}`);
  
  if (!apiKey) {
    console.error('❌ No API key found in environment variables');
    return;
  }
  
  try {
    // Test with a simple search query
    const response = await axios.get('https://api.opensanctions.org/search/sanctions', {
      params: { 
        q: 'Putin',
        limit: 5
      },
      headers: { 
        'Authorization': `ApiKey ${apiKey}`
      }
    });
    
    console.log('✅ API Key is valid!');
    console.log(`Status: ${response.status}`);
    console.log(`Results found: ${response.data.results?.length || 0}`);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('Sample result:');
      const sample = response.data.results[0];
      console.log(`  Name: ${sample.properties?.name?.[0] || 'N/A'}`);
      console.log(`  Schema: ${sample.schema}`);
      console.log(`  Topics: ${sample.properties?.topics?.join(', ') || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ API Key test failed:');
    console.error(`Status: ${error.response?.status || 'N/A'}`);
    console.error(`Message: ${error.response?.data?.detail || error.message}`);
    
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - API key may be invalid or expired');
    } else if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - API key may not have required permissions');
    } else if (error.response?.status === 429) {
      console.error('⏰ Rate limit exceeded - too many requests');
    }
  }
}

testApiKey().catch(console.error);
