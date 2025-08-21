import { useEffect, useRef } from 'react';
import ChatBot, { ChatBotParams } from 'react-chatbotify';

function App() {
  /** WebSocket connection reference */
  const wsRef = useRef<WebSocket | null>(null);

  /** Active chatbot params reference (used for injecting AI responses) */
  const activeParamsRef = useRef<ChatBotParams | null>(null);

  useEffect(() => {
    let wsUrl = 'ws://simple-openai-chat-bot.onrender.com/askAI';
    console.log(window.location.hostname);
    if (window.location.hostname !== 'localhost')
      wsUrl = `wss://${window.location.hostname}/askAI`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    console.log('wsurl: ' + wsUrl);
    // --- WebSocket lifecycle events ---
    ws.addEventListener('open', () => console.log('✅ WebSocket connected'));
    ws.addEventListener('close', () =>
      console.log('❌ WebSocket disconnected')
    );
    ws.addEventListener('error', (err) =>
      console.error('⚠️ WebSocket error:', err)
    );

    // Accumulated AI response for streaming
    let aiResponseToStream = '';

    /** Handle incoming WebSocket messages */
    const handleMessage = async (event: MessageEvent) => {
      const token = event.data;

      // End of AI stream
      if (token === '[END]') {
        console.log('✅ Stream complete');
        await activeParamsRef.current?.endStreamMessage();
        aiResponseToStream = ''; // reset buffer
        return;
      }

      aiResponseToStream += token;

      if (activeParamsRef.current) {
        //stream as tokens arrive, one by one
        await activeParamsRef.current.streamMessage(aiResponseToStream);
      }
    };

    // Attach WebSocket message listener
    ws.addEventListener('message', handleMessage);

    // --- Cleanup on component unmount ---
    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, []);

  /**
   * Sends user input to the backend over WebSocket
   */
  const callOpenAI = async (params: ChatBotParams) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      await params.injectMessage('⚠️ WebSocket not connected', 'ai');
      return;
    }

    // Store reference so AI tokens know where to stream
    activeParamsRef.current = params;

    // Send user message to backend
    wsRef.current.send(params.userInput);
  };

  /** Chat flow definition */
  const flow = {
    start: {
      message:
        "👋 I'm MedBot, your healthcare assistant. How can I help you today?",
      path: 'loop',
    },
    loop: {
      message: async (params: ChatBotParams) => {
        await callOpenAI(params);
      },
      path: () => 'loop',
    },
  };

  return (
    <ChatBot
      settings={{
        general: {
          embedded: true,
          showFooter: false,
        },
        voice: { disabled: false, timeoutPeriod: 0 },
        chatHistory: { storageKey: 'medbot_history' },
        header: { title: 'MedBot' },
        botBubble: { simStream: true, streamSpeed: 30 },
      }}
      flow={flow}
    />
  );
}

export default App;
