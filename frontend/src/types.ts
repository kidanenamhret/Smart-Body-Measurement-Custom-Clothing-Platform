export type UserRole = 'CUSTOMER' | 'TAILOR' | 'DELIVERY_AGENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Tailor {
  id: string | number;
  businessName: string;
  description?: string;
  profileImage?: string;
  businessAddress?: string;
  averageRating?: number;
  reviewCount?: number;
  services?: string[];
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
}

export interface ClothingCategory {
  id: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  requiredMeasurements?: string[];
  isActive?: boolean;
}

export interface MeasurementValidationResult {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: { key: string; value: any; reason: string }[];
  errors: string[];
}

export interface PriceLineItem {
  groupKey: string;
  groupName: string;
  choiceName: string;
  priceModifier: number;
}

export interface PriceCalculationResult {
  basePrice: number;
  currency: string;
  lineItems: PriceLineItem[];
  customizationModifiersTotal: number;
  totalCalculatedPrice: number;
}

export interface ClothingProduct {
  id: string | number;
  productId?: string;
  tailorId?: string;
  categoryId?: string | ClothingCategory;
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  image?: string;
  images?: string[];
  fabricOptions?: string[];
  colorOptions?: string[];
  customizationOptions?: Record<string, any>;
  requiredMeasurements?: string[];
  productionTimeDays?: number;
  productionTime?: string;
  availabilityStatus?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  createdAt?: string;
  updatedAt?: string;
}

export interface MeasurementValue {
  value: number;
  unit: string;
  source: 'MANUAL' | 'AI' | 'TAILOR' | 'IMPORTED';
  verified: boolean;
  measuredAt: string;
}

export interface MeasurementProfile {
  id: string;
  profileName: string;
  version: number;
  isCurrent: boolean;
  bodyShape?: string;
  category?: 'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM';
  categoryLabel?: string;
  source?: string;
  confidenceScore?: number;
  lastVerifiedAt?: string;
  fitPreference?: 'Slim Fit' | 'Regular Fit' | 'Relaxed Fit';
  easeAllowance?: string;
  description?: string;
  measurements: Record<string, MeasurementValue>;
}

export interface DeliveryJob {
  id: string;
  status: string;
  pickupInfo: {
    businessName: string;
    address: string;
    contactPhone: string;
  };
  deliveryInfo: {
    recipientName: string;
    address: string;
    contactPhone: string;
  };
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalCustomers: number;
  totalTailors: number;
  pendingTailorVerifications: number;
  totalDeliveryAgents: number;
  totalPlatformRevenue: number;
  openSupportTickets: number;

  // Requirement 41 Real DB Metrics
  customers: number;
  tailors: number;
  verifiedTailors: number;
  pendingVerifications: number;
  orders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  payments: {
    totalVolume: number;
    totalTransactions: number;
    successfulPayments: number;
  };
  deliveries: {
    total: number;
    active: number;
    completed: number;
  };
  supportTickets: {
    total: number;
    open: number;
    resolved: number;
  };
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAlert {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export type MeasurementSessionStatus =
  | 'CREATED'
  | 'CAPTURING'
  | 'PROCESSING'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED';

export interface MeasurementSession {
  sessionId: string;
  customerId: string;
  captureType: 'MANUAL' | 'AI';
  frontCapture?: string;
  sideCapture?: string;
  heightReference?: string;
  landmarks?: Record<string, { x: number; y: number; confidence: number }>;
  estimatedMeasurements?: Record<string, { value: number; unit: string }>;
  confidenceScores?: Record<string, number>;
  warnings?: string[];
  status: MeasurementSessionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface FavoriteItem {
  id: string;
  favoriteId?: string;
  customerId: string;
  productId?: ClothingProduct;
  tailorId?: Tailor;
  createdAt: string;
}

export interface CartItem {
  productId: ClothingProduct | string;
  tailorId: Tailor | string;
  quantity: number;
  measurementProfileId: MeasurementProfile | string;
  customization: Record<string, any>;
  calculatedPrice: number;
  unitPrice?: number;
  itemTotal?: number;
}

export interface CartTotals {
  subtotal: number;
  totalAmount: number;
  totalItems: number;
  currency: string;
}

export interface CartData {
  customerId: string;
  items: CartItem[];
  currency: string;
  totals: CartTotals;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PENDING_TAILOR'
  | 'ACCEPTED'
  | 'MEASUREMENT_VERIFICATION'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type TailorProductionStage =
  | 'ORDER_ACCEPTED'
  | 'MEASUREMENT_VERIFIED'
  | 'CUTTING'
  | 'SEWING'
  | 'FINISHING'
  | 'QUALITY_CHECK'
  | 'READY';

export interface OrderHistoryRecord {
  historyId: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  actor: {
    userId: string;
    role: string;
    name: string;
  };
  timestamp: string;
  notes?: string;
}

export interface Order {
  id?: string;
  _id?: string;
  orderId: string;
  customerId: string;
  tailorId: string;
  productId?: string;
  customerSnapshot: {
    customerId: string;
    name: string;
    email: string;
  };
  tailorSnapshot: {
    tailorId: string;
    businessName: string;
    businessAddress?: string;
  };
  productSnapshot: {
    productId: string;
    name: string;
    categoryName?: string;
    image?: string;
    basePrice: number;
  };
  customization: Record<string, any>;
  measurementSnapshot: Record<string, any>;
  pricingSnapshot: PriceCalculationResult;
  paymentInfo: {
    status: 'PENDING' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED';
    paymentMethod: string;
    paymentReference?: string;
    amountPaid: number;
  };
  deliveryInfo: {
    recipientName: string;
    address: string;
    contactPhone: string;
    deliveryNotes?: string;
  };
  quantity: number;
  status: OrderStatus;
  productionStage?: TailorProductionStage;
  productionProgressPercent?: number;
  productionNotes?: string;
  statusHistory: OrderHistoryRecord[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentProvider = 'Telebirr' | 'Chapa' | 'Bank' | 'Cash';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface PaymentRecord {
  paymentId: string;
  orderId: string;
  customerId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionReference?: string;
  rawProviderResponse?: any;
  errorMessage?: string;
  initiatedAt: string;
  verifiedAt?: string;
}

export interface CustomerAddress {
  id?: string;
  _id?: string;
  addressId?: string;
  customerId?: string;
  label: string;
  recipientName: string;
  phone: string;
  region: string;
  city: string;
  subCity: string;
  woreda?: string;
  street: string;
  additionalInformation?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface DeliveryRecord {
  deliveryId: string;
  orderId: string;
  deliveryAgentId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  proofOfDelivery?: {
    signature?: string;
    photoUrl?: string;
    confirmationCode?: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push';

export interface NotificationItem {
  id?: string;
  _id?: string;
  notificationId: string;
  recipientId: string;
  eventType: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  isRead: boolean;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface ReviewItem {
  id?: string;
  _id?: string;
  customerId: string;
  tailorId: string;
  orderId?: string;
  productId?: string;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketMessage {
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id?: string;
  _id?: string;
  ticketNumber: string;
  userId: string;
  userRole: UserRole;
  type: 'COMPLAINT' | 'ORDER_ISSUE' | 'PAYMENT_ISSUE' | 'GENERAL' | 'DISPUTE';
  orderId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  resolutionNotes?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id?: string;
  _id?: string;
  actor: {
    userId?: string;
    role?: string;
    name?: string;
    email?: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}





