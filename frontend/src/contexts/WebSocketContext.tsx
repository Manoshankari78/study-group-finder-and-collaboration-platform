import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (groupId: number, content: string, type?: string, fileUrl?: string, fileName?: string) => void;
  subscribeToGroup: (groupId: number, callback: (message: any) => void) => void;
  unsubscribeFromGroup: (groupId: number) => void;
  sendTypingIndicator: (groupId: number, isTyping: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    if (!token) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      client.deactivate();
    };
  }, [token]);

  const sendMessage = (groupId: number, content: string, type = 'TEXT', fileUrl?: string, fileName?: string) => {
  if (clientRef.current && isConnected) {
    clientRef.current.publish({
      destination: `/app/chat.send/${groupId}`,
      body: JSON.stringify({ content, type, fileUrl, fileName })
    });
  }
};


  const subscribeToGroup = (groupId: number, callback: (message: any) => void) => {
    if (clientRef.current && isConnected) {
      const subscription = clientRef.current.subscribe(
        `/topic/group/${groupId}`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        }
      );
      subscriptionsRef.current.set(groupId, subscription);
    }
  };

  const unsubscribeFromGroup = (groupId: number) => {
    const subscription = subscriptionsRef.current.get(groupId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(groupId);
    }
  };

  const sendTypingIndicator = (groupId: number, isTyping: boolean) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({
        destination: `/app/chat.typing/${groupId}`,
        body: JSON.stringify({ isTyping })
      });
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        subscribeToGroup,
        unsubscribeFromGroup,
        sendTypingIndicator
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};