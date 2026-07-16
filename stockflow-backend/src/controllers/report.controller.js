const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const [
      totalProducts,
      products,
      todaySalesAgg,
      monthSalesAgg,
      totalSalesAgg,
      recentSales,
    ] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { totalAmount: true, profit: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true, profit: true },
      }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true, profit: true },
        _count: true,
      }),
      prisma.sale.findMany({
        where: { createdAt: { gte: today } },
        include: {
          product: { select: { name: true, unit: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalStockValue = products.reduce(
      (sum, p) => sum + parseFloat(p.costPrice || 0) * p.quantity,
      0
    );

    const lowStockProducts = products.filter(
      (p) => p.quantity <= (user?.lowStockThreshold || 10)
    ).length;

    // Get top products
    const salesWithProducts = await prisma.sale.findMany({
      include: { product: { select: { name: true } } },
    });

    const productSales = {};
    salesWithProducts.forEach((s) => {
      if (!productSales[s.productId]) {
        productSales[s.productId] = { name: s.product.name, quantity: 0, totalAmount: 0 };
      }
      productSales[s.productId].quantity += s.quantity;
      productSales[s.productId].totalAmount += parseFloat(s.totalAmount);
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalProducts,
      totalStockValue,
      lowStockProducts,
      todaySales: parseFloat(todaySalesAgg._sum.totalAmount || 0),
      todayProfit: parseFloat(todaySalesAgg._sum.profit || 0),
      todaySalesCount: todaySalesAgg._count || 0,
      monthSales: parseFloat(monthSalesAgg._sum.totalAmount || 0),
      monthProfit: parseFloat(monthSalesAgg._sum.profit || 0),
      totalSales: parseFloat(totalSalesAgg._sum.totalAmount || 0),
      totalProfit: parseFloat(totalSalesAgg._sum.profit || 0),
      totalSalesCount: totalSalesAgg._count || 0,
      recentSales,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        totalAmount: p.totalAmount,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        profit: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = {};
    sales.forEach((sale) => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, sales: 0, profit: 0 };
      }
      grouped[dateKey].sales += parseFloat(sale.totalAmount);
      grouped[dateKey].profit += parseFloat(sale.profit);
    });

    const trend = Object.values(grouped);

    res.json({ trend });
  } catch (error) {
    console.error('Sales trend error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalValue = products.reduce(
      (sum, p) => sum + parseFloat(p.costPrice || 0) * p.quantity,
      0
    );

    const totalPotentialRevenue = products.reduce(
      (sum, p) => sum + parseFloat(p.sellingPrice || 0) * p.quantity,
      0
    );

    const categories = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = 0;
      categories[cat]++;
    });

    res.json({
      products,
      totalValue,
      totalPotentialRevenue,
      totalPotentialProfit: totalPotentialRevenue - totalValue,
      categories: Object.entries(categories).map(([name, count]) => ({
        name,
        count,
      })),
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};