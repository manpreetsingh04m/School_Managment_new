"use client"

import { useState, FormEvent } from "react"
import { Paperclip, Mic, CornerDownLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function StudentChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your school assistant. How can I help you today?",
      sender: "ai",
    },
    {
      id: 2,
      content: "You can ask me about your classes, assignments, grades, attendance, or any school-related questions!",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your question. Let me help you with that.",
        "That's a great question! Here's what I can tell you about that.",
        "I can help you find information about your classes and assignments.",
        "For detailed information, you might want to check your student portal or contact your teacher directly.",
        "I'm here to help! Is there anything else you'd like to know?",
        "You can find more details in your dashboard or by contacting the school administration.",
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: randomResponse,
          sender: "ai",
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleAttachFile = () => {
    // Placeholder for file attachment
    console.log("File attachment clicked")
  }

  const handleMicrophoneClick = () => {
    // Placeholder for voice input
    console.log("Microphone clicked")
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<GraduationCap className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold text-blue-900">Student Assistant 🎓</h1>
        <p className="text-sm text-gray-600">
          Ask me about your classes, grades, or school info
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                }
                fallback={message.sender === "user" ? "ST" : "AI"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                fallback="AI"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your classes, grades, or school..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5 bg-blue-950 hover:bg-blue-900">
              Send
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}
