// WebSocket hook for real-time dashboard updates

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

export function useSocket(serverUrl: string = 'http://localhost:5050'): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    try {
      const socketInstance = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      socketRef.current = socketInstance;

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setError(null);
        
        // Join dashboard updates room
        socketInstance.emit('join-dashboard', 'dashboard-user');
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(err.message);
        setConnected(false);
      });

      socketInstance.on('error', (err) => {
        console.error('Socket error:', err);
        setError(err.message);
      });

      // Dashboard-specific events
      socketInstance.on('data_updated', (data) => {
        console.log('Dashboard data updated:', data);
        window.dispatchEvent(new CustomEvent('dashboard-update', { detail: data }));
      });

      socketInstance.on('stream-update', (data) => {
        console.log('Stream update received:', data);
        
        // Route stream updates to specific event types
        switch (data.topic) {
          case 'budget-updates':
            window.dispatchEvent(new CustomEvent('budget-update', { detail: data.data }));
            break;
          case 'project-updates':
            window.dispatchEvent(new CustomEvent('project-update', { detail: data.data }));
            break;
          case 'compliance-alerts':
            window.dispatchEvent(new CustomEvent('compliance-update', { detail: data.data }));
            break;
          case 'risk-events':
            window.dispatchEvent(new CustomEvent('risk-update', { detail: data.data }));
            break;
          case 'transaction-stream':
            window.dispatchEvent(new CustomEvent('activity-update', { detail: data.data }));
            break;
          default:
            window.dispatchEvent(new CustomEvent('dashboard-update', { detail: data }));
        }
      });

      socketInstance.on('budget-update', (data) => {
        console.log('Budget update received:', data);
        window.dispatchEvent(new CustomEvent('budget-update', { detail: data }));
      });

      socketInstance.on('project-update', (data) => {
        console.log('Project update received:', data);
        window.dispatchEvent(new CustomEvent('project-update', { detail: data }));
      });

      socketInstance.on('activity-update', (data) => {
        console.log('Activity update received:', data);
        window.dispatchEvent(new CustomEvent('activity-update', { detail: data }));
      });

      socketInstance.on('compliance-update', (data) => {
        console.log('Compliance update received:', data);
        window.dispatchEvent(new CustomEvent('compliance-update', { detail: data }));
      });

      socketInstance.on('risk-update', (data) => {
        console.log('Risk update received:', data);
        window.dispatchEvent(new CustomEvent('risk-update', { detail: data }));
      });

      socketInstance.on('immediate-alert', (data) => {
        console.log('Immediate alert received:', data);
        window.dispatchEvent(new CustomEvent('immediate-alert', { detail: data }));
      });

    } catch (err) {
      console.error('Failed to initialize socket:', err);
      setError(err instanceof Error ? err.message : 'Socket initialization failed');
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl]);

  return {
    socket: socketRef.current,
    connected,
    error,
  };
}

// Hook for listening to specific dashboard events
export function useDashboardEvents(eventType: string, callback: (data: any) => void) {
  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(eventType, handleEvent as EventListener);

    return () => {
      window.removeEventListener(eventType, handleEvent as EventListener);
    };
  }, [eventType, callback]);
}
