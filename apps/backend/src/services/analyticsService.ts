import { prisma } from '../lib/prisma';
import { Prisma, OrderStatus } from '@prisma/client';

export type Granularity = 'day' | 'week' | 'month';

interface DateRange {
  from: Date;
  to: Date;
}

type DailyRow = { date: string; orders: bigint; revenue_kobo: bigint };
type TopProductRow = { name: string; order_count: bigint; revenue_kobo: bigint };
type TopVendorRow = { vendorId: string; orders: bigint; revenue_kobo: bigint };
type NewUserRow = { date: string; new_users: bigint };

export async function getVendorAnalytics(vendorId: string, { from, to }: DateRange) {
  const where: Prisma.OrderWhereInput = {
    vendorId,
    createdAt: { gte: from, lte: to },
  };

  const [statusGroups, revenueResult] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.order.aggregate({
      where: { ...where, paymentStatus: 'PAID' },
      _sum: { subtotalKobo: true },
      _avg: { subtotalKobo: true },
    }),
  ]);

  const totalOrders = statusGroups.reduce((s, g) => s + g._count._all, 0);
  const completedOrders = statusGroups.find(g => g.status === OrderStatus.DELIVERED)?._count._all ?? 0;
  const cancelledOrders = statusGroups.find(g => g.status === OrderStatus.CANCELLED)?._count._all ?? 0;
  const totalRevenueKobo = revenueResult._sum.subtotalKobo ?? 0;
  const avgOrderValueKobo = Math.floor(revenueResult._avg.subtotalKobo ?? 0);

  const [dailyRows, productRows] = await Promise.all([
    prisma.$queryRaw<DailyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS orders,
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "subtotalKobo" ELSE 0 END), 0)::bigint AS revenue_kobo
      FROM "Order"
      WHERE "vendorId" = ${vendorId}
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
      ORDER BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
    `,
    prisma.$queryRaw<TopProductRow[]>`
      SELECT
        oi.name,
        COUNT(*)::bigint AS order_count,
        COALESCE(SUM(oi."totalKobo"), 0)::bigint AS revenue_kobo
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."vendorId" = ${vendorId}
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY oi.name
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
  ]);

  return {
    summary: { totalOrders, completedOrders, cancelledOrders, totalRevenueKobo, avgOrderValueKobo },
    ordersByStatus: statusGroups.map(g => ({ status: g.status, count: g._count._all })),
    revenueByDay: dailyRows.map(r => ({
      date: r.date,
      orders: Number(r.orders),
      revenueKobo: Number(r.revenue_kobo),
    })),
    topProducts: productRows.map(r => ({
      name: r.name,
      orders: Number(r.order_count),
      revenueKobo: Number(r.revenue_kobo),
    })),
  };
}

export async function getSystemAnalytics({ from, to }: DateRange) {
  const orderWhere: Prisma.OrderWhereInput = { createdAt: { gte: from, lte: to } };

  const [totalUsers, newUsers, vendorStatusGroups, statusGroups, typeGroups, revenueResult] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.vendor.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.groupBy({ by: ['status'], where: orderWhere, _count: { _all: true } }),
      prisma.order.groupBy({
        by: ['type'],
        where: orderWhere,
        _count: { _all: true },
        _sum: { totalKobo: true },
      }),
      prisma.order.aggregate({
        where: { ...orderWhere, paymentStatus: 'PAID' },
        _sum: { totalKobo: true },
      }),
    ]);

  const totalVendors = vendorStatusGroups.reduce((s, g) => s + g._count._all, 0);
  const activeVendors = vendorStatusGroups.find(g => g.status === 'APPROVED')?._count._all ?? 0;
  const pendingVendors = vendorStatusGroups.find(g => g.status === 'PENDING')?._count._all ?? 0;
  const totalOrders = statusGroups.reduce((s, g) => s + g._count._all, 0);
  const completedOrders = statusGroups.find(g => g.status === OrderStatus.DELIVERED)?._count._all ?? 0;
  const totalRevenueKobo = revenueResult._sum.totalKobo ?? 0;

  const [dailyRows, vendorRows] = await Promise.all([
    prisma.$queryRaw<DailyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS orders,
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "totalKobo" ELSE 0 END), 0)::bigint AS revenue_kobo
      FROM "Order"
      WHERE "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
      ORDER BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
    `,
    prisma.$queryRaw<TopVendorRow[]>`
      SELECT
        "vendorId",
        COUNT(*)::bigint AS orders,
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "totalKobo" ELSE 0 END), 0)::bigint AS revenue_kobo
      FROM "Order"
      WHERE "vendorId" IS NOT NULL
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY "vendorId"
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
  ]);

  const vendorIds = vendorRows.map(r => r.vendorId);
  const vendorDetails = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, name: true, type: true, rating: true },
  });
  const vendorMap = new Map(vendorDetails.map(v => [v.id, v]));

  return {
    summary: {
      totalUsers,
      newUsers,
      totalVendors,
      activeVendors,
      pendingVendors,
      totalOrders,
      completedOrders,
      totalRevenueKobo,
    },
    ordersByStatus: statusGroups.map(g => ({ status: g.status, count: g._count._all })),
    ordersByType: typeGroups.map(g => ({
      type: g.type,
      count: g._count._all,
      revenueKobo: g._sum.totalKobo ?? 0,
    })),
    revenueByDay: dailyRows.map(r => ({
      date: r.date,
      orders: Number(r.orders),
      revenueKobo: Number(r.revenue_kobo),
    })),
    topVendors: vendorRows.map(r => {
      const v = vendorMap.get(r.vendorId);
      return {
        id: r.vendorId,
        name: v?.name ?? 'Unknown',
        type: v?.type ?? null,
        rating: v?.rating ?? 0,
        orders: Number(r.orders),
        revenueKobo: Number(r.revenue_kobo),
      };
    }),
  };
}

export async function getVendorGraphData(
  vendorId: string,
  { from, to }: DateRange,
  granularity: Granularity
) {
  const gran = Prisma.raw(`'${granularity}'`);

  const rows = await prisma.$queryRaw<DailyRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
      COUNT(*)::bigint AS orders,
      COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "subtotalKobo" ELSE 0 END), 0)::bigint AS revenue_kobo
    FROM "Order"
    WHERE "vendorId" = ${vendorId}
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
    ORDER BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
  `;

  return {
    granularity,
    points: rows.map(r => ({
      date: r.date,
      orders: Number(r.orders),
      revenueKobo: Number(r.revenue_kobo),
    })),
  };
}

export async function getSystemGraphData({ from, to }: DateRange, granularity: Granularity) {
  const gran = Prisma.raw(`'${granularity}'`);

  const [orderRows, userRows] = await Promise.all([
    prisma.$queryRaw<DailyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS orders,
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "totalKobo" ELSE 0 END), 0)::bigint AS revenue_kobo
      FROM "Order"
      WHERE "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
      ORDER BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
    `,
    prisma.$queryRaw<NewUserRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS new_users
      FROM "User"
      WHERE "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
      ORDER BY DATE_TRUNC(${gran}, "createdAt" AT TIME ZONE 'Africa/Lagos')
    `,
  ]);

  const map = new Map<string, { date: string; orders: number; revenueKobo: number; newUsers: number }>();

  for (const r of orderRows) {
    map.set(r.date, { date: r.date, orders: Number(r.orders), revenueKobo: Number(r.revenue_kobo), newUsers: 0 });
  }

  for (const r of userRows) {
    const pt = map.get(r.date);
    if (pt) {
      pt.newUsers = Number(r.new_users);
    } else {
      map.set(r.date, { date: r.date, orders: 0, revenueKobo: 0, newUsers: Number(r.new_users) });
    }
  }

  return {
    granularity,
    points: Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
