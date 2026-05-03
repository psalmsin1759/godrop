export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export type SystemAdminRole = 'SUPER_ADMIN' | 'ADMIN'
export type VendorAdminRole = 'OWNER' | 'MANAGER' | 'STAFF'
export type AdminRole = SystemAdminRole | VendorAdminRole
export type AdminType = 'SYSTEM' | 'VENDOR'
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type VendorType = 'RESTAURANT' | 'GROCERY' | 'RETAIL' | 'PHARMACY'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  type: AdminType
  vendorId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  type: VendorType
  description?: string
  address: string
  lat: number
  lng: number
  phone: string
  email: string
  status: VendorStatus
  rating?: number
  isOpen?: boolean
  deliveryFeeKobo?: number
  estimatedMinutes?: number
  openingHours?: Record<string, { open: string; close: string }>
  cuisines?: string[]
  ownerFirstName?: string
  ownerLastName?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  adminId: string
  admin?: Pick<AdminUser, 'id' | 'email' | 'firstName' | 'lastName'>
  vendorId?: string
  vendor?: Pick<Vendor, 'id' | 'name'>
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: AdminUser
}

export interface CreateAdminRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  role?: SystemAdminRole
}

export interface UpdateAdminRequest {
  firstName?: string
  lastName?: string
  isActive?: boolean
  role?: SystemAdminRole
}

export interface AuditLogFilters {
  vendorId?: string
  adminId?: string
  action?: string
  entity?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface ProductCategory {
  id: string
  vendorId: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count?: { products: number }
}

export interface ProductAdmin {
  id: string
  categoryId: string
  category: { id: string; name: string }
  name: string
  description?: string
  priceKobo: number
  imageUrl?: string
  isAvailable: boolean
  stock?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  imageUrl?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
}

export interface CreateProductRequest {
  categoryId: string
  name: string
  description?: string
  priceKobo: number
  imageUrl?: string
  isAvailable?: boolean
  stock?: number
}

export interface UpdateProductRequest {
  categoryId?: string
  name?: string
  description?: string | null
  priceKobo?: number
  imageUrl?: string | null
  isAvailable?: boolean
  stock?: number | null
}

export interface ProductsListResponse {
  success: boolean
  data: ProductAdmin[]
  total: number
  page: number
  limit: number
}

export interface ProductsListParams {
  categoryId?: string
  page?: number
  limit?: number
}

// ─── System Analytics ──────────────────────────────────────────────────────
export interface SystemAnalyticsSummary {
  totalUsers: number
  newUsers: number
  totalVendors: number
  activeVendors: number
  pendingVendors: number
  totalOrders: number
  completedOrders: number
  totalRevenueKobo: number
}

export interface OrderByStatus {
  status: string
  count: number
}

export interface OrderByType {
  type: string
  count: number
  revenueKobo: number
}

export interface RevenueByDay {
  date: string
  orders: number
  revenueKobo: number
}

export interface TopVendorEntry {
  id: string
  name: string
  type: string
  rating: number
  orders: number
  revenueKobo: number
}

export interface SystemAnalytics {
  summary: SystemAnalyticsSummary
  ordersByStatus: OrderByStatus[]
  ordersByType: OrderByType[]
  revenueByDay: RevenueByDay[]
  topVendors: TopVendorEntry[]
}

// ─── Vendor Analytics ──────────────────────────────────────────────────────
export interface VendorAnalyticsSummary {
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenueKobo: number
  avgOrderValueKobo: number
}

export interface TopProductEntry {
  name: string
  orders: number
  revenueKobo: number
}

export interface VendorAnalytics {
  summary: VendorAnalyticsSummary
  ordersByStatus: OrderByStatus[]
  revenueByDay: RevenueByDay[]
  topProducts: TopProductEntry[]
}

// ─── Graph Data ────────────────────────────────────────────────────────────
export interface SystemGraphPoint {
  date: string
  orders: number
  revenueKobo: number
  newUsers: number
}

export interface SystemGraphData {
  granularity: 'day' | 'week' | 'month'
  points: SystemGraphPoint[]
}

export interface VendorGraphPoint {
  date: string
  orders: number
  revenueKobo: number
}

export interface VendorGraphData {
  granularity: 'day' | 'week' | 'month'
  points: VendorGraphPoint[]
}

export type GraphGranularity = 'day' | 'week' | 'month'

export interface AnalyticsDateParams {
  from?: string
  to?: string
  granularity?: GraphGranularity
}

// ─── Vendor Orders ─────────────────────────────────────────────────────────
export type VendorOrderStatus =
  | 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP'
  | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED'

export type OrderType = 'FOOD' | 'GROCERY' | 'RETAIL' | 'PHARMACY' | 'PARCEL' | 'TRUCK'
export type PaymentMethod = 'CARD' | 'WALLET' | 'CASH'
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface VendorOrderItem {
  name: string
  quantity: number
  unitPriceKobo: number
  totalKobo: number
  notes?: string
}

export interface VendorOrderCustomer {
  firstName: string
  lastName: string
  phone: string
}

export interface VendorOrder {
  id: string
  trackingCode: string
  status: VendorOrderStatus
  type: OrderType
  items: VendorOrderItem[]
  customer: VendorOrderCustomer
  subtotalKobo: number
  deliveryFeeKobo: number
  serviceFeeKobo: number
  discountKobo: number
  totalKobo: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: string
}

export interface VendorOrdersListParams {
  status?: VendorOrderStatus
  page?: number
  limit?: number
}

export interface VendorOrdersListResponse {
  success: boolean
  data: VendorOrder[]
  total: number
  page: number
  limit: number
}

// ─── Team ──────────────────────────────────────────────────────────────────
export type TeamMemberRole = 'OWNER' | 'MANAGER' | 'STAFF'

export interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  role: TeamMemberRole
  isActive: boolean
  createdAt: string
}

export interface InviteTeamMemberRequest {
  email: string
  firstName: string
  lastName: string
  role: 'MANAGER' | 'STAFF'
}

// ─── Admin Settings (Personal) ────────────────────────────────────────────
export interface VendorAdminSettings {
  emailNotifications: boolean
  orderAlerts: boolean
}

export interface UpdateVendorAdminSettingsRequest {
  emailNotifications?: boolean
  orderAlerts?: boolean
}

export interface SystemAdminSettings {
  emailNotifications: boolean
  weeklyReport: boolean
}

export interface UpdateSystemAdminSettingsRequest {
  emailNotifications?: boolean
  weeklyReport?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

// ─── Vendor Settings ───────────────────────────────────────────────────────
export interface VendorSettings {
  id: string
  name: string
  description?: string
  phone: string
  email: string
  deliveryFeeKobo: number
  estimatedMinutes: number
  isOpen: boolean
  openingHours?: Record<string, { open: string; close: string }>
}

export interface UpdateVendorSettingsRequest {
  name?: string
  description?: string | null
  phone?: string
  email?: string
  deliveryFeeKobo?: number
  estimatedMinutes?: number
  isOpen?: boolean
  openingHours?: Record<string, { open: string; close: string }>
}

// ─── Truck ─────────────────────────────────────────────────────────────────
export interface ApartmentType {
  id: string
  name: string
  description?: string
  priceKobo: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TruckPricingConfig {
  id: string
  perKmKobo: number
  perLoaderKobo: number
  updatedAt: string
}

export interface TruckPricingSummary {
  apartmentTypes: ApartmentType[]
  perKmKobo: number
  perLoaderKobo: number
}

export interface CreateApartmentTypeRequest {
  name: string
  description?: string
  priceKobo: number
  isActive?: boolean
}

export interface UpdateApartmentTypeRequest {
  name?: string
  description?: string
  priceKobo?: number
  isActive?: boolean
}

export interface TruckType {
  id: string
  name: string
  description?: string
  capacity?: string
  imageUrl?: string
  baseFeeKobo: number
  perKmKobo: number
  isActive: boolean
}

export interface CreateTruckTypeRequest {
  name: string
  description?: string
  capacity?: string
  imageUrl?: string
  baseFeeKobo: number
  perKmKobo: number
  isActive?: boolean
}

export interface UpdateTruckTypeRequest {
  name?: string
  description?: string
  capacity?: string
  imageUrl?: string
  baseFeeKobo?: number
  perKmKobo?: number
  isActive?: boolean
}

export type OrderStatus =
  | 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP'
  | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED'

export interface Order {
  id: string
  trackingCode: string
  type: OrderType
  status: OrderStatus
  totalKobo: number
  createdAt: string
}

// ─── Admin Orders (System Admin) ───────────────────────────────────────────
export interface AdminOrderVendor {
  id: string
  name: string
  type: VendorType
}

export interface AdminOrderCustomer {
  id: string
  firstName: string
  lastName: string
  phone: string
}

export interface AdminOrderRider {
  id: string
  firstName: string
  lastName: string
  phone: string
}

export interface AdminOrderTimeline {
  status: string
  description: string
  createdAt: string
}

export interface AdminOrderStop {
  lat: number
  lng: number
  address: string
}

export interface AdminOrder {
  id: string
  trackingCode: string
  status: OrderStatus
  type: OrderType
  vendor: AdminOrderVendor | null
  customer: AdminOrderCustomer
  rider: AdminOrderRider | null
  items: VendorOrderItem[]
  timeline: AdminOrderTimeline[]
  // locations
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  // truck-specific
  apartmentType?: { id: string; name: string; priceKobo: number } | null
  numLoaders?: number | null
  stops?: AdminOrderStop[] | null
  // financials
  subtotalKobo: number
  deliveryFeeKobo: number
  serviceFeeKobo: number
  discountKobo: number
  totalKobo: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  scheduledAt?: string | null
  estimatedMinutes?: number | null
  notes?: string | null
  cancellationReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminOrdersListParams {
  status?: OrderStatus
  type?: OrderType
  vendorId?: string
  search?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface AdminOrdersListResponse {
  success: boolean
  data: AdminOrder[]
  total: number
  page: number
  limit: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TruckOrdersParams {
  page?: number
  limit?: number
  status?: OrderStatus
}

// ─── Customers (System Admin) ──────────────────────────────────────────────

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

export interface AdminCustomer {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  avatarUrl: string | null
  isVerified: boolean
  status: CustomerStatus
  createdAt: string
  wallet: { balanceKobo: number } | null
  _count: { orders: number }
}

export interface AdminCustomerDetail {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  avatarUrl: string | null
  referralCode: string | null
  isVerified: boolean
  status: CustomerStatus
  createdAt: string
  updatedAt: string
  wallet: { id: string; balanceKobo: number; createdAt: string } | null
  _count: { orders: number; addresses: number }
}

export interface AdminWallet {
  id: string
  balanceKobo: number
  createdAt: string
  updatedAt: string
  user: { id: string; firstName: string; lastName: string; phone: string }
}

export type WalletTransactionType = 'TOPUP' | 'PAYMENT' | 'REFUND'

export interface AdminWalletTransaction {
  id: string
  walletId: string
  type: WalletTransactionType
  amountKobo: number
  reference: string | null
  description: string | null
  createdAt: string
}

export interface CustomersListParams {
  status?: CustomerStatus
  search?: string
  page?: number
  limit?: number
}

export interface CustomerWalletTransactionsParams {
  type?: WalletTransactionType
  page?: number
  limit?: number
}

// ─── Riders ────────────────────────────────────────────────────────────────
export type RiderKycStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
export type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR' | 'VAN'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface RiderGuarantor {
  name: string
  phone: string
  relationship: string
  address?: string
  occupation?: string
}

export interface Rider {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string | null
  avatarUrl?: string | null
  vehicleType?: VehicleType | null
  vehiclePlate?: string | null
  kycStatus: RiderKycStatus
  isAvailable: boolean
  isActive: boolean
  rating?: number | null
  ratingCount: number
  city?: string | null
  state?: string | null
  createdAt: string
  _count: { orders: number }
}

export interface RiderDetail extends Omit<Rider, '_count'> {
  dateOfBirth?: string | null
  gender?: Gender | null
  streetAddress?: string | null
  landmark?: string | null
  vehicleColor?: string | null
  vehicleModel?: string | null
  vehicleYear?: number | null
  driverLicenseNumber?: string | null
  driverLicenseExpiry?: string | null
  vehicleInsuranceExpiry?: string | null
  bankName?: string | null
  bankCode?: string | null
  accountNumber?: string | null
  accountName?: string | null
  bvn?: string | null
  nin?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelationship?: string | null
  guarantors?: RiderGuarantor[] | null
  updatedAt: string
}

export interface CreateRiderRequest {
  firstName: string
  lastName: string
  phone: string
  email?: string
  dateOfBirth?: string
  gender?: Gender
  streetAddress?: string
  city?: string
  state?: string
  landmark?: string
  vehicleType?: VehicleType
  vehiclePlate?: string
  vehicleColor?: string
  vehicleModel?: string
  vehicleYear?: number
  driverLicenseNumber?: string
  driverLicenseExpiry?: string
  vehicleInsuranceExpiry?: string
  bankName?: string
  bankCode?: string
  accountNumber?: string
  accountName?: string
  bvn?: string
  nin?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  guarantors?: RiderGuarantor[]
}

export interface UpdateRiderRequest extends Partial<CreateRiderRequest> {
  isActive?: boolean
}

export interface RidersListParams {
  search?: string
  kycStatus?: RiderKycStatus
  isActive?: boolean
  page?: number
  limit?: number
}

export interface RidersListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface RiderStats {
  total: number
  active: number
  available: number
  byKycStatus: {
    PENDING: number
    SUBMITTED: number
    VERIFIED: number
    REJECTED: number
  }
}

export interface AvailableRider {
  id: string
  firstName: string
  lastName: string
  phone: string
  vehicleType?: VehicleType | null
  vehiclePlate?: string | null
  lat?: number | null
  lng?: number | null
  rating: number
}

export interface RiderOrderSummary {
  id: string
  trackingCode: string
  type: OrderType
  status: OrderStatus
  pickupAddress: string
  dropoffAddress: string
  deliveryFeeKobo: number
  totalKobo: number
  paymentMethod: PaymentMethod
  createdAt: string
}

export interface RiderOrdersParams {
  status?: OrderStatus
  page?: number
  limit?: number
}

export interface RiderEarning {
  id: string
  amountKobo: number
  status: 'PENDING' | 'SETTLED'
  settledAt: string | null
  createdAt: string
  order: {
    id: string
    trackingCode: string
    type: OrderType
    pickupAddress: string
    dropoffAddress: string
    createdAt: string
  }
}

export interface RiderEarningsResponse {
  data: RiderEarning[]
  meta: RidersListMeta
  totalEarnedKobo: number
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface RiderWithdrawal {
  id: string
  amountKobo: number
  bankName: string
  accountNumber: string
  accountName: string
  status: WithdrawalStatus
  notes: string | null
  processedAt: string | null
  createdAt: string
}

// ─── Admin Notifications ───────────────────────────────────────────────────
export interface AdminNotification {
  id: string
  adminId: string
  type: string
  title: string
  body: string
  isRead: boolean
  data?: Record<string, unknown>
  createdAt: string
}

export interface NotificationsListParams {
  unreadOnly?: boolean
  page?: number
  limit?: number
}
