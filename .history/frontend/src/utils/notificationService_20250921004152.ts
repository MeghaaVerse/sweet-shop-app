import { useNotifications } from '../hooks/useNotifications';

// This service generates realistic notifications based on app activity
export class NotificationService {
  private static instance: NotificationService;
  private addNotification: any;
  private intervals: number[]= [];

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(addNotification: any) {
    this.addNotification = addNotification;
    this.startRealTimeNotifications();
  }

  private startRealTimeNotifications() {
    // // Simulate stock alerts every 30 seconds
    // const stockAlertInterval = setInterval(() => {
    //   if (Math.random() > 0.7) { // 30% chance
    //     this.generateStockAlert();
    //   }
    // }, 30000);

    // // Simulate sales notifications every 45 seconds
    // const salesInterval = setInterval(() => {
    //   if (Math.random() > 0.6) { // 40% chance
    //     this.generateSaleNotification();
    //   }
    // }, 45000);

    // // Simulate system notifications every 2 minutes
    // const systemInterval = setInterval(() => {
    //   if (Math.random() > 0.8) { // 20% chance
    //     this.generateSystemNotification();
    //   }
    // }, 120000);

    // this.intervals.push(stockAlertInterval, salesInterval, systemInterval);
    console.log('Notification service initialized - manual notifications only');
  }




  // Manual notification triggers
  onSweetAdded(sweetName: string) {
    this.addNotification({
      title: '✅ Sweet Added',
      message: `${sweetName} has been successfully added to your inventory.`,
      type: 'success',
    });
  }

  onInventoryUpdated(sweetName: string, action: string, quantity: number) {
    const emoji = action === 'RESTOCK' ? '📦' : action === 'SALE' ? '💰' : '⚠️';
    this.addNotification({
      title: `${emoji} Inventory Updated`,
      message: `${sweetName}: ${action.toLowerCase()} of ${quantity} units recorded.`,
      type: action === 'RESTOCK' ? 'success' : 'info',
    });
  }

  onLowStock(sweetName: string, stock: number) {
    this.addNotification({
      title: '🚨 Critical Stock Level',
      message: `${sweetName} has only ${stock} units left!`,
      type: 'error',
      action: {
        label: 'Restock Immediately',
        onClick: () => window.location.href = '/inventory'
      }
    });
  }

  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
}

// Hook to use the notification service
// Hook to use the notification service  
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  
  const onSweetAdded = (sweetName: string) => {
    addNotification({
      title: 'Sweet Added Successfully',
      message: `${sweetName} has been added to your inventory.`,
      type: 'success',
    });
  };

  const onInventoryUpdated = (sweetName: string, action: string, quantity: number) => {
    const emoji = action === 'RESTOCK' ? '📦' : action === 'SALE' ? '💰' : '⚠️';
    addNotification({
      title: `${emoji} Inventory Updated`,
      message: `${sweetName}: ${action.toLowerCase()} of ${quantity} units recorded.`,
      type: action === 'RESTOCK' ? 'success' : 'info',
    });
  };

  const onLowStock = (sweetName: string, stock: number) => {
    addNotification({
      title: '🚨 Critical Stock Level',
      message: `${sweetName} has only ${stock} units left!`,
      type: 'error',
      action: {
        label: 'Restock Now',
        onClick: () => window.location.href = '/inventory'
      }
    });
  };

  return {
    onSweetAdded,
    onInventoryUpdated,
    onLowStock,
  };
};