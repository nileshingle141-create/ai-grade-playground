import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Suggested interactive prompts for kids
const prompts = [
  "Explain this topic simply 🧸",
  "Give me an easy example 🍎",
  "Ask me a practice question 🧠",
  "Summarize the chapter 📝",
  "Help me understand! 🤔",
];

interface AITutorChatProps {
  subject?: string;
  topic?: string;
  lessonContent?: string;
}

export function AITutorChat({ subject, topic, lessonContent }: AITutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi there! I am your AI Study Buddy! 🤖 Ask me anything about your current lesson, and I will explain it with fun examples!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(textToSend: string) {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: String(Date.now()),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate AI response
    simulateAIResponse(textToSend);
  }

  function simulateAIResponse(query: string) {
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "";
      const lowerQuery = query.toLowerCase();

      // Check if query is educational / related to the active topic
      const isAboutTopic = topic ? lowerQuery.includes(topic.toLowerCase().split(" ")[0]) : false;
      const isGeneralEdu =
        lowerQuery.includes("explain") ||
        lowerQuery.includes("example") ||
        lowerQuery.includes("question") ||
        lowerQuery.includes("summarize") ||
        lowerQuery.includes("what") ||
        lowerQuery.includes("how") ||
        lowerQuery.includes("why") ||
        lowerQuery.includes("help");

      if ((topic && lowerQuery.includes("practice")) || lowerQuery.includes("question")) {
        aiText = `Let's play a mini-game! 🧠 Here is a practice question about "${topic}":\n\nCan you explain in your own words what is the most interesting thing you learned about it? Or write down one fact you remember! Tell me, and I'll grade it! 🌟`;
      } else if (lowerQuery.includes("example")) {
        aiText = `Here is a fun example! 🍎 Imagine you are explaining "${topic || "this topic"}" to a puppy. You would say:\n\n"It is like when you have 3 juicy bones, and you get 2 more, so you have 5 bones in total!"\n\nIsn't that easy to understand? 🐶`;
      } else if (
        lowerQuery.includes("summarize") ||
        lowerQuery.includes("summary") ||
        lowerQuery.includes("chapter")
      ) {
        if (lessonContent) {
          const sentences = lessonContent.split(". ").slice(0, 3).join(". ");
          aiText = `Here is a quick summary of this chapter! 📝\n\n✨ **Key Idea**: We are exploring "${topic || "this lesson"}" under ${subject || "our subject"}.\n💡 **Important Fact**: ${sentences}.\n🚀 **Super Tip**: Review key points and try the quiz!`;
        } else {
          aiText = `Sure! The main idea is to understand the core concepts of "${topic || "this lesson"}". It teaches us how these concepts work in our daily lives!`;
        }
      } else if (
        lowerQuery.includes("simply") ||
        lowerQuery.includes("simple language") ||
        lowerQuery.includes("simply 🧸")
      ) {
        aiText = `No worries! Let's make it super simple! 🧸\n\nThink of "${topic || "this topic"}" like a giant puzzle. Every time we learn a small fact, we put a piece in. It is basically the way we see how ${subject || "things"} connect in the world! You are doing amazing!`;
      } else {
        // Fallback context-aware response
        if (topic) {
          aiText = `Great question! Let's think about "${topic}" in ${subject || "science/math"}. 💡\n\nIt is super important because it helps us understand the world around us. What specific part of this lesson can I clarify or give an example of?`;
        } else {
          aiText =
            "I am ready to help you with your lessons! Pick one of the quick prompts below or ask me any question about your homework! 🚀";
        }
      }

      const aiMsg = {
        id: String(Date.now() + 1),
        sender: "ai",
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500); // Child-friendly typing delay
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[100] lg:bottom-8 lg:right-8">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 45 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative"
              >
                <MessageSquare className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Slide-out Chat Drawer / Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-[100] w-[calc(100vw-3rem)] max-w-[400px] h-[550px] rounded-3xl border border-white/10 bg-[#0F172A]/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-black flex items-center gap-1">
                    AI Tutor Buddy{" "}
                    <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                    Always Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Lesson Badge */}
            {topic && (
              <div className="px-4 py-2 border-b border-white/5 bg-indigo-500/10 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Class Topic:
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[250px]">{topic}</span>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isAI = msg.sender === "ai";
                return (
                  <div key={msg.id} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${isAI ? "flex-row" : "flex-row-reverse"}`}
                    >
                      {isAI && (
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-indigo-400" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isAI
                            ? "bg-white/5 border border-white/10 text-white/95 rounded-tl-none"
                            : "bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-md"
                        }`}
                      >
                        <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        <span className="block text-[9px] font-bold text-white/40 mt-1.5 text-right">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="rounded-2xl px-4 py-3.5 bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggested Prompts Selector */}
            <div className="p-3 border-t border-white/5 bg-white/2 overflow-x-auto flex gap-2 no-scrollbar">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-300 transition-all duration-300 whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-3 border-t border-white/10 bg-[#0F172A] flex items-center gap-2"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about the lesson! ✏️"
                className="flex-1 rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/30 h-11"
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="h-11 w-11 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md flex items-center justify-center p-0 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
