import React, { useRef, useState } from "react";
type Msg = { role: "user" | "assistant"; content: string };
export default function Home() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Welcome to Althea — a quiet space to check in with yourself. What's on your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(history);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgs(h => [...h, { role: "assistant", content: `Error: ${JSON.stringify(data.error)}` }]);
      } else {
        setMsgs(h => [...h, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMsgs(h => [...h, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setSending(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }
  return (
    <div style={{
      background: "radial-gradient(circle at top, #2d1458 0, #050008 55%, #000 100%)",
      color: "#e5e0ff",
      minHeight: "100vh",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      fontFamily: "system-ui, sans-serif"
    }}>
      <header style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(177,138,230,0.25)",
        background: "linear-gradient(to right, rgba(5,0,16,0.9), rgba(18,5,39,0.9))",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#f4e8ff" }}>Welcome to Althea</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#b8a8e8" }}>
            A gentle space for reflection. Not a substitute for professional care.
          </p>
        </div>
      </header>
      <div style={{ padding: "16px 24px 0", overflowY: "auto" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 24px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ margin: "12px 0", display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px",
                borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: m.role === "user" ? "#b18ae6" : "rgba(13,4,33,0.95)",
                color: m.role === "user" ? "#14071f" : "#f3ebff",
                boxShadow: m.role === "user" ? "0 0 0 1px rgba(255,255,255,0.08)" : "0 0 0 1px rgba(126,96,198,0.35)",
                fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap"
              }}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1b102d", padding: "12px 16px 20px", background: "linear-gradient(to top, rgba(5,0,16,0.95), rgba(5,0,16,0.85))" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Share a thought, a worry, or something you're grateful for…"
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 999,
              background: "#0b0618", border: "1px solid #332153",
              color: "#f5f1ff", fontSize: 14, outline: "none"
            }}
          />
          <button onClick={send} disabled={sending} style={{
            background: sending ? "rgba(177,138,230,0.5)" : "linear-gradient(135deg, #d3b4ff, #b18ae6)",
            color: "#1b0b30", fontWeight: 600, fontSize: 14,
            padding: "12px 18px", border: "none", borderRadius: 999,
            cursor: sending ? "default" : "pointer", minWidth: 80
          }}>
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
