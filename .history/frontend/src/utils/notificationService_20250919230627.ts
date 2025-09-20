import { useNotifications } from '../hooks/useNotifications';

// This service generates realistic notifications based on app activity
export class NotificationService {
  private static instance: NotificationService;
  private addNotification: any;
  private intervals: NodeJS.Timeout[] = [];

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
    // Simulate stock alerts every 30 seconds
    const stockAlertInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        this.generateStockAlert();
      }
    }, 30000);

    // Simulate sales notifications every 45 seconds
    const salesInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance
        this.generateSaleNotification();
      }
    }, 45000);

    // Simulate system notifications every 2 minutes
    const systemInterval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        this.generateSystemNotification();
      }
    }, 120000);

    this.intervals.push(stockAlertInterval, salesInterval, systemInterval);
  }

  private generateStockAlert() {
    const sweetNames = ['Chocolate Cake', 'Vanilla Cupcake', 'Strawberry Tart', 'Caramel Cookies', 'Fruit Gummies'];
    const sweetName = sweetNames[Math.floor(Math.random() * sweetNames.length)];
    const stock = Math.floor(Math.random() * 5) + 1;

    this.addNotification({
      title: '⚠️ Low Stock Alert',
      message: `${sweetName} is running low with only ${stock} units remaining.`,
      type: 'warning',
      action: {
        label: 'Restock Now',
        onClick: () => window.location.href = '/inventory'
      }
    });
  }

  private generateSaleNotification() {
    const customers = ['John D.', 'Sarah M.', 'Mike R.', 'Emily W.', 'David L.'];
    const amounts = [25.50, 42.75, 18.25, 67.90, 33.40];
    
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    this.addNotification({
      title: '💰 New Sale!',
      message: `${customer} just made a purchase of $${amount.toFixed(2)}`,
      type: 'success',
      action: {
        label: 'View Details',
        onClick: () => window.location.href = '/analytics'
      }
    });
  }

  private generateSystemNotification() {
    const notifications = [
      {
        title: '📊 Weekly Report Ready',
        message: 'Your weekly sales and inventory report is ready for review.',
        type: 'info' as const,
        action: {
          label: 'View Report',
          onClick: () => window.location.href = '/analytics'
        }
      },
      {
        title: '🎯 Goal Achieved!',
        message: 'Congratulations! You\'ve reached 100 sales this month.',
        type: 'success' as const,
      },
      {
        title: '🔔 Reminder',
        message: 'Don\'t forget to update your inventory before the weekend rush.',
        type: 'info' as const,
      }
    ];

    const notification = notifications[Math.floor(Math.random() * notifications.length)];
    this.addNotification(notification);
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
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  
  return {
    onSweetAdded: (sweetName: string) => NotificationService.getInstance().onSweetAdded(sweetName),
    onInventoryUpdated: (sweetName: string, action: string, quantity: number) => 
      NotificationService.getInstance().onInventoryUpdated(sweetName, action, quantity),
    onLowStock: (sweetName: string, stock: number) => 
      NotificationService.getInstance().onLowStock(sweetName, stock),
  };
};