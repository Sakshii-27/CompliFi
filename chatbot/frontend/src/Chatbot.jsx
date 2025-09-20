import React, { useEffect, useRef, useState } from 'react'
import './Chatbot.css'

// Function to format message text with proper HTML structure
const formatMessageText = (text) => {
  if (!text) return ''
  
  let formatted = text
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert numbered lists (1. 2. 3.) to proper HTML
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin: 12px 0;"><span class="step-number">$1</span>$2</div>')
    // Convert bullet points (* or -) to HTML lists
    .replace(/^[*-]\s+(.+)$/gm, '<li>$1</li>')
    // Convert double line breaks to paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Convert single line breaks to <br>
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags
    .replace(/^(.+)/, '<p>$1')
    .replace(/(.+)$/, '$1</p>')
    // Fix list items (wrap consecutive <li> in <ul>)
    .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
      return '<ul>' + match + '</ul>'
    })
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
  
  return formatted
}

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat history from localStorage (shared with Next.js dashboard icon)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('complifi-chat-history')
      if (raw) {
        const parsed = JSON.parse(raw)
        // Map flexible schema into this app's schema
        const mapped = (Array.isArray(parsed) ? parsed : []).map((m) => {
          if (m && typeof m === 'object') {
            if ('text' in m && 'sender' in m) {
              // Already in frontend schema
              return m
            }
            // Convert from icon schema { id, message, isUser, timestamp }
            return {
              id: m.id ?? Date.now(),
              text: m.message ?? '',
              sender: m.isUser ? 'user' : 'bot',
              timestamp: m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          }
          return null
        }).filter(Boolean)
        if (mapped.length) setMessages(mapped)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Persist chat history to localStorage in a shared, icon-compatible format
  useEffect(() => {
    try {
      const iconCompatible = messages.map((m) => ({
        id: m.id,
        message: m.text,
        isUser: m.sender === 'user',
        // Save an absolute timestamp for recency checks
        timestamp: Date.now()
      }))
      localStorage.setItem('complifi-chat-history', JSON.stringify(iconCompatible))
    } catch (e) {
      // ignore
    }
  }, [messages])

  // Send message to the API
  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      })

      const data = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || data.error || 'Sorry, I encountered an error.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I could not connect to the server. Please make sure the API is running on http://localhost:8000',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>CompliFi AI Assistant</h2>
          <div style={styles.status}>
            <div style={styles.statusDot}></div>
            <span>Online</span>
          </div>
        </div>

        <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={styles.welcomeMessage}>
            <p>🚀 Welcome to CompliFi Intelligence</p>
            <p>I'm your AI compliance assistant, ready to help with:</p>
            <p>• Document analysis & regulatory guidance</p>
            <p>• Amendment interpretations & next steps</p>
            <p>• Compliance workflow suggestions</p>
            <p>Ask me anything about your compliance journey!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.messageWrapper,
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                ...(message.sender === 'user' ? styles.userBubble : styles.botBubble),
              }}
            >
              <div 
                className="message-content" 
                style={styles.messageText}
                dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
              />
              <span style={styles.timestamp}>{message.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={styles.messageWrapper}>
            <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
              <span className="typing-indicator">🤖 Analyzing compliance data...</span>
            </div>
          </div>
        )}

          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            style={styles.input}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            style={{
              ...styles.sendButton,
              ...(isLoading || !inputMessage.trim() ? styles.sendButtonDisabled : {}),
            }}
            aria-label="Send"
            title="Send"
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    zIndex: 10,
    borderRadius: '15px',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    boxShadow: '0 0 50px rgba(0, 255, 136, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#00ff88',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 20px rgba(0, 255, 136, 0.3)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    gap: '8px',
    color: '#00ff88',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00ff88',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
    animation: 'pulse 2s infinite',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: 'transparent',
    background: 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.03) 0%, transparent 70%)',
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#00ff88',
    margin: '60px 0',
    fontSize: '18px',
    lineHeight: '1.6',
    textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '16px',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '20px',
    wordWrap: 'break-word',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
  },
  userBubble: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    marginLeft: 'auto',
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    margin: '0 0 6px 0',
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: '11px',
    color: 'rgba(0, 255, 136, 0.7)',
    float: 'right',
    marginTop: '4px',
  },
  inputContainer: {
    display: 'flex',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    gap: '12px',
    alignItems: 'flex-end',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '25px',
    fontSize: '15px',
    outline: 'none',
    resize: 'none',
    minHeight: '20px',
    maxHeight: '100px',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  sendButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    color: '#00ff88',
    border: '1px solid rgba(0, 255, 136, 0.5)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    color: '#666',
    cursor: 'not-allowed',
    border: '1px solid rgba(100, 100, 100, 0.3)',
    boxShadow: 'none',
  },
}
