export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export type AdminType = 'SYSTEM' | 'VENDOR' | 'BUSINESS'
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type VendorType = 'RESTAURANT' | 'GROCERY' | 'RETAIL' | 'PHARMACY'
export type BusinessStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

// ─── RBAC ──────────────────────────────────────────────────────────────────
// Roles are data (not a hardcoded enum) — a named, editable bundle of
// permission keys. '*' in permissions grants everything for that admin type.
export interface Role {
  id: string
  name: string
  type: AdminType
  vendorId: string | null
  businessId: string | null
  permissions: string[]
  isDefault: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface PermissionDef {
  key: string
  module: string
  label: string
}

export interface AdminRoleRef {
  id: string
  name: string
  type: AdminType
  permissions: string[]
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRoleRef
  isOwner: boolean
  type: AdminType
  vendorId?: string
  businessId?: string
  isActive: boolean
  receiveVendorEmails: boolean
  receiveRiderEmails: boolean
  createdAt: string
  updatedAt: string
}

// ─── Business ──────────────────────────────────────────────────────────────
export interface Business {
  id: string
  name: string
  status: BusinessStatus
  // contact
  email: string | null
  phone: string | null
  address: string | null
  // registration
  cacRegistrationNumber: string | null
  tin: string | null
  yearEstablished: number | null
  // owner
  ownerFullName: string | null
  ownerPhoneNumber: string | null
  ownerEmail: string | null
  ownerNIN: string | null
  ownerBVN: string | null
  // operations
  serviceAreas: string[]
  // documents
  cacCertificateUrl: string | null
  driversLicenseUrl: string | null
  insuranceDocumentUrl: string | null
  utilityBillUrl: string | null
  // banking
  bankName: string | null
  accountName: string | null
  accountNumber: string | null
  createdAt: string
  updatedAt: string
  wallet: { balance: number } | null
  _count: { riders: number; admins: number }
}

export type BusinessWalletTxType = 'RIDER_EARNING' | 'WITHDRAWAL'

export interface BusinessWalletTransaction {
  id: string
  walletId: string
  riderId: string | null
  type: BusinessWalletTxType
  amount: number
  reference: string | null
  description: string | null
  createdAt: string
}

export interface BusinessMember {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRoleRef
  isOwner: boolean
  isActive: boolean
  createdAt: string
}

export type BusinessDocumentField = 'cacCertificateUrl' | 'driversLicenseUrl' | 'insuranceDocumentUrl' | 'utilityBillUrl'

export interface CreateBusinessRequest {
  name: string
  email?: string
  phone?: string
  address?: string
  cacRegistrationNumber?: string
  tin?: string
  yearEstablished?: number
  ownerFullName?: string
  ownerPhoneNumber?: string
  ownerEmail?: string
  ownerNIN?: string
  ownerBVN?: string
  serviceAreas?: string[]
  cacCertificateUrl?: string
  driversLicenseUrl?: string
  insuranceDocumentUrl?: string
  utilityBillUrl?: string
  bankName?: string
  accountName?: string
  accountNumber?: string
}

export type UpdateBusinessRequest = Partial<CreateBusinessRequest>

export interface CreateBusinessOwnerRequest {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface CreateBusinessMemberRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  roleId: string
}

export interface UpdateBusinessMemberRequest {
  firstName?: string
  lastName?: string
  isActive?: boolean
  roleId?: string
}

export interface BusinessesListParams {
  search?: string
  status?: BusinessStatus
  page?: number
  limit?: number
}

export interface VendorDocuments {
  businessRegistrationUrl?: string
  governmentIdUrl?: string
  utilityBillUrl?: string
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
  isActive?: boolean
  /** Platform-wide standard delivery fee, set by system admin (read-only). */
  deliveryFeeKobo?: number
  estimatedMinutes?: number
  openingHours?: Record<string, { open: string; close: string }>
  cuisines?: string[]
  ownerFirstName?: string
  ownerLastName?: string
  rejectionReason?: string | null
  documents?: VendorDocuments | null
  createdAt: string
  updatedAt: string
  /** Only present on the single-vendor detail endpoint. */
  disputeCount?: number
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
  password?: string
  roleId?: string
}

export interface UpdateAdminRequest {
  firstName?: string
  lastName?: string
  isActive?: boolean
  roleId?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

export interface UpdateAdminEmailPrefsRequest {
  receiveVendorEmails?: boolean
  receiveRiderEmails?: boolean
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
  rejectedVendors: number
  suspendedVendors: number
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
export interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRoleRef
  isOwner: boolean
  isActive: boolean
  createdAt: string
}

export interface InviteTeamMemberRequest {
  email: string
  firstName: string
  lastName: string
  roleId: string
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

export interface PlatformSettings {
  id: string
  riderEarningRate: number
  coverageRadiusKm: number
  vendorPlatformFeeRate?: number
  paystackPublicKey?: string
  paystackSecretKey?: string
  standardDeliveryFeeKobo?: number
  serviceChargeKobo?: number
  costPerKmKobo?: number
  customerServicePhone?: string
  updatedAt: string
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
  /** Platform-wide standard delivery fee, set by system admin (read-only). */
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

export interface ParcelDropoff {
  id: string
  sequence: number
  address: string
  lat: number
  lng: number
  recipientName: string
  recipientPhone: string
  packageDescription?: string | null
  weightKg?: number | null
  sizeCategory?: string | null
  status: OrderStatus
  deliveryFeeKobo: number
  earningKobo?: number | null
  distanceKm?: number | null
  deliveredAt?: string | null
  failureReason?: string | null
  confirmationCode?: string
  earning?: { amountKobo: number; status: string } | null
}

export interface Order {
  id: string
  trackingCode: string
  type: OrderType
  status: OrderStatus
  totalKobo: number
  dropoffs?: ParcelDropoff[]
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
  // parcel-specific
  packageDescription?: string | null
  weightKg?: number | null
  sizeCategory?: 'small' | 'medium' | 'large' | 'extra_large' | null
  recipientName?: string | null
  recipientPhone?: string | null
  dropoffs?: ParcelDropoff[] | null
  vehicleType?: { id: string; name: string; baseFeeKobo: number; perKmKobo: number } | null
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

// ─── Parcel ─────────────────────────────────────────────────────────────────
export interface ParcelVehicleType {
  id: string
  name: string
  description?: string
  imageUrl?: string
  baseFeeKobo: number
  perKmKobo: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateParcelVehicleTypeRequest {
  name: string
  description?: string
  imageUrl?: string
  baseFeeKobo: number
  perKmKobo: number
  isActive?: boolean
}

export interface UpdateParcelVehicleTypeRequest {
  name?: string
  description?: string
  imageUrl?: string
  baseFeeKobo?: number
  perKmKobo?: number
  isActive?: boolean
}

export interface ParcelOrdersParams {
  page?: number
  limit?: number
  status?: OrderStatus
}

// ─── Customers (System Admin) ──────────────────────────────────────────────

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

export interface AdminCustomer {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string
  email: string | null
  avatarUrl: string | null
  isVerified: boolean
  status: CustomerStatus
  createdAt: string
  wallet: { balance: number } | null
  _count: { orders: number }
}

export interface AdminCustomerDetail {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string
  email: string | null
  avatarUrl: string | null
  referralCode: string | null
  isVerified: boolean
  status: CustomerStatus
  createdAt: string
  updatedAt: string
  wallet: { id: string; balance: number; createdAt: string } | null
  _count: { orders: number; addresses: number }
}

export interface AdminWallet {
  id: string
  balance: number
  createdAt: string
  updatedAt: string
  user: { id: string; firstName: string; lastName: string; phone: string }
}

export type WalletTransactionType = 'TOPUP' | 'PAYMENT' | 'REFUND'

export interface AdminWalletTransaction {
  id: string
  walletId: string
  type: WalletTransactionType
  amount: number
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
  address: string
  governmentIdUrl?: string
}

export interface RiderDocuments {
  governmentIdUrl?: string
  vehiclePaperUrls?: string[]
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
  documents?: RiderDocuments | null
  updatedAt: string
  completedOrders: number
  rejectedOrders: number
  disputeCount: number
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
  amount: number
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
  totalEarned: number
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface RiderWithdrawal {
  id: string
  amount: number
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

// ─── Heroes ────────────────────────────────────────────────────────────────────
export type HeroAlign = 'left' | 'center'

export interface Hero {
  id: string
  badge: string | null
  heading: string
  subheading: string
  imageUrl: string | null
  align: HeroAlign
  isActive: boolean
  sortOrder: number
  ctaLabel: string | null
  ctaLink: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateHeroRequest {
  badge?: string | null
  heading: string
  subheading: string
  imageUrl?: string | null
  align?: HeroAlign
  isActive?: boolean
  sortOrder?: number
  ctaLabel?: string | null
  ctaLink?: string | null
}

export interface UpdateHeroRequest {
  badge?: string | null
  heading?: string
  subheading?: string
  imageUrl?: string | null
  align?: HeroAlign
  isActive?: boolean
  sortOrder?: number
  ctaLabel?: string | null
  ctaLink?: string | null
}

// ─── Promo Banners (home-screen "use code" card) ───────────────────────────────
export interface Banner {
  id: string
  imageUrl: string | null
  badge: string | null
  title: string | null
  ctaLabel: string | null
  linkType: string | null
  linkValue: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface CreateBannerRequest {
  imageUrl?: string | null
  badge?: string | null
  title?: string | null
  ctaLabel?: string | null
  linkType?: string | null
  linkValue?: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateBannerRequest {
  imageUrl?: string | null
  badge?: string | null
  title?: string | null
  ctaLabel?: string | null
  linkType?: string | null
  linkValue?: string | null
  isActive?: boolean
  sortOrder?: number
}

// ─── Coupons ────────────────────────────────────────────────────────────────────
export type PromotionType = 'percent' | 'fixed'

export interface Promotion {
  id: string
  code: string
  description: string
  type: PromotionType
  value: number
  maxDiscount: number | null
  minOrderKobo: number | null
  orderTypes: string[]
  usageLimit: number | null
  usageCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}

export interface PromotionDetail extends Promotion {
  ordersRedeemed: number
  totalDiscountKobo: number
}

export interface CreatePromotionRequest {
  code: string
  description: string
  type: PromotionType
  value: number
  maxDiscount?: number
  minOrderKobo?: number
  orderTypes?: string[]
  usageLimit?: number
  validFrom: string
  validUntil: string
  isActive?: boolean
}

export interface UpdatePromotionRequest {
  code?: string
  description?: string
  type?: PromotionType
  value?: number
  maxDiscount?: number | null
  minOrderKobo?: number | null
  orderTypes?: string[]
  usageLimit?: number | null
  validFrom?: string
  validUntil?: string
  isActive?: boolean
}

// ─── Push Notifications ────────────────────────────────────────────────────────
export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
}

export interface PushSendResult {
  success: boolean
  message: string
  successCount: number
  failureCount: number
}

// ─── Disputes ────────────────────────────────────────────────────────────────
export type DisputeRaisedByType = 'CUSTOMER' | 'VENDOR' | 'RIDER'
export type DisputeCategory =
  | 'WRONG_ITEM'
  | 'MISSING_ITEMS'
  | 'DAMAGED_ITEM'
  | 'FOOD_QUALITY'
  | 'LATE_DELIVERY'
  | 'NEVER_ARRIVED'
  | 'RIDER_BEHAVIOR'
  | 'VENDOR_BEHAVIOR'
  | 'CUSTOMER_BEHAVIOR'
  | 'PAYMENT_ISSUE'
  | 'OTHER'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'AWAITING_RESPONSE' | 'ESCALATED' | 'RESOLVED' | 'REJECTED'
export type DisputeResolutionType = 'REFUND_CUSTOMER' | 'COMPENSATE_RIDER' | 'NO_ACTION' | 'REJECTED'
export type DisputeSenderType = 'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN'

export interface DisputeOrderSummary {
  id: string
  trackingCode: string
  type: OrderType
  status: OrderStatus
  totalKobo: number
  customerId: string
  vendorId?: string | null
  riderId?: string | null
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderType: DisputeSenderType
  senderId: string
  message: string
  attachmentUrls: string[]
  isInternal: boolean
  createdAt: string
}

export interface Dispute {
  id: string
  orderId: string
  order: DisputeOrderSummary
  raisedByType: DisputeRaisedByType
  raisedByCustomer?: { id: string; firstName?: string | null; lastName?: string | null; phone: string } | null
  raisedByVendor?: { id: string; name: string } | null
  raisedByRider?: { id: string; firstName: string; lastName: string; phone: string } | null
  category: DisputeCategory
  description: string
  evidenceUrls: string[]
  status: DisputeStatus
  assignedAdminId?: string | null
  assignedAdmin?: { id: string; firstName: string; lastName: string } | null
  resolutionType?: DisputeResolutionType | null
  resolutionNotes?: string | null
  resolutionAmountKobo?: number | null
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
  _count?: { messages: number }
}

export interface DisputeDetail extends Dispute {
  messages: DisputeMessage[]
}

export interface DisputesListParams {
  status?: DisputeStatus
  category?: DisputeCategory
  raisedByType?: DisputeRaisedByType
  search?: string
  page?: number
  limit?: number
}

export interface DisputesListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ResolveDisputeRequest {
  resolutionType: DisputeResolutionType
  resolutionNotes?: string
  resolutionAmountKobo?: number
}
