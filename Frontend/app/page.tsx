"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

type ChatMessage = {
  user: string;
  ai: string;
};

export default function Home() {

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("General Chat");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = message;

    setMessage("");
    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: `[${mode}] ${userMessage}`,
          session_id: sessionId || null,
        }
      );

      if (!sessionId) {
        setSessionId(response.data.session_id);
      }

      setChat((prev) => [
        ...prev,
        {
          user: userMessage,
          ai: response.data.ai_reply,
        },
      ]);

    } catch (error) {

      console.log(error);

      alert("Backend server error");

    } finally {

      setLoading(false);

    }
  };

  return (
    <main className="flex h-screen bg-black text-white overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-72 border-r border-gray-800 bg-[#111] flex-col p-5">

        <h1 className="text-4xl font-bold text-green-400">
          Zentro
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          IELTS + Spoken English Practice
        </p>

        <button
          onClick={() => {
            setChat([]);
            setSessionId("");
          }}
          className="mt-6 bg-green-600 hover:bg-green-700 transition p-4 rounded-2xl font-semibold"
        >
          + New Chat
        </button>

        <div className="mt-8 space-y-3">

          <button
            onClick={() => setMode("IELTS Practice")}
            className="bg-[#1c1c1c] hover:bg-[#2a2a2a] transition p-4 rounded-xl text-left"
          >
            IELTS Practice
          </button>

          <button
            onClick={() => setMode("Grammar Correction")}
            className="bg-[#1c1c1c] hover:bg-[#2a2a2a] transition p-4 rounded-xl text-left"
          >
            Grammar Correction
          </button>

          <button
            onClick={() => setMode("Daily Speaking")}
            className="bg-[#1c1c1c] hover:bg-[#2a2a2a] transition p-4 rounded-xl text-left"
          >
            Daily Speaking
          </button>

        </div>

        <div className="mt-auto text-xs text-gray-500">
          Powered by FastAPI + Ollama
        </div>

      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="border-b border-gray-800 p-5">

          <h2 className="text-3xl font-bold">
            Zentro
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Learn Beyond Limits
          </p>

          <p className="text-green-400 mt-2 text-sm">
            Current Mode: {mode}
          </p>

        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {chat.length === 0 && (

            <div className="h-full flex items-center justify-center">

              <div className="text-center max-w-xl">

                <h2 className="text-5xl font-bold text-green-400">
                  Welcome
                </h2>

                <p className="text-gray-400 mt-6 text-lg leading-relaxed">
                  Practice spoken English, grammar,
                  fluency and IELTS speaking with your AI tutor.
                </p>

              </div>

            </div>

          )}

          {chat.map((item, index) => (

            <div key={index} className="space-y-3">

              {/* User Message */}
              <div className="flex justify-end">

                <div className="bg-green-600 px-5 py-4 rounded-3xl rounded-br-md max-w-[80%] shadow-lg">
                  {item.user}
                </div>

              </div>

              {/* AI Message */}
              <div className="flex justify-start">

                <div className="bg-[#1c1c1c] border border-gray-800 px-5 py-4 rounded-3xl rounded-bl-md max-w-[80%] whitespace-pre-wrap shadow-lg">
                  {item.ai}
                </div>

              </div>

            </div>

          ))}

          {loading && (

            <div className="flex justify-start">

              <div className="bg-[#1c1c1c] border border-gray-800 px-5 py-4 rounded-3xl rounded-bl-md animate-pulse">
                AI is typing...
              </div>

            </div>

          )}

          <div ref={chatEndRef} />

        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-5 bg-[#111]">

          <div className="flex gap-3">

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type your English message..."
              className="flex-1 bg-[#1c1c1c] border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 transition px-8 rounded-2xl font-semibold disabled:opacity-50"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}