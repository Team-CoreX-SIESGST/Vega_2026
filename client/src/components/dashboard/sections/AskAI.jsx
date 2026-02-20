
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AskAI = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your orders, products, or refunds.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Get token if needed (assuming auth middleware is active)
            // But for now we just fetch. If auth fails, we handle it.
            // Note: The backend route /api/chat/ask needs to be public or we need token
            // Based on app.js: app.use("/api/chat", chatRouter) and chatRouter has router.post("/ask"...)
            // And app.js has app.use(verifyJWT) before /api/chat. So we need credentials.

            // Assuming the app handles auth headers globally or we rely on cookies.
            // If using axios with credentials: true.
            // Using fetch here for simplicity.

            const res = await fetch('http://localhost:8000/api/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if you have the token in localStorage
                    // 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                credentials: 'include', // If using cookies
                body: JSON.stringify({ query: userMessage })
            });

            const data = await res.json();

            console.log('API Response:', data); // Debug log

            if (data.status) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error answering that." }]);
            }

        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">AI Assistant</h2>
                        <p className="text-xs text-muted-foreground">Powered by Groq (Llama 3.3) & Pinecone</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}

                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white/10 text-foreground rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about orders (e.g., 'Show me orders from March 2012')..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AskAI;
