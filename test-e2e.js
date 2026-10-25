async function runTests() {
  console.log('--- 1. Testing GET /health ---');
  const hRes = await fetch('http://localhost:5000/health');
  const hJson = await hRes.json();
  console.log('Health:', hJson);

  console.log('\n--- 2. Testing POST /api/ai/generate-plan ---');
  const planPayload = {
    name: 'Ananya & Sourav Bengali Wedding',
    type: 'wedding',
    date: '2026-11-28',
    city: 'Kolkata',
    guests: 200,
    totalBudget: 500000,
    currency: 'INR',
    durationHours: 8,
    language: 'English & Bengali',
    indoorOutdoor: 'Hybrid',
    theme: 'Heritage Kolkata Rajbari',
    culturalTradition: 'Traditional Bengali Hindu Wedding',
    foodPreference: 'Authentic Bengali Bhoj',
    userPrompt: 'Traditional Bengali wedding in Kolkata for 200 guests with ₹5 lakh budget'
  };

  const pRes = await fetch('http://localhost:5000/api/ai/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planPayload)
  });
  const pJson = await pRes.json();
  console.log('Generated Plan Status:', pJson.success ? 'SUCCESS' : 'FAILED');
  console.log('Plan Name:', pJson.data?.name);
  console.log('Categories Allocated Count:', pJson.data?.budgetCategories?.length);
  console.log('Milestones Generated Count:', pJson.data?.tasks?.length);
  console.log('Vendors Generated Count:', pJson.data?.vendors?.length);

  console.log('\n--- 3. Testing POST /api/ai/budget-rescue ---');
  const rescuePayload = {
    totalBudget: 500000,
    currentExpenses: 535000,
    categories: pJson.data?.budgetCategories || [],
    eventType: 'wedding',
    guests: 200,
    city: 'Kolkata'
  };

  const bRes = await fetch('http://localhost:5000/api/ai/budget-rescue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rescuePayload)
  });
  const bJson = await bRes.json();
  console.log('Budget Rescue Status:', bJson.success ? 'SUCCESS' : 'FAILED');
  console.log('Overspend Detected:', bJson.data?.overspendAmount);
  console.log('Recommendations Count:', bJson.data?.recommendations?.length);

  console.log('\n--- 4. Testing POST /api/ai/chat ---');
  const chatPayload = {
    message: 'Suggest an affordable Bengali wedding menu for 200 guests.',
    history: [],
    eventContext: pJson.data || {}
  };

  const cRes = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatPayload)
  });
  const cJson = await cRes.json();
  console.log('Chat Status:', cJson.success ? 'SUCCESS' : 'FAILED');
  console.log('Assistant Response Preview:', cJson.data?.response?.substring(0, 150) + '...');
}

runTests().catch(console.error);
