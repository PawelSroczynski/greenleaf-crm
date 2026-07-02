// lib/types.ts — interfejsy TypeScript dla 16 encji z DATA_MODEL.md.
// Konwencja: camelCase (warstwa aplikacji). password_hash pominięty (mock).

// ---------- Union / enum types ----------
export type UserRole = 'admin' | 'dostawca' | 'klient_rws' | 'klient_zewnetrzny';
export type DeliveryOption = 'pickup' | 'home_delivery';
export type CreatedBy = 'self' | 'admin';

export type SubscriptionType =
  | 'paczka_24'
  | 'paczka_12'
  | 'jajka_A'
  | 'jajka_B'
  | 'jajka_C'
  | 'jajka_D'
  | 'jajka_E'
  | 'jajka_F'
  | 'jajka_G';
export type Frequency = 'weekly' | 'biweekly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type PaymentModel = 'upfront' | 'installments_3';

export type WeeklyPackageStatus = 'draft' | 'published' | 'completed';

export type ProductCategory = 'warzywo' | 'ziolo' | 'owoc';

export type ClientPackageStatus =
  | 'pending'
  | 'assembled'
  | 'ready'
  | 'picked_up'
  | 'not_picked_up';

export type ChickenBatch = 'batch_1' | 'batch_2' | 'batch_3';
export type ChickenStatus = 'reserved' | 'in_breeding' | 'ready' | 'picked_up';
export type ChickenPaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'blik';

export type ExtraOrderStatus =
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'ready'
  | 'picked_up';

export type PaymentType = 'subscription' | 'chicken' | 'extra_order' | 'delivery';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export type AnnouncementTargetGroup = 'all' | 'package' | 'eggs' | 'chickens';
export type AnnouncementType = 'package_content' | 'info' | 'reminder' | 'event';
export type AnnouncementChannel = 'email' | 'in_app' | 'both';

export type NotificationType =
  | 'package'
  | 'deadline'
  | 'pickup'
  | 'payment'
  | 'chicken'
  | 'system';

export type AuditAction = 'create' | 'update' | 'delete';

// ---------- 1. User ----------
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  defaultPickupPointId: string | null;
  deliveryOption: DeliveryOption;
  deliveryAddress: string | null;
  notes: string | null;
  createdBy: CreatedBy;
  isActive: boolean;
  privacyAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- 2. Subscription ----------
export interface Subscription {
  id: string;
  userId: string;
  type: SubscriptionType;
  season: string;
  frequency: Frequency;
  eggQuantity: number | null;
  status: SubscriptionStatus;
  paymentModel: PaymentModel;
  totalPackages: number;
  packagesRemaining: number;
  deliveryCostPerPackage: number;
  totalAmount: number;
  editedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- 3. WeeklyPackage ----------
export interface WeeklyPackage {
  id: string;
  weekNumber: number;
  pickupDate: string;
  publishedAt: string | null;
  swapDeadline: string;
  absenceDeadline: string;
  status: WeeklyPackageStatus;
  season: string;
  /** Punkty odbioru aktywne w tym tygodniu; null = wszystkie punkty. */
  pickupPointIds: string[] | null;
  createdAt: string;
}

// ---------- 4. PackageItem ----------
export interface PackageItem {
  id: string;
  weeklyPackageId: string;
  productId: string;
  quantity: number;
  unit: string;
}

// ---------- 5. Product ----------
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  availableMonths: number[];
  isActive: boolean;
  photoUrl: string | null;
}

// ---------- 6. ClientPackage ----------
export interface ClientPackage {
  id: string;
  weeklyPackageId: string;
  userId: string;
  subscriptionId: string;
  status: ClientPackageStatus;
  pickupPointId: string | null;
  isHomeDelivery: boolean;
  absenceReported: boolean;
  absenceReportedAt: string | null;
  pickupConfirmedFarm: boolean;
  pickupConfirmedFarmAt: string | null;
  pickupConfirmedFarmBy: string | null;
  pickupConfirmedDriver: boolean;
  pickupConfirmedDriverAt: string | null;
  pickupConfirmedDriverBy: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- 7. Swap ----------
export interface Swap {
  id: string;
  clientPackageId: string;
  originalProductId: string;
  replacementProductId: string;
  createdAt: string;
}

// ---------- 8. ChickenReservation ----------
export interface ChickenReservation {
  id: string;
  userId: string;
  batch: ChickenBatch;
  plannedDate: string;
  carcassCount: number;
  wantsGiblets: boolean;
  actualWeightKg: number | null;
  pricePerKg: number;
  avgCarcassWeight: number;
  totalAmount: number | null;
  status: ChickenStatus;
  paymentStatus: ChickenPaymentStatus;
  paymentMethod: PaymentMethod | null;
  pickupPointId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- 9. ExtraOrder ----------
export interface ExtraOrder {
  id: string;
  userId: string;
  status: ExtraOrderStatus;
  approvedBy: string | null;
  adminNote: string | null;
  pickupPointId: string | null;
  submittedAt: string;
  approvedAt: string | null;
  createdAt: string;
}

// ---------- 10. ExtraOrderItem ----------
export interface ExtraOrderItem {
  id: string;
  extraOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

// ---------- 11. Payment ----------
export interface Payment {
  id: string;
  userId: string;
  type: PaymentType;
  subscriptionId: string | null;
  chickenReservationId: string | null;
  amount: number;
  installmentNumber: number | null;
  installmentDueDate: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  paidAt: string | null;
  markedBy: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- 12. PickupPoint ----------
export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  gpsLat: number | null;
  gpsLon: number | null;
  pickupDay: string;
  hoursFrom: string;
  hoursTo: string;
  extraCost: number;
  isActive: boolean;
}

// ---------- 13. DeliveryZone ----------
export interface DeliveryZone {
  id: string;
  name: string;
  localities: string[];
  cost: number;
  isActive: boolean;
}

// ---------- 14. Announcement ----------
export interface Announcement {
  id: string;
  authorId: string;
  content: string;
  targetGroup: AnnouncementTargetGroup;
  type: AnnouncementType;
  channel: AnnouncementChannel;
  sentAt: string | null;
  createdAt: string;
}

// ---------- 15. Notification ----------
export interface Notification {
  id: string;
  userId: string;
  announcementId: string | null;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// ---------- 16. AuditLog ----------
export interface AuditLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  changes: Record<string, unknown>;
  createdAt: string;
}

// ---------- Store (kontener wszystkich kolekcji) ----------
export interface Store {
  users: User[];
  subscriptions: Subscription[];
  weeklyPackages: WeeklyPackage[];
  packageItems: PackageItem[];
  products: Product[];
  clientPackages: ClientPackage[];
  swaps: Swap[];
  chickenReservations: ChickenReservation[];
  extraOrders: ExtraOrder[];
  extraOrderItems: ExtraOrderItem[];
  payments: Payment[];
  pickupPoints: PickupPoint[];
  deliveryZones: DeliveryZone[];
  announcements: Announcement[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}
