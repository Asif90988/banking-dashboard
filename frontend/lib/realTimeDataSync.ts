import { io, Socket } from 'socket.io-client';

export interface DataUpdateEvent {
  type: 'ai_integration' | 'budget' | 'projects' | 'compliance' | 'risk';
  payload: any;
  timestamp: Date;
}

export interface AIIntegrationResult {
  success: boolean;
  message: string;
  affectedRecords: number;
  processingTime: number;
  timestamp: Date;
}

export class RealTimeDataSync {
  private socket: Socket | null = null;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  // Connect to WebSocket server
  private connect() {
    try {
      this.socket = io('http://192.168.4.25:5050', {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('🔗 Real-time data sync connected');
        this.isConnected = true;
        this.socket?.emit('join-dashboard', 'alex-rodriguez');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Real-time data sync disconnected');
        this.isConnected = false;
      });

      this.socket.on('data_updated', (event: DataUpdateEvent) => {
        console.log('📊 Data update received:', event);
        this.notifySubscribers(event.type, event.payload);
        
        // Show notification for AI integration results
        if (event.type === 'ai_integration') {
          this.showDataUpdateNotification(event.payload);
        }
      });

      this.socket.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect to real-time sync:', error);
    }
  }

  // Subscribe to data updates
  subscribe(dataType: string, callback: (data: any) => void) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify subscribers of data updates
  private notifySubscribers(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }

    // Also notify 'all' subscribers
    const allCallbacks = this.subscribers.get('all');
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback({ type: dataType, data });
        } catch (error) {
          console.error('Error in all subscriber callback:', error);
        }
      });
    }
  }

  // Show notification for data updates
  private showDataUpdateNotification(result: AIIntegrationResult) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(
          result.success ? '✅ Data Updated Successfully' : '❌ Data Update Failed',
          {
            body: result.message,
            icon: '/favicon.ico',
            tag: 'data-update',
          }
        );

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }
    }

    // Also show in-app notification (you can customize this)
    this.showInAppNotification(result);
  }

  // Show in-app notification
  private showInAppNotification(result: AIIntegrationResult) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm
      ${result.success 
        ? 'bg-green-600 border-green-500' 
        : 'bg-red-600 border-red-500'
      } 
      border text-white transform transition-all duration-300 ease-in-out
    `;
    
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          ${result.success 
            ? '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            : '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-sm">
            ${result.success ? 'Data Updated' : 'Update Failed'}
          </h4>
          <p class="text-sm opacity-90 mt-1">${result.message}</p>
          ${result.success ? `
            <p class="text-xs opacity-75 mt-1">
              ${result.affectedRecords} records processed in ${result.processingTime}ms
            </p>
          ` : ''}
        </div>
        <button class="flex-shrink-0 ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // Request data integration
  async requestDataIntegration(message: string): Promise<AIIntegrationResult> {
    try {
      const response = await fetch('http://192.168.4.25:5050/api/ai/process-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Data integration request failed:', error);
      return {
        success: false,
        message: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRecords: 0,
        processingTime: 0,
        timestamp: new Date(),
      };
    }
  }

  // Get available data sources
  async getDataSources() {
    try {
      const response = await fetch('http://192.168.4.25:5050/api/ai/data-sources');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get data sources:', error);
      return { success: false, dataSources: [] };
    }
  }

  // Trigger manual refresh for specific data type
  triggerRefresh(dataType: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_data_refresh', { dataType });
    }
  }

  // Check connection status
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Reconnect
  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }
}

// Export singleton instance
export const realTimeDataSync = new RealTimeDataSync();
