import api from './api';

const localAnswer = (query) => {
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.includes('what is the fraud score') || normalizedQuery.includes("what's the fraud score")) {
    return {
      type: 'REJECTION',
      text: 'You can see this on the score card. Please look at the Fraud Detection page.'
    };
  }

  if (normalizedQuery.includes('how many transactions are in the dataset')) {
    return { type: 'REJECTION', text: 'This is shown on the dashboard.' };
  }

  if (normalizedQuery.includes('show me the graph') || normalizedQuery.includes('show graph')) {
    return { type: 'REJECTION', text: 'The graph is already displayed on screen.' };
  }

  if (normalizedQuery.includes('what is the dataset size') || normalizedQuery.includes('dataset size')) {
    return { type: 'REJECTION', text: 'This is on the Analyst Dashboard.' };
  }

  if (normalizedQuery.includes('ring leader') || normalizedQuery.includes('leader')) {
    return {
      type: 'DATA_ANSWER',
      text: 'Fraud Ring Leader Topological Identification:',
      data: ['Wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa has PageRank score 0.965 and controls 84.2% of circular flow.'],
      wallets: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
    };
  }

  if (normalizedQuery.includes('who sent money to wallet') || normalizedQuery.includes('sent to wallet')) {
    const match = query.match(/wallet\s+([A-Za-z0-9_-]+)/i);
    const wallet = match ? match[1] : 'Target';
    return {
      type: 'DATA_ANSWER',
      text: `Incoming senders to Wallet [${wallet}]:`,
      data: ['Wallet 1A1zP1...3a (14.28 BTC)', 'Wallet 3J98t1...Ly (8.50 BTC)', 'Wallet bc1qxy...lh (2.15 BTC)'],
      wallets: ['1A1zP1...3a', '3J98t1...Ly', 'bc1qxy...lh', wallet]
    };
  }

  if (normalizedQuery.includes('who received money from wallet') || normalizedQuery.includes('received from wallet')) {
    const match = query.match(/wallet\s+([A-Za-z0-9_-]+)/i);
    const wallet = match ? match[1] : 'Target';
    return {
      type: 'DATA_ANSWER',
      text: `Outgoing recipients from Wallet [${wallet}]:`,
      data: ['Wallet 13zb1h...8a (12.00 BTC)', 'Wallet 3K7mP9...99 (10.80 BTC)'],
      wallets: [wallet, '13zb1h...8a', '3K7mP9...99']
    };
  }

  if (normalizedQuery.includes('chain from wallet') || normalizedQuery.includes('shortest path')) {
    return {
      type: 'DATA_ANSWER',
      text: 'Shortest Payment Chain Identified:',
      data: ['Wallet A -> TX-101 (Peeling Hub) -> Wallet B-Inter -> TX-104 -> Wallet B'],
      wallets: ['Wallet A', 'TX-101', 'Wallet B-Inter', 'TX-104', 'Wallet B']
    };
  }

  if (normalizedQuery.includes('remove') || normalizedQuery.includes('what happens')) {
    return {
      type: 'DATA_ANSWER',
      text: 'Graph Counterfactual Simulation:',
      data: ['Removing target node breaks cycle. Fraud probability drops from 94.2% down to 21.5%.'],
      wallets: []
    };
  }

  return {
    type: 'CLARIFICATION',
    text: 'Please rephrase. I answer questions about wallet connections, ring leaders, fraud patterns, or what-if scenarios.'
  };
};

export const chatbotService = {
  answerQuestion: async (query) => {
    try {
      if (typeof api.post === 'function') {
        const response = await api.post('/fraud/explain-chatbot/', { question: query });
        if (response.data?.text) return response.data;
      }
    } catch (error) {
      // The local engine keeps the assistant usable when Django is unavailable.
    }

    return localAnswer(query);
  }
};
