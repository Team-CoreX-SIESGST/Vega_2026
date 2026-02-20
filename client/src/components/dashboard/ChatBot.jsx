// components/ChatBot.js - Enhanced Version
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Close,
  SmartToy,
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Error,
  Lightbulb,
  Analytics,
  Psychology,
  Speed,
  AccountTree,
  PieChart,
  Timeline,
} from "@mui/icons-material";

const ChatBot = ({ insights = [], section = "overview" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "bot",
      text: `🔍 **Analyzing ${section} data...**\nI'm processing your metrics to generate actionable insights. This will take a moment.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isInsight: false,
      isAnalyzing: true,
    },
  ]);
  const chatEndRef = useRef(null);
  const thinkingIntervalRef = useRef(null);

  const sectionTitles = {
    overview: "Dashboard Overview",
    revenue: "Revenue & Orders",
    products: "Products Analysis",
    refunds: "Refund Analysis",
    traffic: "Traffic & Engagement",
    conversion: "Conversion Optimization",
  };

  const sectionIcons = {
    overview: <Analytics />,
    revenue: <TrendingUp />,
    products: <PieChart />,
    refunds: <Warning />,
    traffic: <AccountTree />,
    conversion: <Timeline />,
  };

  const getInsightIcon = (type) => {
    switch (type.toLowerCase()) {
      case "critical":
      case "alert":
        return <Error sx={{ color: "#EF4444", fontSize: 18 }} />;
      case "warning":
        return <Warning sx={{ color: "#F59E0B", fontSize: 18 }} />;
      case "success":
      case "excellent":
        return <CheckCircle sx={{ color: "#10B981", fontSize: 18 }} />;
      case "opportunity":
        return <TrendingUp sx={{ color: "#8B5CF6", fontSize: 18 }} />;
      case "info":
        return <Info sx={{ color: "#3B82F6", fontSize: 18 }} />;
      default:
        return <Lightbulb sx={{ color: "#6B7280", fontSize: 18 }} />;
    }
  };

  const getInsightColor = (type) => {
    switch (type.toLowerCase()) {
      case "critical":
      case "alert":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      case "success":
      case "excellent":
        return "#10B981";
      case "opportunity":
        return "#8B5CF6";
      case "info":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getSeverityLevel = (type) => {
    switch (type.toLowerCase()) {
      case "critical":
        return 5;
      case "alert":
        return 4;
      case "warning":
        return 3;
      case "opportunity":
        return 2;
      case "info":
        return 1;
      case "success":
      case "excellent":
        return 0;
      default:
        return 1;
    }
  };

  const simulateThinking = () => {
    const thinkingMessages = [
      "Analyzing data patterns...",
      "Processing metrics...",
      "Comparing against benchmarks...",
      "Identifying opportunities...",
      "Generating recommendations...",
      "Calculating impact...",
      "Finalizing insights...",
    ];

    let thoughtIndex = 0;
    thinkingIntervalRef.current = setInterval(() => {
      if (thoughtIndex < thinkingMessages.length) {
        setChatHistory((prev) => {
          const newHistory = prev.filter((msg) => !msg.isThinking);
          return [
            ...newHistory,
            {
              id: Date.now(),
              sender: "bot",
              text: thinkingMessages[thoughtIndex],
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isThinking: true,
              isInsight: false,
            },
          ];
        });
        thoughtIndex++;
      } else {
        clearInterval(thinkingIntervalRef.current);
      }
    }, 800 + Math.random() * 1200);
  };

  const generateInsight = async (insight, index) => {
    // Clear any thinking messages
    setChatHistory((prev) => prev.filter((msg) => !msg.isThinking));

    // Add analyzing message
    const analyzingId = Date.now();
    setChatHistory((prev) => [
      ...prev,
      {
        id: analyzingId,
        sender: "bot",
        text: `🧠 **Processing Insight ${index + 1}/${insights.length}**\n*${
          insight.title
        }*`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isAnalyzing: true,
        isInsight: false,
      },
    ]);

    // Simulate analysis time based on severity
    const analysisTime = getSeverityLevel(insight.type) * 500 + 1000;
    await new Promise((resolve) => setTimeout(resolve, analysisTime));

    // Remove analyzing message
    setChatHistory((prev) => prev.filter((msg) => msg.id !== analyzingId));

    // Start typing effect for the insight
    setIsTyping(true);
    const fullText = `## ${insight.title}\n\n**📊 Analysis:** ${
      insight.message
    }\n\n**🎯 Recommendation:** ${insight.recommendation}\n\n**⚡ Impact:** ${
      insight.impact || "Significant"
    }\n**⏱️ Timeframe:** ${insight.timeframe || "Next 30 days"}`;

    let currentChar = 0;
    const typingSpeed = 20; // ms per character

    const typingInterval = setInterval(() => {
      if (currentChar <= fullText.length) {
        setDisplayedText(fullText.substring(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Add completed insight to chat
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: fullText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: insight.type,
            isInsight: true,
            title: insight.title,
          },
        ]);

        setDisplayedText("");
        setCurrentInsightIndex((prev) => prev + 1);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  };

  useEffect(() => {
    if (!isOpen || !insights.length || currentInsightIndex >= insights.length)
      return;

    if (!isThinking && !isTyping) {
      setIsThinking(true);
      simulateThinking();

      // Start generating the next insight after thinking phase
      setTimeout(async () => {
        clearInterval(thinkingIntervalRef.current);
        await generateInsight(
          insights[currentInsightIndex],
          currentInsightIndex
        );
        setIsThinking(false);
      }, 5000 + Math.random() * 3000);
    }
  }, [isOpen, insights, currentInsightIndex, isThinking, isTyping]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, displayedText]);

  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  // Calculate insights statistics
  const insightsStats = {
    total: insights.length,
    critical: insights.filter(
      (i) => i.type === "critical" || i.type === "alert"
    ).length,
    warnings: insights.filter((i) => i.type === "warning").length,
    opportunities: insights.filter((i) => i.type === "opportunity").length,
    completed: currentInsightIndex,
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <Tooltip title="AI Insights Assistant">
          <IconButton
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              width: 60,
              height: 60,
              boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                transform: "scale(1.05)",
                boxShadow: "0 15px 50px rgba(102, 126, 234, 0.6)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {isOpen ? <Close /> : <SmartToy />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: { xs: "calc(100vw - 48px)", sm: 500 },
              maxWidth: "calc(100vw - 48px)",
              height: 600,
              maxHeight: "calc(100vh - 124px)",
              zIndex: 9998,
              overflow: "hidden",
            }}
          >
            <Paper
              elevation={24}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: "rgba(30, 41, 59, 0.8)",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <Psychology />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {sectionIcons[section]}
                      AI Analytics Assistant
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Speed sx={{ fontSize: 12 }} />
                      Analyzing: {sectionTitles[section]}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                      label={`${insightsStats.completed}/${insightsStats.total}`}
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.15)",
                        color: "#8193ff",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        "& .MuiChip-icon": { color: "#8193ff" },
                        fontSize: "0.7rem",
                        height: 24,
                      }}
                    />
                    {insightsStats.critical > 0 && (
                      <Chip
                        icon={<Error sx={{ fontSize: 14 }} />}
                        label={insightsStats.critical}
                        size="small"
                        sx={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          "& .MuiChip-icon": { color: "#f87171" },
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (insightsStats.completed / insightsStats.total) * 100
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {insightsStats.completed === insightsStats.total
                        ? "Analysis Complete"
                        : "Generating Insights..."}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {Math.round(
                        (insightsStats.completed / insightsStats.total) * 100
                      )}
                      %
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  background:
                    "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
                }}
              >
                {chatHistory.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        flexDirection:
                          msg.sender === "user" ? "row-reverse" : "row",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            msg.sender === "bot"
                              ? "rgba(102, 126, 234, 0.2)"
                              : "rgba(148, 163, 184, 0.2)",
                          flexShrink: 0,
                          mt: 0.5,
                        }}
                      >
                        {msg.sender === "bot" ? (
                          msg.isThinking ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#8193ff" }}
                            />
                          ) : (
                            <Psychology sx={{ fontSize: 16 }} />
                          )
                        ) : (
                          <Analytics sx={{ fontSize: 16 }} />
                        )}
                      </Avatar>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: "85%",
                          p: msg.isThinking || msg.isAnalyzing ? 1.5 : 2,
                          borderRadius: 2,
                          background: msg.isThinking
                            ? "rgba(102, 126, 234, 0.1)"
                            : msg.isAnalyzing
                            ? "rgba(59, 130, 246, 0.1)"
                            : msg.isInsight
                            ? `rgba(${parseInt(
                                getInsightColor(msg.type).slice(1, 3),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(3, 5),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(5, 7),
                                16
                              )}, 0.1)`
                            : "rgba(102, 126, 234, 0.1)",
                          border: "1px solid",
                          borderColor: msg.isThinking
                            ? "rgba(102, 126, 234, 0.2)"
                            : msg.isAnalyzing
                            ? "rgba(59, 130, 246, 0.2)"
                            : msg.isInsight
                            ? `rgba(${parseInt(
                                getInsightColor(msg.type).slice(1, 3),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(3, 5),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(5, 7),
                                16
                              )}, 0.2)`
                            : "rgba(102, 126, 234, 0.2)",
                          borderLeft: msg.isInsight
                            ? `4px solid ${getInsightColor(msg.type)}`
                            : msg.isAnalyzing
                            ? "4px solid #3B82F6"
                            : "1px solid rgba(102, 126, 234, 0.2)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {msg.isThinking || msg.isAnalyzing ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <CircularProgress size={16} thickness={5} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: msg.isAnalyzing
                                  ? "#93c5fd"
                                  : "rgba(255, 255, 255, 0.8)",
                                fontStyle: msg.isThinking ? "italic" : "normal",
                                fontWeight: msg.isAnalyzing ? 500 : 400,
                              }}
                            >
                              {msg.text}
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {msg.isInsight && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1.5,
                                }}
                              >
                                {getInsightIcon(msg.type)}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: getInsightColor(msg.type),
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {msg.type.toUpperCase()}
                                </Typography>
                                <Box sx={{ flex: 1 }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.5)",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {msg.timestamp}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#ffffff",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                "& h2": {
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: msg.isInsight
                                    ? getInsightColor(msg.type)
                                    : "#8193ff",
                                  mb: 1,
                                  mt: 0,
                                },
                                "& strong": {
                                  color: msg.isInsight
                                    ? getInsightColor(msg.type)
                                    : "#93c5fd",
                                  fontWeight: 600,
                                },
                                "& em": {
                                  color: "rgba(255, 255, 255, 0.7)",
                                  fontStyle: "italic",
                                },
                              }}
                              dangerouslySetInnerHTML={{
                                __html: msg.text
                                  .replace(/## (.*?)\n/g, "<h2>$1</h2>")
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>"
                                  )
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                  .replace(/\n/g, "<br/>"),
                              }}
                            />
                          </>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                ))}

                {/* Currently typing insight */}
                {displayedText && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "rgba(102, 126, 234, 0.2)",
                          mt: 0.5,
                        }}
                      >
                        <Psychology sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: "85%",
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                          borderLeft: "4px solid #667eea",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#ffffff",
                            lineHeight: 1.7,
                            whiteSpace: "pre-line",
                            "& h2": {
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#8193ff",
                              mb: 1,
                              mt: 0,
                            },
                            "& strong": {
                              color: "#93c5fd",
                              fontWeight: 600,
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: displayedText
                              .replace(/## (.*?)\n/g, "<h2>$1</h2>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br/>"),
                          }}
                        />
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 16,
                            ml: 0.5,
                            bgcolor: "#8193ff",
                            animation: "blink 1s infinite",
                            "@keyframes blink": {
                              "0%, 100%": { opacity: 1 },
                              "50%": { opacity: 0 },
                            },
                          }}
                        />
                      </Paper>
                    </Box>
                  </Box>
                )}

                {/* Insights Summary */}
                {insightsStats.completed === insightsStats.total &&
                  insightsStats.total > 0 && (
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      sx={{
                        mt: 2,
                        p: 2,
                        background: "rgba(30, 41, 59, 0.5)",
                        borderRadius: 2,
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#ffffff",
                          fontWeight: 600,
                          mb: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircle sx={{ color: "#10B981", fontSize: 18 }} />
                        Analysis Complete
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "#EF4444",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                          >
                            {insightsStats.critical} Critical
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "#F59E0B",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                          >
                            {insightsStats.warnings} Warnings
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "#8B5CF6",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                          >
                            {insightsStats.opportunities} Opportunities
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          mt: 1.5,
                          display: "block",
                        }}
                      >
                        {insightsStats.critical > 0
                          ? "⚠️ Address critical issues immediately for business continuity."
                          : insightsStats.warnings > 0
                          ? "📈 Focus on warnings to optimize performance."
                          : "🎉 Great job! Focus on opportunities for growth."}
                      </Typography>
                    </Box>
                  )}

                <div ref={chatEndRef} />
              </Box>

              {/* Footer Status */}
              <Box
                sx={{
                  p: 1.5,
                  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                  background: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {isThinking ? (
                      <>
                        <CircularProgress size={12} thickness={5} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#8193ff",
                              animation: "pulse 1s infinite",
                            }}
                          />
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#8193ff",
                              animation: "pulse 1s infinite 0.2s",
                            }}
                          />
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#8193ff",
                              animation: "pulse 1s infinite 0.4s",
                            }}
                          />
                        </Box>
                        Analyzing data patterns...
                      </>
                    ) : isTyping ? (
                      <>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: "#8193ff",
                            animation: "pulse 1s infinite",
                          }}
                        />
                        Generating insight {currentInsightIndex + 1}...
                      </>
                    ) : insightsStats.completed === insightsStats.total ? (
                      <>
                        <CheckCircle sx={{ fontSize: 12, color: "#10B981" }} />
                        All insights generated
                      </>
                    ) : (
                      <>
                        <AutoAwesome sx={{ fontSize: 12, color: "#8193ff" }} />
                        Ready for analysis
                      </>
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontFamily: "monospace",
                    }}
                  >
                    AI v2.1
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
