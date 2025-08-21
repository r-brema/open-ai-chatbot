import ChatBot from 'react-chatbotify';

function App() {
  const hasError = false;
  const call_openai = async (params) => {
    const response = await fetch('http://127.0.0.1:8000/askAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: params.userInput }),
    });
    if (!response.ok) {
      await params.injectMessage('Request failed');
      return;
    }

    const data = await response.json();
    await params.injectMessage(data.response);
  };

  const flow = {
    start: {
      message: `I'm MedBot, I'm here to assist you with all your healthcare related questions`,
      path: 'loop',
    },
    loop: {
      message: async (params) => {
        await call_openai(params);
      },
      path: () => {
        if (hasError) {
          return 'start';
        }
        return 'loop';
      },
    },
  };

  return (
    <ChatBot
      settings={{
        general: { embedded: true, showFooter: false },
        voice: { disabled: false, timeoutPeriod: 0 },
        chatHistory: { storageKey: 'medbot_history' },
        header: { title: 'MedBot' },
        botBubble: { simulateStream: true },
      }}
      flow={flow}
    />
  );
}

export default App;
