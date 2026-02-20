"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  CheckCircle,
  Clock,
  Brain,
  Search,
  Scale,
  ChevronRight,
  Copy,
  ThumbsUp,
  MoreVertical,
  Grid,
  List,
  MessageSquare,
  Sparkles,
  Zap,
  ChevronDown,
  ArrowRight,
  Star,
  Trophy,
  Target,
  BarChart3,
  Users,
  X,
  Lightbulb,
  Cpu,
} from "lucide-react";

// AI Models configuration - Each will provide their best response
const aiModels = [
  {
    id: "gemini",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Brain,
    avatarBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    status: "online",
    strengths: ["Reasoning", "Code Generation", "Multimodal"],
    streamingSpeed: "fast", // Gemini streams fast
  },
  {
    id: "grok",
    name: "Grok 2",
    provider: "xAI",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: Search,
    avatarBg: "bg-gradient-to-br from-red-500 to-orange-500",
    status: "online",
    strengths: ["Research", "Real-time Data", "Creative Writing"],
    streamingSpeed: "slow", // Grok streams slow
  },
  {
    id: "deepseek",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: Scale,
    avatarBg: "bg-gradient-to-br from-emerald-500 to-green-500",
    status: "online",
    strengths: ["Mathematical Reasoning", "Long Context", "Efficiency"],
    streamingSpeed: "slow", // DeepSeek streams slow and shows thinking
  },
];

// Sample queries for quick selection
const sampleQueries = [
  "Explain quantum computing in simple terms",
  "Design a scalable microservices architecture",
  "Analyze the ethical implications of AI",
  "What are the latest trends in machine learning?",
  "How does blockchain technology work?",
];

// Thinking steps for each model - including rejected iterations
const thinkingSteps = {
  gemini: [
    {
      step: "Analyzing the query structure...",
      selected: true,
      reason: "Initial analysis phase",
    },
    {
      step: "Retrieving relevant knowledge from database...",
      selected: false,
      reason: "Alternative approach considered: Could use different sources",
    },
    {
      step: "Formulating comprehensive response...",
      selected: true,
      reason: "Main response generation",
    },
    {
      step: "Considering alternative explanations...",
      selected: false,
      reason: "Alternative explanation rejected for clarity",
    },
    {
      step: "Optimizing for clarity and depth...",
      selected: true,
      reason: "Quality enhancement",
    },
    {
      step: "Adding practical examples...",
      selected: true,
      reason: "Enhancing practical understanding",
    },
    {
      step: "Ensuring technical accuracy...",
      selected: true,
      reason: "Accuracy verification",
    },
    {
      step: "Exploring different analogies...",
      selected: false,
      reason: "Analogies considered but not selected",
    },
    {
      step: "Formatting response...",
      selected: true,
      reason: "Final formatting",
    },
    {
      step: "Final quality check...",
      selected: true,
      reason: "Completed",
    },
  ],
  grok: [
    {
      step: "Processing query intent...",
      selected: true,
      reason: "Understanding user needs",
    },
    {
      step: "Gathering latest information from real-time sources...",
      selected: true,
      reason: "Data collection",
    },
    {
      step: "Cross-referencing multiple sources...",
      selected: true,
      reason: "Verification",
    },
    {
      step: "Alternative approach: Using historical data...",
      selected: false,
      reason: "Historical approach rejected for timeliness",
    },
    {
      step: "Synthesizing insights...",
      selected: true,
      reason: "Information synthesis",
    },
    {
      step: "Adding creative perspectives...",
      selected: true,
      reason: "Creative enhancement",
    },
    {
      step: "Verifying factual accuracy...",
      selected: true,
      reason: "Accuracy check",
    },
    {
      step: "Considering humorous angle...",
      selected: false,
      reason: "Humor rejected for professionalism",
    },
    {
      step: "Structuring response...",
      selected: true,
      reason: "Organization",
    },
    {
      step: "Polishing final output...",
      selected: true,
      reason: "Completed",
    },
  ],
  deepseek: [
    {
      step: "Understanding user needs...",
      selected: true,
      reason: "Initial comprehension",
    },
    {
      step: "Applying analytical framework...",
      selected: true,
      reason: "Analysis setup",
    },
    {
      step: "Alternative mathematical model considered...",
      selected: false,
      reason: "Complex model rejected for simplicity",
    },
    {
      step: "Generating structured response...",
      selected: true,
      reason: "Response generation",
    },
    {
      step: "Adding technical details...",
      selected: true,
      reason: "Technical enhancement",
    },
    {
      step: "Optimizing for precision...",
      selected: true,
      reason: "Precision focus",
    },
    {
      step: "Incorporating mathematical reasoning...",
      selected: true,
      reason: "Mathematical approach",
    },
    {
      step: "Alternative formula derivation...",
      selected: false,
      reason: "Alternative formula too complex",
    },
    {
      step: "Reviewing for completeness...",
      selected: true,
      reason: "Completeness check",
    },
    {
      step: "Preparing final response...",
      selected: true,
      reason: "Completed",
    },
  ],
};

// Mock response content for non-Gemini models
const mockResponseContent = {
  grok: {
    content: `**Quantum Computing: The Next Frontier**

Based on comprehensive analysis of recent developments, quantum computing is transitioning from theoretical concept to practical reality faster than anticipated.

**Technical Milestones:**
- IBM's 433-qubit Osprey processor (2023)
- Google's quantum advantage demonstration (2019)
- Microsoft's topological qubit breakthroughs
- Rigetti's hybrid quantum-classical systems

**Industry Applications Timeline:**

• **2023-2025**: NISQ (Noisy Intermediate-Scale Quantum) era
• **2025-2030**: Error-corrected quantum computers
• **2030+**: Fault-tolerant quantum supremacy

**Investment Landscape:**
- Global quantum computing market: $1.76B (2023)
- Expected CAGR: 33.8% through 2030
- Major players: IBM, Google, Microsoft, Amazon, Alibaba

**Practical Challenges:**
1. Quantum decoherence management
2. Error correction at scale
3. Cryogenic infrastructure costs
4. Algorithm development lag

**Most Promising Short-term Use Cases:**
- Quantum chemistry simulations
- Portfolio optimization in finance
- Supply chain logistics
- Material science discoveries`,
  },
  deepseek: {
    content: `**Quantum Computing: Mathematical Foundation & Current State**

**Mathematical Framework:**
Quantum computing operates on principles of linear algebra and probability:
- State vector: |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1
- Unitary transformations: U|ψ⟩ where U†U = I
- Measurement outcomes follow Born rule: P(x) = |⟨x|ψ⟩|²

**Architectural Approaches:**

1. **Superconducting Qubits** (IBM, Google):
   - Coherence times: ~100-500 μs
   - Gate fidelities: 99.9+%
   - Scaling challenges: crosstalk, control complexity

2. **Trapped Ions** (IonQ, Honeywell):
   - Coherence: >10 seconds
   - All-to-all connectivity
   - Slower gate operations

3. **Topological Qubits** (Microsoft):
   - Theoretical error resilience
   - Majorana fermion implementation
   - Still experimental

**Performance Metrics:**
- Quantum Volume: Measure of computational power
- Algorithmic speedup: Shor's algorithm (exponential), Grover's (quadratic)
- Fidelity thresholds: Surface code requires 99.9% for fault tolerance

**Economic Analysis:**
Quantum computing will likely complement classical systems rather than replace them. Hybrid quantum-classical algorithms (like VQE and QAOA) show immediate practical value for optimization problems.`,
  },
};

// Function to generate random score between 8.0 and 9.75
const generateRandomScore = () => {
  const min = 8.0;
  const max = 9.75;
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Function to generate random metrics based on score
const generateRandomMetrics = (score) => {
  const baseValue = Math.round(score * 10);
  const variation = 2; // ±2 variation

  return {
    accuracy: Math.min(
      100,
      Math.max(
        85,
        baseValue + Math.floor(Math.random() * variation * 2 - variation)
      )
    ),
    depth: Math.min(
      100,
      Math.max(
        85,
        baseValue + Math.floor(Math.random() * variation * 2 - variation)
      )
    ),
    clarity: Math.min(
      100,
      Math.max(
        85,
        baseValue + Math.floor(Math.random() * variation * 2 - variation)
      )
    ),
    relevance: Math.min(
      100,
      Math.max(
        85,
        baseValue + Math.floor(Math.random() * variation * 2 - variation)
      )
    ),
  };
};

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyCZLiwI5W0Tnt8SfgUpLlSgZdcF6Zk6vxo";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to fetch response from Gemini API
const fetchGeminiResponse = async (query) => {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: query,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated."
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `I encountered an error while generating a response: ${error.message}. This could be due to network issues or API limitations. Please try again or use a sample question.`;
  }
};

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [aiStatus, setAiStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [streamingText, setStreamingText] = useState({});
  const [currentThinkingStep, setCurrentThinkingStep] = useState({});
  const [showModels, setShowModels] = useState(true);
  const [winner, setWinner] = useState(null);
  const [showThinkingProcess, setShowThinkingProcess] = useState({});
  const [sampleQueriesVisible, setSampleQueriesVisible] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const status = {};
    aiModels.forEach((model) => {
      status[model.id] = "idle";
    });
    setAiStatus(status);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeChat, streamingText]);

  const streamText = async (text, modelId, chatId) => {
    const words = text.split(" ");
    let currentText = "";

    // Adjust streaming speed based on model
    const baseDelay = modelId === "gemini" ? 20 : 60; // Faster for Gemini
    const randomDelay = modelId === "gemini" ? 15 : 40; // Less random variation for Gemini

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? " " : "") + words[i];
      setStreamingText((prev) => ({
        ...prev,
        [`${chatId}-${modelId}`]: currentText,
      }));

      // Different streaming speeds for different models
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelay + Math.random() * randomDelay)
      );
    }
  };

  const simulateThinking = async (modelId, chatId, userQuery) => {
    const steps = thinkingSteps[modelId];
    setAiStatus((prev) => ({ ...prev, [modelId]: "thinking" }));

    // Store all thinking steps for this model
    const allThinkingSteps = [];

    for (const step of steps) {
      setCurrentThinkingStep((prev) => ({ ...prev, [modelId]: step.step }));
      allThinkingSteps.push(step);

      // Different thinking speeds for different models
      const thinkDelay = modelId === "gemini" ? 400 : 1200; // Gemini thinks faster
      await new Promise((resolve) =>
        setTimeout(resolve, thinkDelay + Math.random() * 300)
      );

      setThinkingProcess((prev) => [
        ...prev.slice(-8),
        {
          id: Date.now() + Math.random(),
          modelId,
          step: step.step,
          selected: step.selected,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
      ]);
    }

    setAiStatus((prev) => ({ ...prev, [modelId]: "generating" }));

    let responseContent = "";

    if (modelId === "gemini") {
      // Fetch real response from Gemini API
      responseContent = await fetchGeminiResponse(userQuery);
    } else {
      // Use mock responses for other models
      responseContent =
        mockResponseContent[modelId]?.content ||
        `Response from ${modelId}: ${userQuery}`;
    }

    await streamText(responseContent, modelId, chatId);

    // Generate random score and metrics for this response
    const score = generateRandomScore();
    const metrics = generateRandomMetrics(score);

    return {
      content: responseContent,
      score: score,
      metrics: metrics,
      status: "completed",
      completedAt: new Date().toISOString(),
      thinkingSteps: allThinkingSteps,
    };
  };

  const createNewChat = async (query) => {
    setIsProcessing(true);
    setThinkingProcess([]);
    setStreamingText({});
    setCurrentThinkingStep({});
    setWinner(null);
    setShowThinkingProcess({});
    setSampleQueriesVisible(false);

    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      responses: {},
      createdAt: new Date().toISOString(),
    };

    setChatHistory((prev) => [newChat, ...prev]);
    setActiveChat(newChatId);

    // Run all AI models in parallel
    const promises = aiModels.map((model) =>
      simulateThinking(model.id, newChatId, query)
    );
    const results = await Promise.all(promises);

    // Update chat history with all responses
    const updatedResponses = {};
    results.forEach((response, index) => {
      const model = aiModels[index];
      updatedResponses[model.id] = response;
    });

    // Determine winner (highest score)
    const scores = results.map((r) => r.score);
    const maxScore = Math.max(...scores);
    const winnerIndex = results.findIndex((r) => r.score === maxScore);
    setWinner(aiModels[winnerIndex].id);

    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === newChatId
          ? {
              ...chat,
              responses: updatedResponses,
            }
          : chat
      )
    );

    // Set all to completed
    aiModels.forEach((model) => {
      setAiStatus((prev) => ({ ...prev, [model.id]: "completed" }));
    });

    setIsProcessing(false);
    setCurrentThinkingStep({});
    setSampleQueriesVisible(true);
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    createNewChat(input);
    setInput("");
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setInput("");
    setThinkingProcess([]);
    setStreamingText({});
    setWinner(null);
    setSampleQueriesVisible(true);
    inputRef.current?.focus();
  };

  const handleSampleQuery = (query) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const getActiveChat = () => {
    return chatHistory.find((chat) => chat.id === activeChat);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "thinking":
        return <Clock className="w-3 h-3 animate-spin" />;
      case "generating":
        return (
          <div className="flex items-center gap-0.5">
            <div
              className="w-1 h-1 bg-current rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-1 bg-current rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 bg-current rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        );
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-current/50" />;
    }
  };

  const renderScoreBadge = (modelId, score) => {
    const isWinner = winner === modelId;
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          isWinner
            ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30"
            : "bg-card/50 border border-border"
        }`}
      >
        {isWinner && <Trophy className="w-3 h-3 text-yellow-500" />}
        <Star className="w-3 h-3 text-yellow-500" />
        <span className="text-sm font-bold">{score.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
    );
  };

  const toggleThinkingProcess = (modelId) => {
    setShowThinkingProcess((prev) => ({
      ...prev,
      [modelId]: !prev[modelId],
    }));
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            var(--primary),
            var(--secondary)
          );
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            color-mix(in srgb, var(--primary) 90%, white),
            color-mix(in srgb, var(--secondary) 90%, white)
          );
        }
      `}</style>

      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="backdrop-blur-xl bg-card/50 border-b border-border py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground bg-gradient-to-r from-blue-500 via-red-500 to-emerald-500 bg-clip-text text-transparent animate-text-glow">
                  AI Collective Arena
                </h1>
                <p className="text-xs text-muted-foreground">
                  Compare top AI models with automatic scoring
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 backdrop-blur-sm"
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            New Battle
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-border bg-background/50 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Battle History</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg backdrop-blur-sm ${
                      viewMode === "grid"
                        ? "bg-card/50 border border-border"
                        : "hover:bg-card/30"
                    }`}
                  >
                    <Grid className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg backdrop-blur-sm ${
                      viewMode === "list"
                        ? "bg-card/50 border border-border"
                        : "hover:bg-card/30"
                    }`}
                  >
                    <List className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chatHistory.map((chat) => {
                  const responses = chat.responses || {};
                  const scores = Object.values(responses).map(
                    (r) => r?.score || 0
                  );
                  const maxScore = Math.max(...scores);
                  const winnerId = Object.keys(responses).find(
                    (id) => responses[id]?.score === maxScore
                  );
                  const winnerModel = aiModels.find((m) => m.id === winnerId);

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all backdrop-blur-sm ${
                        activeChat === chat.id
                          ? "bg-card/50 border border-primary/30 shadow-lg shadow-primary/10"
                          : "hover:bg-card/30 border border-transparent hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-foreground truncate flex-1">
                          {chat.query}
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          {chat.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {aiModels.map((model) => {
                            const response = responses[model.id];
                            return (
                              <div
                                key={model.id}
                                className={`w-6 h-6 rounded-full ${model.avatarBg} border-2 border-background flex items-center justify-center shadow-lg relative`}
                              >
                                <model.icon className="w-3 h-3 text-white" />
                                {response?.score && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border border-border flex items-center justify-center">
                                    <span className="text-[8px] font-bold">
                                      {response.score.toFixed(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {winnerModel && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            {winnerModel.name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Models Overview */}
            <div className="p-4 border-b border-border">
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 className="font-medium text-foreground">AI Models</h3>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    showModels ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showModels && (
                <div className="space-y-2 animate-fade-in">
                  {aiModels.map((model) => {
                    const status = aiStatus[model.id];
                    return (
                      <div
                        key={model.id}
                        className="p-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`relative ${model.avatarBg} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}
                          >
                            <model.icon className="w-5 h-5 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-lg" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground text-sm">
                                {model.name}
                              </h4>
                              <div className="text-xs text-muted-foreground">
                                {getStatusIcon(status)}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {model.provider}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {model.strengths.map((strength) => (
                            <span
                              key={strength}
                              className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Thinking Process Bar */}
            {thinkingProcess.length > 0 && (
              <div className="border-b border-border bg-card/20 py-3 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  AI Models are thinking...
                </div>
                <div className="flex items-center gap-3 overflow-x-auto">
                  {thinkingProcess.slice(-3).map((process) => {
                    const model = aiModels.find(
                      (a) => a.id === process.modelId
                    );
                    return (
                      <div
                        key={process.id}
                        className={`flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg border ${
                          process.selected
                            ? "bg-card/50 border-border"
                            : "bg-red-500/10 border-red-500/20"
                        } animate-fade-in`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${model?.avatarBg} flex items-center justify-center shadow-md`}
                        >
                          <model.icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-sm text-foreground">
                          {process.step}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {process.timestamp}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Display */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeChat && getActiveChat() ? (
                <div className="h-full">
                  {/* User Query */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {getActiveChat().query}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Battle Session • {getActiveChat().timestamp}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winner Banner */}
                  {winner && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                          <div>
                            <div className="font-medium text-foreground">
                              Battle Complete! Winner Declared
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {aiModels.find((m) => m.id === winner)?.name}{" "}
                              achieved the highest score
                            </div>
                          </div>
                        </div>
                        {/* <button className="px-3 py-1.5 rounded-lg bg-card/50 border border-border text-sm hover:bg-card/70">
                          View Detailed Comparison
                        </button> */}
                      </div>
                    </div>
                  )}

                  {/* AI Responses Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {aiModels.map((model) => {
                      const response = getActiveChat().responses?.[model.id];
                      const status = aiStatus[model.id];
                      const streamKey = `${activeChat}-${model.id}`;
                      const displayText =
                        streamingText[streamKey] || response?.content;
                      const showThinking = showThinkingProcess[model.id];

                      return (
                        <div
                          key={model.id}
                          className={`rounded-2xl border overflow-hidden transition-all duration-300 backdrop-blur-sm ${
                            winner === model.id
                              ? "border-yellow-500/50 bg-card/70 shadow-xl shadow-yellow-500/10"
                              : status === "thinking" || status === "generating"
                              ? `border-${
                                  model.id === "gemini"
                                    ? "blue"
                                    : model.id === "grok"
                                    ? "red"
                                    : "emerald"
                                }-500/50 bg-card/70 shadow-lg shadow-${
                                  model.id === "gemini"
                                    ? "blue"
                                    : model.id === "grok"
                                    ? "red"
                                    : "emerald"
                                }-500/10`
                              : "border-border bg-card/50"
                          }`}
                          style={{
                            minHeight: "400px",
                            maxHeight: "500px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-border bg-gradient-to-r from-card to-card/80">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg ${model.avatarBg} flex items-center justify-center shadow-lg`}
                                >
                                  <model.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-foreground">
                                      {model.name}
                                    </h3>
                                    {winner === model.id && (
                                      <Trophy className="w-4 h-4 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {model.provider} • Streaming:{" "}
                                    {model.streamingSpeed}
                                  </div>
                                </div>
                              </div>
                              {response?.score &&
                                renderScoreBadge(model.id, response.score)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 overflow-y-auto">
                            {status === "thinking" ? (
                              <div className="h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                  <Lightbulb className="w-5 h-5 text-primary animate-pulse" />
                                  <div className="flex-1">
                                    <div className="text-sm text-primary font-medium mb-1">
                                      {model.id === "deepseek"
                                        ? "DeepSeek Thinking..."
                                        : "Generating Response"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {currentThinkingStep[model.id] ||
                                        "Initializing..."}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {thinkingProcess
                                    .filter((p) => p.modelId === model.id)
                                    .slice(-5)
                                    .map((step) => (
                                      <div
                                        key={step.id}
                                        className={`text-xs pl-4 border-l-2 py-1 animate-fade-in ${
                                          step.selected
                                            ? "text-muted-foreground border-primary/30"
                                            : "text-red-400/70 border-red-400/30"
                                        }`}
                                      >
                                        {step.step}
                                        {!step.selected && (
                                          <span className="ml-2 text-xs text-red-400/50">
                                            (not selected)
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ) : status === "generating" ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-secondary mb-3">
                                  <Sparkles className="w-4 h-4 animate-pulse" />
                                  <span className="text-sm font-medium">
                                    {model.id === "deepseek"
                                      ? "DeepSeek Reasoning..."
                                      : "Generating response..."}
                                  </span>
                                </div>
                                <div className="prose prose-invert max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                  {displayText}
                                  <span className="inline-block w-1 h-4 bg-secondary animate-pulse ml-0.5" />
                                </div>
                              </div>
                            ) : response?.status === "completed" ? (
                              <>
                                {/* Show Thinking Process Toggle */}
                                {response.thinkingSteps && (
                                  <div className="mb-4">
                                    <button
                                      onClick={() =>
                                        toggleThinkingProcess(model.id)
                                      }
                                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Cpu className="w-3 h-3" />
                                      {showThinking ? "Hide" : "Show"} thinking
                                      process
                                      <ChevronDown
                                        className={`w-3 h-3 transition-transform ${
                                          showThinking ? "rotate-180" : ""
                                        }`}
                                      />
                                    </button>

                                    {showThinking && (
                                      <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border">
                                        <div className="text-xs font-medium text-foreground mb-2">
                                          Internal Reasoning Process
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                          {response.thinkingSteps.map(
                                            (step, index) => (
                                              <div
                                                key={index}
                                                className={`text-xs p-2 rounded border ${
                                                  step.selected
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-red-500/5 border-red-500/20"
                                                }`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  {step.selected ? (
                                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                  ) : (
                                                    <X className="w-3 h-3 text-red-500" />
                                                  )}
                                                  <span
                                                    className={
                                                      step.selected
                                                        ? "text-foreground"
                                                        : "text-red-400/70"
                                                    }
                                                  >
                                                    {step.step}
                                                  </span>
                                                </div>
                                                {step.reason && (
                                                  <div className="text-xs text-muted-foreground mt-1 ml-5">
                                                    {step.reason}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="prose prose-invert max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                  {displayText}
                                </div>

                                {/* Metrics */}
                                {response.metrics && (
                                  <div className="mt-4 pt-4 border-t border-border">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      Performance Metrics:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(response.metrics).map(
                                        ([key, value]) => (
                                          <div
                                            key={key}
                                            className="flex items-center justify-between text-xs"
                                          >
                                            <span className="capitalize text-muted-foreground">
                                              {key}:
                                            </span>
                                            <div className="flex items-center gap-1">
                                              <span className="font-medium">
                                                {value}%
                                              </span>
                                              <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-gradient-to-r from-primary to-secondary"
                                                  style={{ width: `${value}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="h-full flex items-center justify-center text-center p-6">
                                <div>
                                  <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <model.icon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Ready to compete
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-primary/30 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
                    <Trophy className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-foreground mb-3 bg-gradient-to-r from-blue-500 via-red-500 to-emerald-500 bg-clip-text text-transparent animate-text-glow">
                    AI Collective Arena
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-8 text-lg">
                    Witness the ultimate AI showdown. Top models compete to
                    provide the best answers, with automatic scoring and
                    comparison.
                  </p>
                  <div className="flex items-center gap-3 mb-6">
                    {aiModels.map((model, index) => (
                      <div key={model.id} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full ${model.avatarBg} flex items-center justify-center shadow-lg`}
                        >
                          <model.icon className="w-4 h-4 text-white" />
                        </div>
                        {index < aiModels.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-primary mx-2 animate-text-glow-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sample Questions */}
            {sampleQueriesVisible && !activeChat && !isProcessing && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Try these sample questions:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.slice(0, 3).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuery(query)}
                      className="px-3 py-2 text-sm rounded-lg bg-card/50 border border-border hover:border-primary/30 hover:bg-card/70 transition-colors backdrop-blur-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card/30 backdrop-blur-xl">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Enter your question here..."
                    className="w-full px-5 py-4 rounded-xl backdrop-blur-sm bg-background/50 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground resize-none"
                    rows={2}
                    disabled={isProcessing}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-sm"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Start Battle
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
