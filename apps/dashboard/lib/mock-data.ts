export type OrderStatus = 'delivered' | 'in_transit' | 'pending' | 'cancelled'
export type OrderCategory = 'food' | 'grocery' | 'parcel' | 'retail' | 'truck'

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  riderId: string | null
  riderName: string | null
  vendorName: string
  category: OrderCategory
  items: string
  amountKobo: number
  status: OrderStatus
  pickupAddress: string
  deliveryAddress: string
  createdAt: Date
  deliveredAt: Date | null
}

export interface Rider {
  id: string
  name: string
  phone: string
  avatar: string
  isOnline: boolean
  zone: string
  rating: number
  deliveriesToday: number
  deliveriesTotal: number
  earningsKobo: number
  vehicleType: 'bike' | 'car' | 'truck'
  joinedAt: Date
}

export interface Vendor {
  id: string
  name: string
  category: OrderCategory
  zone: string
  isActive: boolean
  ordersThisMonth: number
  ordersTotal: number
  revenueKobo: number
  rating: number
  joinedAt: Date
}

const now = new Date('2026-04-24T10:30:00')
const sub = (mins: number) => new Date(now.getTime() - mins * 60000)

export const mockOrders: Order[] = [
  { id: 'GD-102847', customerId: 'c1', customerName: 'Chukwuemeka Obi', customerPhone: '+2348034567890', riderId: 'r1', riderName: 'Tunde Adeyemi', vendorName: 'Mama Cass Kitchen', category: 'food', items: 'Jollof rice, chicken, moi moi', amountKobo: 450000, status: 'in_transit', pickupAddress: 'Lekki Phase 1', deliveryAddress: 'Victoria Island', createdAt: sub(25), deliveredAt: null },
  { id: 'GD-102846', customerId: 'c2', customerName: 'Adaeze Nwosu', customerPhone: '+2348056781234', riderId: 'r2', riderName: 'Emeka Nwachukwu', vendorName: 'FreshMart Grocery', category: 'grocery', items: 'Tomatoes, yam, palm oil, onions', amountKobo: 780000, status: 'delivered', pickupAddress: 'Yaba', deliveryAddress: 'Surulere', createdAt: sub(62), deliveredAt: sub(15) },
  { id: 'GD-102845', customerId: 'c3', customerName: 'Babatunde Fashola Jr.', customerPhone: '+2348012345678', riderId: null, riderName: null, vendorName: 'QuickSend Parcel', category: 'parcel', items: 'Documents x2, small box', amountKobo: 250000, status: 'pending', pickupAddress: 'Ikeja', deliveryAddress: 'Ikoyi', createdAt: sub(8), deliveredAt: null },
  { id: 'GD-102844', customerId: 'c4', customerName: 'Ngozi Okonkwo', customerPhone: '+2348078901234', riderId: 'r3', riderName: 'Seun Akinwale', vendorName: 'TechZone Retail', category: 'retail', items: 'Phone charger, earphones', amountKobo: 1250000, status: 'delivered', pickupAddress: 'Computer Village, Ikeja', deliveryAddress: 'Magodo', createdAt: sub(180), deliveredAt: sub(120) },
  { id: 'GD-102843', customerId: 'c5', customerName: 'Ifeanyi Eze', customerPhone: '+2348023456789', riderId: 'r4', riderName: 'Biodun Oladele', vendorName: 'ChopChop Fast Food', category: 'food', items: 'Amala + ewedu, suya wrap', amountKobo: 320000, status: 'in_transit', pickupAddress: 'Ogba', deliveryAddress: 'Agege', createdAt: sub(18), deliveredAt: null },
  { id: 'GD-102842', customerId: 'c6', customerName: 'Blessing Umeh', customerPhone: '+2348045678901', riderId: 'r5', riderName: 'Kayode Afolabi', vendorName: 'Everyday Supermart', category: 'grocery', items: 'Rice 5kg, beans 2kg, spices', amountKobo: 560000, status: 'delivered', pickupAddress: 'Maryland', deliveryAddress: 'Anthony Village', createdAt: sub(240), deliveredAt: sub(180) },
  { id: 'GD-102841', customerId: 'c7', customerName: 'Olamide Adekunle', customerPhone: '+2348067890123', riderId: null, riderName: null, vendorName: 'Lagos Relocation Co.', category: 'truck', items: 'Furniture, 20 boxes', amountKobo: 4500000, status: 'cancelled', pickupAddress: 'Gbagada', deliveryAddress: 'Ajah', createdAt: sub(300), deliveredAt: null },
  { id: 'GD-102840', customerId: 'c8', customerName: 'Chiamaka Obi', customerPhone: '+2348089012345', riderId: 'r1', riderName: 'Tunde Adeyemi', vendorName: 'Spice Garden', category: 'food', items: 'Egusi soup, pounded yam, fish', amountKobo: 580000, status: 'delivered', pickupAddress: 'Lekki Phase 2', deliveryAddress: 'Chevron', createdAt: sub(420), deliveredAt: sub(360) },
  { id: 'GD-102839', customerId: 'c9', customerName: 'Musa Abubakar', customerPhone: '+2348001234567', riderId: 'r6', riderName: 'Chijioke Nnadi', vendorName: 'PrintRight', category: 'parcel', items: 'Printed banners x3', amountKobo: 180000, status: 'in_transit', pickupAddress: 'Ojodu', deliveryAddress: 'Berger', createdAt: sub(40), deliveredAt: null },
  { id: 'GD-102838', customerId: 'c10', customerName: 'Funmi Adesanya', customerPhone: '+2348034569870', riderId: 'r2', riderName: 'Emeka Nwachukwu', vendorName: 'Glam Boutique', category: 'retail', items: 'Dress, heels, handbag', amountKobo: 2100000, status: 'delivered', pickupAddress: 'Balogun Market, Lagos Island', deliveryAddress: 'Festac', createdAt: sub(600), deliveredAt: sub(500) },
]

export const mockRiders: Rider[] = [
  { id: 'r1', name: 'Tunde Adeyemi', phone: '+2348034001122', avatar: 'TA', isOnline: true, zone: 'Lekki/VI', rating: 4.9, deliveriesToday: 12, deliveriesTotal: 1842, earningsKobo: 340000, vehicleType: 'bike', joinedAt: new Date('2023-03-15') },
  { id: 'r2', name: 'Emeka Nwachukwu', phone: '+2348056002233', avatar: 'EN', isOnline: true, zone: 'Yaba/Surulere', rating: 4.7, deliveriesToday: 9, deliveriesTotal: 1203, earningsKobo: 260000, vehicleType: 'bike', joinedAt: new Date('2023-07-20') },
  { id: 'r3', name: 'Seun Akinwale', phone: '+2348078003344', avatar: 'SA', isOnline: false, zone: 'Ikeja/Magodo', rating: 4.6, deliveriesToday: 0, deliveriesTotal: 987, earningsKobo: 0, vehicleType: 'bike', joinedAt: new Date('2023-11-05') },
  { id: 'r4', name: 'Biodun Oladele', phone: '+2348023004455', avatar: 'BO', isOnline: true, zone: 'Ogba/Agege', rating: 4.8, deliveriesToday: 7, deliveriesTotal: 756, earningsKobo: 195000, vehicleType: 'bike', joinedAt: new Date('2024-01-10') },
  { id: 'r5', name: 'Kayode Afolabi', phone: '+2348045005566', avatar: 'KA', isOnline: true, zone: 'Maryland/Anthony', rating: 4.5, deliveriesToday: 5, deliveriesTotal: 634, earningsKobo: 140000, vehicleType: 'car', joinedAt: new Date('2024-02-28') },
  { id: 'r6', name: 'Chijioke Nnadi', phone: '+2348067006677', avatar: 'CN', isOnline: true, zone: 'Ojodu/Berger', rating: 4.7, deliveriesToday: 8, deliveriesTotal: 521, earningsKobo: 220000, vehicleType: 'bike', joinedAt: new Date('2024-04-01') },
]

export const mockVendors: Vendor[] = [
  { id: 'v1', name: 'Mama Cass Kitchen', category: 'food', zone: 'Lekki Phase 1', isActive: true, ordersThisMonth: 312, ordersTotal: 4823, revenueKobo: 56200000, rating: 4.8, joinedAt: new Date('2022-11-01') },
  { id: 'v2', name: 'FreshMart Grocery', category: 'grocery', zone: 'Yaba', isActive: true, ordersThisMonth: 248, ordersTotal: 3610, revenueKobo: 43900000, rating: 4.6, joinedAt: new Date('2023-01-15') },
  { id: 'v3', name: 'ChopChop Fast Food', category: 'food', zone: 'Ogba', isActive: true, ordersThisMonth: 198, ordersTotal: 2940, revenueKobo: 31200000, rating: 4.5, joinedAt: new Date('2023-03-20') },
  { id: 'v4', name: 'TechZone Retail', category: 'retail', zone: 'Ikeja', isActive: true, ordersThisMonth: 156, ordersTotal: 1875, revenueKobo: 89400000, rating: 4.7, joinedAt: new Date('2023-06-10') },
  { id: 'v5', name: 'Everyday Supermart', category: 'grocery', zone: 'Maryland', isActive: true, ordersThisMonth: 134, ordersTotal: 1654, revenueKobo: 28700000, rating: 4.4, joinedAt: new Date('2023-08-05') },
  { id: 'v6', name: 'Spice Garden', category: 'food', zone: 'Lekki Phase 2', isActive: true, ordersThisMonth: 121, ordersTotal: 1432, revenueKobo: 24100000, rating: 4.9, joinedAt: new Date('2023-09-12') },
]

export const ordersChartData = [
  { week: 'W1 Jan', completed: 234, cancelled: 18 },
  { week: 'W2 Jan', completed: 289, cancelled: 22 },
  { week: 'W3 Jan', completed: 312, cancelled: 15 },
  { week: 'W4 Jan', completed: 278, cancelled: 19 },
  { week: 'W1 Feb', completed: 345, cancelled: 24 },
  { week: 'W2 Feb', completed: 398, cancelled: 28 },
  { week: 'W3 Feb', completed: 421, cancelled: 20 },
  { week: 'W4 Feb', completed: 387, cancelled: 17 },
  { week: 'W1 Mar', completed: 456, cancelled: 31 },
  { week: 'W2 Mar', completed: 512, cancelled: 27 },
  { week: 'W3 Mar', completed: 489, cancelled: 23 },
  { week: 'W4 Mar', completed: 534, cancelled: 19 },
]

export const sparklineCompleted = [
  { v: 18 }, { v: 22 }, { v: 19 }, { v: 28 }, { v: 24 }, { v: 31 }, { v: 27 }, { v: 35 },
]
export const sparklineNew = [
  { v: 5 }, { v: 8 }, { v: 6 }, { v: 11 }, { v: 9 }, { v: 7 }, { v: 13 }, { v: 15 },
]
export const sparklineRider = [
  { v: 60 }, { v: 55 }, { v: 70 }, { v: 65 }, { v: 72 }, { v: 68 }, { v: 75 }, { v: 78 },
]
export const sparklineTotal = [
  { v: 420 }, { v: 480 }, { v: 510 }, { v: 470 }, { v: 550 }, { v: 520 }, { v: 590 }, { v: 610 },
]

export const categoryData = [
  { name: 'Food', value: 40, color: '#3454d1' },
  { name: 'Grocery', value: 25, color: '#17c666' },
  { name: 'Parcel', value: 20, color: '#3dc7be' },
  { name: 'Retail', value: 10, color: '#ffa21d' },
  { name: 'Trucks', value: 5, color: '#ea4d4d' },
]

export const upcomingDeliveries = [
  { id: 'GD-102848', riderInitials: 'TA', riderName: 'Tunde Adeyemi', summary: 'Jollof rice + drinks → VI', time: '11:15 AM', category: 'food' as OrderCategory },
  { id: 'GD-102849', riderInitials: 'EN', riderName: 'Emeka Nwachukwu', summary: 'Grocery bundle → Surulere', time: '11:30 AM', category: 'grocery' as OrderCategory },
  { id: 'GD-102850', riderInitials: 'BO', riderName: 'Biodun Oladele', summary: 'Parcel (docs) → Ikeja GRA', time: '11:45 AM', category: 'parcel' as OrderCategory },
  { id: 'GD-102851', riderInitials: 'KA', riderName: 'Kayode Afolabi', summary: 'Retail electronics → Lekki', time: '12:00 PM', category: 'retail' as OrderCategory },
  { id: 'GD-102852', riderInitials: 'CN', riderName: 'Chijioke Nnadi', summary: 'ChopChop order → Berger', time: '12:15 PM', category: 'food' as OrderCategory },
]
