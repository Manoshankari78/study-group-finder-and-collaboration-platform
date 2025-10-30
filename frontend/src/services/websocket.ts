import { Client, StompSubscription } from '@stomp/stompjs';

let stompClient: Client | null = null;
let currentSubscriptions: Map<number, StompSubscription> = new Map();

export const connectWebSocket = (
  onConnect: () => void,
  onError: (error: any) => void
) => {
  if (stompClient && stompClient.connected) {
    onConnect();
    return stompClient;
  }

  stompClient = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      // console.log('WebSocket connected: ' + frame);
      onConnect();
    },
    onStompError: (frame) => {
      console.error('STOMP error: ' + frame.headers['message']);
      onError(frame);
    },
    onWebSocketError: (error) => {
      console.error('WebSocket error:', error);
      onError(error);
    },
    onDisconnect: () => {
      // console.log('WebSocket disconnected');
      currentSubscriptions.clear();
    },
  });

  stompClient.activate();
  return stompClient;
};

export const subscribeToGroup = (groupId: number, onMessage: (message: any) => void): boolean => {
  if (!stompClient || !stompClient.connected) {
    console.warn('WebSocket not connected');
    return false;
  }

  // unsubscribe from existing subscription for this group if any
  if (currentSubscriptions.has(groupId)) {
    currentSubscriptions.get(groupId)?.unsubscribe();
  }

  const subscription = stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
    try {
      const parsedMessage = JSON.parse(message.body);
      onMessage(parsedMessage);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  currentSubscriptions.set(groupId, subscription);
  return true;
};

export const unsubscribeFromGroup = (groupId: number) => {
  if (currentSubscriptions.has(groupId)) {
    currentSubscriptions.get(groupId)?.unsubscribe();
    currentSubscriptions.delete(groupId);
  }
};

export const sendMessage = (groupId: number, message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/${groupId}/send`,
      body: JSON.stringify(message),
    });
    return true;
  }
  return false;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    currentSubscriptions.clear();
    stompClient.deactivate();
    stompClient = null;
  }
};

export const isWebSocketConnected = () => {
  return stompClient?.connected || false;
};