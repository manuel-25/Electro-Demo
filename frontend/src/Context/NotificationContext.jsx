import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../config'
import { AuthContext } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { authenticated } = useContext(AuthContext)
  const [pendingQuotes, setPendingQuotes] = useState(0)
  const [pendingChats, setPendingChats] = useState(0)
  const [priorityChats, setPriorityChats] = useState(0)

  const previousQuotesRef = useRef(0)
  const previousTotalRef = useRef(0)

  const isFirstQuotesLoad = useRef(true)
  const isFirstChatsLoad = useRef(true)

  const audioRef = useRef(null)

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  // 🔔 Cotizaciones
  useEffect(() => {
    if (!authenticated) {
      setPendingQuotes(0)
      return
    }

    const fetchQuotes = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/quotes/count/pending`, {
          withCredentials: true
        })
        const newCount = res.data.count

        if (!isFirstQuotesLoad.current && newCount > previousQuotesRef.current) {
          playNotificationSound()
        }

        previousQuotesRef.current = newCount
        setPendingQuotes(newCount)
        isFirstQuotesLoad.current = false
      } catch (err) {
        console.error('Error quotes', err)
      }
    }

    fetchQuotes()
    const interval = setInterval(fetchQuotes, 15000)
    return () => clearInterval(interval)
  }, [authenticated])

  // 💬 WhatsApp
  useEffect(() => {
    if (!authenticated) {
      setPendingChats(0)
      setPriorityChats(0)
      return
    }

    const fetchChats = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/conversations/count/sidebar`, {
          withCredentials: true
        })

        const pending = res.data.pending
        const priority = res.data.priority
        const total = pending + priority

        if (!isFirstChatsLoad.current && total > previousTotalRef.current) {
          playNotificationSound()
        }

        previousTotalRef.current = total
        setPendingChats(pending)
        setPriorityChats(priority)
        isFirstChatsLoad.current = false
      } catch (err) {
        console.error('Error chats', err)
      }
    }

    fetchChats()
    const interval = setInterval(fetchChats, 15000)
    return () => clearInterval(interval)
  }, [authenticated])

  return (
    <NotificationContext.Provider
      value={{
        pendingQuotes,
        pendingChats,
        priorityChats
      }}
    >
      {/* 🔊 Audio global */}
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      {children}
    </NotificationContext.Provider>
  )
}
