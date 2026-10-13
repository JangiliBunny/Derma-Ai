"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Activity, Trash2, RefreshCw, Sparkles, AlertCircle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

type Message = { id: string; role: "user" | "bot"; content: string; created_at?: string };

const STARTER_QUESTIONS = [
    "What does my screening result mean?",
    "When should I see a dermatologist?",
    "How can I manage mild acne at home?",
    "What are the warning signs of a dangerous mole?"
];

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const token = localStorage.getItem("dermai_token");
        if (!token) {
            setMessages([{
                id: "welcome",
                role: "bot",
                content: "**Direct Answer:** Hello! I am DermaAI Assistant, your AI-powered skin health information guide.\n\n**Explanation:** How can I help you understand skin conditions, AI screening results, or dermatological care today?"
            }]);
            setIsLoadingHistory(false);
            return;
        }

        try {
            const res = await fetch(getApiUrl("/api/chat/history"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setMessages(data);
                } else {
                    setMessages([{
                        id: "welcome",
                        role: "bot",
                        content: "**Direct Answer:** Hello! I am DermaAI Assistant, your AI-powered skin health information guide.\n\n**Explanation:** How can I help you understand skin conditions, AI screening results, or dermatological care today?"
                    }]);
                }
            } else {
                setMessages([{
                    id: "welcome",
                    role: "bot",
                    content: "**Direct Answer:** Hello! I am DermaAI Assistant, your AI-powered skin health information guide.\n\n**Explanation:** How can I help you understand skin conditions, AI screening results, or dermatological care today?"
                }]);
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
            setMessages([{
                id: "welcome",
                role: "bot",
                content: "**Direct Answer:** Hello! I am DermaAI Assistant, your AI-powered skin health information guide.\n\n**Explanation:** How can I help you understand skin conditions, AI screening results, or dermatological care today?"
            }]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSend = async (textToSend?: string) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        setErrorMsg(null);
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput("");
        setIsTyping(true);

        const token = localStorage.getItem("dermai_token");

        try {
            const res = await fetch(getApiUrl("/api/chat/send"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: query })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { id: data.id, role: "bot", content: data.content }]);
                setLastFailedMessage(null);
            } else {
                const errData = await res.json().catch(() => ({}));
                setErrorMsg(errData.detail || "Failed to generate AI response. Please try again.");
                setLastFailedMessage(query);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setErrorMsg("Network error communicating with DermaAI Assistant.");
            setLastFailedMessage(query);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Start a new conversation? Current chat history will be cleared.")) return;
        const token = localStorage.getItem("dermai_token");
        if (token) {
            try {
                await fetch(getApiUrl("/api/chat/history"), {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Failed to clear chat history", err);
            }
        }
        setMessages([{
            id: "welcome-" + Date.now(),
            role: "bot",
            content: "**Direct Answer:** Hello! I am DermaAI Assistant. How can I help you with your skin health or dermatological questions today?"
        }]);
        setErrorMsg(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderFormattedText = (text: string) => {
        return text.split("\n\n").map((paragraph, pIdx) => {
            const lines = paragraph.split("\n");
            return (
                <div key={pIdx} className="mb-3 last:mb-0 space-y-1">
                    {lines.map((line, lIdx) => {
                        // Bold markdown parsing
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <p key={lIdx} className="text-sm leading-relaxed">
                                {parts.map((part, i) => {
                                    if (part.startsWith("**") && part.endsWith("**")) {
                                        return <strong key={i} className="font-bold text-slate-900 block mt-1.5 first:mt-0">{part.slice(2, -2)}</strong>;
                                    }
                                    return <span key={i}>{part}</span>;
                                })}
                            </p>
                        );
                    })}
                </div>
            );
        });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto h-[82vh] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500/20 rounded-2xl border border-sky-400/30 flex items-center justify-center text-sky-400">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base flex items-center gap-2">
                                DermaAI Assistant
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    AI Health Guide
                                </span>
                            </h2>
                            <p className="text-xs text-slate-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Online &bull; Ready to help
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/appointments"
                            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                        >
                            <Calendar className="w-3.5 h-3.5 text-sky-400" /> Book Consultation
                        </Link>
                        <button
                            onClick={handleClearHistory}
                            className="p-2 text-slate-300 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-colors"
                            title="New Conversation"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                        {lastFailedMessage && (
                            <button
                                onClick={() => handleSend(lastFailedMessage)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
                            >
                                <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                        )}
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                    {isLoadingHistory ? (
                        <div className="flex justify-center items-center h-full text-slate-400 text-sm gap-2">
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0284c7] rounded-full animate-spin"></div>
                            Loading conversation history...
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`flex max-w-[85%] sm:max-w-[78%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-900 ml-3 text-white" : "bg-[#0284c7] mr-3 text-white shadow-sm"}`}>
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                    </div>

                                    <div
                                        className={`p-4 rounded-2xl ${msg.role === "user"
                                            ? "bg-slate-900 text-white rounded-tr-sm shadow-md"
                                            : "bg-white border border-gray-100 shadow-sm text-slate-800 rounded-tl-sm"
                                        }`}
                                    >
                                        {msg.role === "user" ? (
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        ) : (
                                            renderFormattedText(msg.content)
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#0284c7] flex items-center justify-center mr-3 text-white shadow-sm">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="p-3.5 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                    <span className="text-xs text-slate-400 font-medium mr-1">DermaAI is thinking</span>
                                    <div className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 2 && (
                    <div className="px-6 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-400 flex-shrink-0">Suggested:</span>
                        {STARTER_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex-shrink-0"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative flex items-center">
                        <textarea
                            className="flex-1 resize-none py-3 pl-4 pr-12 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all text-sm h-[52px] shadow-inner"
                            placeholder="Ask anything about skin conditions, symptoms, or AI results..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-[#0284c7] text-white rounded-xl hover:bg-[#0369a1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
