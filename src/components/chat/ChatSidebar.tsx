"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  getChatMessages, 
  clearChatHistory, 
  truncateChatHistory,
  getChatSessions,
  createChatSession,
  deleteChatSession
} from "@/lib/actions/chat";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
}

export default function ChatSidebar({
  isOpen,
  setIsOpen,
  width,
  setWidth,
  isResizing,
  setIsResizing
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<{id?: string, role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  
  // Agentic progress states
  const [agenticStatus, setAgenticStatus] = useState<string>("");
  const [toolCallDetails, setToolCallDetails] = useState<string>("");
  const [agenticSteps, setAgenticSteps] = useState<{status: string, tool?: string, args?: string}[]>([]);
  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  
  // Session tracking states
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize search input
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 48), 160)}px`;
    }
  }, [input]);

  // Load chat sessions on mount
  const loadSessions = async () => {
    const sess = await getChatSessions();
    setSessions(sess);
    if (sess.length > 0) {
      setCurrentSessionId(sess[0].id);
      const msgs = await getChatMessages(sess[0].id);
      setMessages(msgs);
    } else {
      const defaultSess = await createChatSession("Initial Chat");
      setSessions([defaultSess]);
      setCurrentSessionId(defaultSess.id);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Resize handling
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const doResize = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < 800) {
        setWidth(newWidth);
      }
    };
    
    const stopResize = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", doResize);
      window.addEventListener("mouseup", stopResize);
    }
    return () => {
      window.removeEventListener("mousemove", doResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing, setWidth, setIsResizing]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEdit = (text: string, index: number) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const sendMessageToAPI = async (userMsg: string) => {
    setLoading(true);
    setAgenticStatus("Starting Agent...");
    setToolCallDetails("");
    setAgenticSteps([]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId: currentSessionId })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === "status") {
                setAgenticStatus(data.status);
                
                const argsStr = data.args ? JSON.stringify(data.args, null, 2) : undefined;
                setAgenticSteps(prev => {
                  if (data.tool && prev.some(step => step.tool === data.tool && step.args === argsStr)) {
                    return prev;
                  }
                  return [...prev, { status: data.status, tool: data.tool, args: argsStr }];
                });

                if (data.tool) {
                  setToolCallDetails(`tool: ${data.tool}${argsStr ? `\nargs: ${argsStr}` : ""}`);
                } else {
                  setToolCallDetails("");
                }
              } else if (data.type === "error") {
                console.error("Agent error: ", data.error);
                setAgenticStatus(`Error: ${data.error}`);
              }
            } catch (e) {
              console.error("Failed to parse stream line: ", line, e);
            }
          }
        }
      }
    } catch (e: any) {
      console.error("API Error: ", e.message);
      setAgenticStatus(`Error: ${e.message}`);
    } finally {
      const msgs = await getChatMessages(currentSessionId);
      setMessages(msgs);
      setLoading(false);
      setAgenticStatus("");
      setToolCallDetails("");
      setAgenticSteps([]);
      
      // Refresh session titles (e.g. if auto-named)
      const sess = await getChatSessions();
      setSessions(sess);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    await sendMessageToAPI(userMsg);
  };

  const handleEditSubmit = async (index: number, msgId?: string) => {
    if (!editText.trim()) return;
    const finalEditText = editText.trim();
    setEditingIndex(null);
    setEditText("");

    if (msgId) {
      await truncateChatHistory(msgId, currentSessionId);
    }
    
    const updated = messages.slice(0, index);
    setMessages([...updated, { role: "user", content: finalEditText }]);
    await sendMessageToAPI(finalEditText);
  };

  const handleRetry = async (index: number, msgId?: string) => {
    const targetMsg = messages[index];
    if (!targetMsg) return;

    if (msgId) {
      await truncateChatHistory(msgId, currentSessionId);
    }

    const updated = messages.slice(0, index);
    setMessages([...updated, { role: "user", content: targetMsg.content }]);
    await sendMessageToAPI(targetMsg.content);
  };

  const handleClear = async () => {
    if (currentSessionId) {
      await clearChatHistory(currentSessionId);
      setMessages([]);
    }
  };

  // Sessions actions
  const handleSwitchSession = async (sessId: string) => {
    setCurrentSessionId(sessId);
    const msgs = await getChatMessages(sessId);
    setMessages(msgs);
    setShowHistory(false);
  };

  const handleCreateNewSession = async () => {
    const newSess = await createChatSession("New Chat");
    setSessions(prev => [newSess, ...prev]);
    setCurrentSessionId(newSess.id);
    setMessages([]);
    setShowHistory(false);
  };

  const handleDeleteSession = async (sessId: string) => {
    await deleteChatSession(sessId);
    const remaining = sessions.filter(s => s.id !== sessId);
    setSessions(remaining);
    
    if (currentSessionId === sessId) {
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
        const msgs = await getChatMessages(remaining[0].id);
        setMessages(msgs);
      } else {
        const defaultSess = await createChatSession("Initial Chat");
        setSessions([defaultSess]);
        setCurrentSessionId(defaultSess.id);
        setMessages([]);
      }
    }
  };

  // Export to markdown file
  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    
    const session = sessions.find(s => s.id === currentSessionId);
    const title = session ? session.title : "Agent Chat";
    
    let md = `# Sprint OS Agent Chat - ${title}\n`;
    md += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    
    messages.forEach(msg => {
      let displayContent = msg.content;
      let parsedSteps: { status: string; tool?: string; args?: string }[] = [];
      const prefixStart = "<!--STEPS_JSON:";
      const prefixEnd = ".STEPS_JSON_END-->";
      
      if (msg.content.startsWith(prefixStart)) {
        const endIndex = msg.content.indexOf(prefixEnd);
        if (endIndex !== -1) {
          const jsonStr = msg.content.substring(prefixStart.length, endIndex);
          try {
            parsedSteps = JSON.parse(jsonStr);
          } catch (e) {}
          displayContent = msg.content.substring(endIndex + prefixEnd.length);
        }
      }

      if (msg.role === "user") {
        md += `### 👤 User\n\n${displayContent}\n\n`;
      } else {
        md += `### 🤖 Agent\n\n`;
        if (parsedSteps.length > 0) {
          md += `#### Actions Performed:\n`;
          parsedSteps.forEach(step => {
            md += `- **${step.status}**\n`;
            if (step.args) {
              const argString = typeof step.args === "object" ? JSON.stringify(step.args, null, 2) : step.args;
              md += `  \`\`\`json\n${argString}\n  \`\`\`\n`;
            }
          });
          md += `\n`;
        }
        md += `${displayContent}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        style={{ width: `${width}px` }}
        className={`fixed top-0 right-0 h-full max-w-[100vw] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Resize Handle */}
        {isOpen && (
          <div
            onMouseDown={startResize}
            className="absolute top-0 left-0 w-2 h-full cursor-col-resize hover:bg-brand-500/20 transition-colors z-50 flex items-center justify-center group"
          >
            <div className="w-[1.5px] h-8 bg-gray-300 dark:bg-gray-700 group-hover:bg-brand-500 transition-colors rounded" />
          </div>
        )}

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 select-none">
          <div className="flex items-center gap-2 max-w-[50%]">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition ${showHistory ? 'text-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'text-gray-500'}`}
              title="View History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={sessions.find(s => s.id === currentSessionId)?.title || "Sprint OS Agent"}>
              {sessions.find(s => s.id === currentSessionId)?.title || "Sprint OS Agent"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleCreateNewSession} 
              className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-850 transition rounded-lg"
              title="New Chat Session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {messages.length > 0 && (
              <button 
                onClick={handleExportMarkdown} 
                className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-850 transition rounded-lg"
                title="Export Chat as Markdown"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            <button onClick={handleClear} className="text-xs font-semibold text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-850 px-2 py-1.5 rounded-lg transition">
              Clear
            </button>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* History / Sessions Panel Overlay */}
        {showHistory && (
          <div className="absolute top-[57px] left-0 w-full h-[calc(100%-57px)] bg-white dark:bg-gray-900 z-30 flex flex-col p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversations</h3>
              <button
                onClick={handleCreateNewSession}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-sm hover:shadow transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center mt-6">No previous chats yet.</p>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`group/session flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer border ${
                      currentSessionId === sess.id
                        ? "bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold border-brand-100/50 dark:border-brand-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-850/60 text-gray-700 dark:text-gray-300 border-transparent"
                    }`}
                    onClick={() => handleSwitchSession(sess.id)}
                  >
                    <span className="truncate flex-1 pr-2">{sess.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(sess.id);
                      }}
                      className="opacity-0 group-hover/session:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition rounded-lg"
                      title="Delete chat session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <p>Hello! I have full access to your Active Sprint and Codex.</p>
              <p className="mt-2 text-sm">Ask me anything!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              // Parse steps if any
              let displayContent = msg.content;
              let parsedSteps: { status: string; tool?: string; args?: string }[] = [];

              const prefixStart = "<!--STEPS_JSON:";
              const prefixEnd = ".STEPS_JSON_END-->";
              if (msg.content.startsWith(prefixStart)) {
                const endIndex = msg.content.indexOf(prefixEnd);
                if (endIndex !== -1) {
                  const jsonStr = msg.content.substring(prefixStart.length, endIndex);
                  try {
                    parsedSteps = JSON.parse(jsonStr);
                    displayContent = msg.content.substring(endIndex + prefixEnd.length);
                  } catch (e) {
                    console.error("Failed to parse steps JSON:", e);
                  }
                }
              }

              // Completed messages are collapsed/closed by default
              const isCollapsed = collapsedSteps[i] ?? true;
              const toggleSteps = () => {
                setCollapsedSteps(prev => ({ ...prev, [i]: !prev[i] }));
              };

              return (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} w-full`}>
                  {editingIndex === i ? (
                    <div className="w-full max-w-[85%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-md flex flex-col gap-2 mt-1">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none min-h-[60px]"
                        rows={2}
                      />
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditText("");
                          }}
                          className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium rounded transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(i, msg.id)}
                          disabled={!editText.trim()}
                          className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                        >
                          Save & Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`group relative flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} w-full max-w-[85%]`}>
                      {parsedSteps.length > 0 && (
                        <div className="w-full mb-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800 overflow-hidden shadow-sm">
                          <button
                            onClick={toggleSteps}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-150 dark:border-gray-800"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Agent Actions ({parsedSteps.length})
                            </span>
                            <svg
                              className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isCollapsed ? "transform -rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {!isCollapsed && (
                            <div className="flex flex-col gap-2.5 p-3 pl-4 border-l-2 border-emerald-500/40 max-h-[200px] overflow-y-auto bg-gray-50/50 dark:bg-gray-900/20">
                              {parsedSteps.map((step, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{step.status}</span>
                                  </div>
                                  {step.args && (
                                    <pre className="text-[9px] text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-950 p-1.5 rounded border border-gray-100 dark:border-gray-800/60 overflow-x-auto whitespace-pre-wrap max-w-full">
                                      {typeof step.args === "object" ? JSON.stringify(step.args, null, 2) : step.args}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`w-full rounded-2xl px-4 py-2 ${
                        msg.role === "user" 
                          ? "bg-brand-500 text-white rounded-br-none" 
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{displayContent}</p>
                      </div>
                      
                      {msg.role === "user" && (
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleCopy(msg.content)} 
                            title="Copy text"
                            className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                          </button>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <button 
                            onClick={() => handleEdit(msg.content, i)} 
                            title="Edit text"
                            className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <button 
                            onClick={() => handleRetry(i, msg.id)} 
                            title="Resend message"
                            className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.23" />
                            </svg>
                            <span>Retry</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading status (streamed logs checklist) */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex flex-col gap-2.5 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce delay-200"></span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Sprint OS Agent is active...
                  </span>
                </div>
                
                {agenticSteps.length > 0 && (
                  <div className="flex flex-col gap-2 pl-2 border-l border-brand-500/30">
                    {agenticSteps.map((step, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{step.status}</span>
                        </div>
                        {step.args && (
                          <pre className="text-[9px] text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded border border-gray-100 dark:border-gray-800 overflow-x-auto whitespace-pre-wrap max-w-full">
                            {typeof step.args === "object" ? JSON.stringify(step.args, null, 2) : step.args}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="relative">
            <textarea 
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Agent..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none h-12 overflow-y-auto"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
