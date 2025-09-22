import React, { useState, useEffect, useRef, FC, SVGProps } from 'react';

// --- TYPE DEFINITIONS ---
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// --- MOCK DATA ---
const initialChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Planes a 30-day trip to Norway',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 'chat-2',
    title: 'Ideas for a customer loyalty program',
    messages: [
        { id: 'msg-1', sender: 'user', text: 'Give me some ideas for a customer loyalty program for a coffee shop.' },
        { id: 'msg-2', sender: 'ai', text: 'Of course! How about a points-based system where customers earn a star for every coffee purchased? After 10 stars, they get a free drink. You could also offer exclusive discounts to members on their birthdays.' },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 'chat-3',
    title: 'Help me pack',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
];

// --- SVG ICONS ---
const LogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8.22 15.655l-1.875-1.082a.5.5 0 01-.22-.41V9.837a.5.5 0 01.22-.41l1.875-1.083a.5.5 0 01.75.41v5.5a.5.5 0 01-.75.41zm3.945.75a.5.5 0 00.75-.41v-5.5a.5.5 0 00-.75-.41L9.04 8.752a.5.5 0 00-.22.41v5.5a.5.5 0 00.22.41l3.125 1.812zm3.125-1.812l1.875-1.083a.5.5 0 00.22-.41V9.837a.5.5 0 00-.22-.41l-1.875-1.083a.5.5 0 00-.75.41v5.5a.5.5 0 00.75.41z" fill="currentColor"/>
  </svg>
);

const SendIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14l11-11-11 11z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const MenuIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const UserIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);


// --- HELPER COMPONENTS ---

const WelcomeScreen = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const prompts = [
        { title: 'Saved Prompt Templates', description: 'Users save and reuse prompt templates for consistency.' },
        { title: 'Media Type Selection', description: 'Users select media type for tailored response generation.' },
        { title: 'Multilingual Support', description: 'Choose language for better interaction.' },
    ];

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div className="bg-gray-800/50 p-8 rounded-2xl max-w-lg w-full">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">How can I help you today?</h1>
                <p className="text-gray-400 mb-8">
                    This code will display a prompt asking the user for their name, and then it will display a greeting message with the name entered by the user.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {prompts.map((p) => (
                        <button key={p.title} onClick={() => onPromptClick(p.description)} className="bg-gray-700/60 p-4 rounded-lg text-left hover:bg-gray-700 transition-colors">
                            <h3 className="font-semibold text-gray-200 text-sm">{p.title}</h3>
                            <p className="text-gray-400 text-xs mt-1">{p.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
      <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-gray-800/50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-500' : 'bg-green-500'}`}>
              {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <LogoIcon className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-grow pt-1">
              <p className="text-gray-200 leading-relaxed">{message.text}</p>
          </div>
      </div>
  );
};

const LoadingIndicator = () => (
    <div className="flex items-start gap-4 p-4 bg-gray-800/50">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <LogoIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow pt-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);


// --- MAIN APP COMPONENT ---
const App: FC = () => {
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChats.length > 1 ? initialChats[1].id : null);
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = chats.find(c => c.id === activeChatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages, isLoading]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || currentMessage;
        if (!textToSend.trim() || !activeChatId) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            text: textToSend,
            sender: 'user',
        };

        // Update state optimistically
        setChats(prev => prev.map(chat =>
            chat.id === activeChatId
                ? { ...chat, messages: [...(chat.messages || []), userMessage] }
                : chat
        ));
        setCurrentMessage('');
        setIsLoading(true);

        try {
            // --- API INTEGRATION POINT ---
            // This is a mock API call. Replace with your actual FastAPI endpoint fetch
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            const aiResponse: Message = {
                id: `msg-${Date.now() + 1}`,
                text: `This is a simulated AI response to: "${textToSend}"`,
                sender: 'ai',
            };

            setChats(prev => prev.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, messages: [...(chat.messages || []), aiResponse] }
                    : chat
            ));

        } catch (error) {
            console.error("Failed to get AI response:", error);
            const errorResponse: Message = {
                id: `msg-${Date.now() + 1}`,
                text: "I'm sorry, I encountered an error. Please try again.",
                sender: 'ai',
            };
            setChats(prev => prev.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, messages: [...(chat.messages || []), errorResponse] }
                    : chat
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
    };

    return (
        <div className="bg-[#0c0c0c] text-gray-200 font-sans flex h-screen">
            {/* Sidebar */}
            <div className={`bg-[#171717] w-80 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative z-20 md:translate-x-0 h-full`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="w-8 h-8 text-green-400" />
                        <h1 className="text-xl font-semibold">My Chats</h1>
                    </div>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    <div className="space-y-2">
                        {chats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`w-full text-left p-3 rounded-lg truncate text-sm transition-colors ${activeChatId === chat.id ? 'bg-green-500/20 text-green-300' : 'hover:bg-gray-700/50'}`}
                            >
                                {chat.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-[0_0_15px_rgba(16,163,127,0.3)] hover:shadow-[0_0_25px_rgba(16,163,127,0.5)]">
                        <PlusIcon className="w-5 h-5" />
                        New chat
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-black">
                {/* Header */}
                 <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden p-1 text-gray-400 hover:text-white">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h2 className="font-semibold text-lg">{activeChat?.title || 'Chat'}</h2>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto">
                    {activeChat && activeChat.messages && activeChat.messages.length > 0 ? (
                        <div className="pb-4">
                            {activeChat.messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                            {isLoading && <LoadingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <WelcomeScreen onPromptClick={(prompt) => handleSendMessage(prompt)} />
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="max-w-3xl mx-auto">
                         <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                            <textarea
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type your prompt here..."
                                rows={1}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl py-3 pl-4 pr-14 resize-none text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !currentMessage.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 w-9 h-9 rounded-lg flex items-center justify-center text-black disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-600 transition-all duration-200 shadow-[0_0_10px_rgba(16,163,127,0.3)]"
                                aria-label="Send message"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                        <p className="text-center text-xs text-gray-500 mt-3">
                            AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

