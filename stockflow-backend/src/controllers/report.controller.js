const { PrismaClient } = require('@prisma/client');
const { generateInsights } = require('../services/gemini.service');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const [
      totalProducts,
      products,
      todaySalesAgg,
      monthSalesAgg,
      totalSalesAgg,
      recentSales,
    ] = await prisma.$transaction([
      prisma.product.count({ where: { userId } }),
      prisma.product.findMany({ where: { userId } }),
      prisma.sale.aggregate({
        where: {
          userId,
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { totalAmount: true, profit: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true, profit: true },
      }),
      prisma.sale.aggregate({
        where: { userId },
        _sum: { totalAmount: true, profit: true },
        _count: true,
      }),
      prisma.sale.findMany({
        where: {
          userId,
          createdAt: { gte: today },
        },
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

    const salesWithProducts = await prisma.sale.findMany({
      where: { userId },
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
    const userId = req.userId;
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const sales = await prisma.sale.findMany({
      where: {
        userId,
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
    const userId = req.userId;
    const products = await prisma.product.findMany({
      where: { userId },
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

// ========== GEMINI AI INSIGHTS ==========
exports.getAIInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get today's sales (user scoped)
    const todaySales = await prisma.sale.findMany({
      where: {
        userId,
        createdAt: { gte: today },
      },
      include: { product: true },
    });

    // Get yesterday's sales (user scoped)
    const yesterdaySales = await prisma.sale.findMany({
      where: {
        userId,
        createdAt: { gte: yesterday, lt: today },
      },
    });

    // Get all products with their last sale (user scoped)
    const products = await prisma.product.findMany({
      where: { userId },
      include: { sales: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    // Get user for currency and store name
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currency = user?.currency || '₦';

    // Calculate metrics
    const todayRevenue = todaySales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const salesChange = yesterdayRevenue > 0 
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) 
      : todayRevenue > 0 ? 100 : 0;

    const todayProfit = todaySales.reduce((sum, s) => sum + parseFloat(s.profit), 0);
    const profitMargin = todayRevenue > 0 
      ? Math.round((todayProfit / todayRevenue) * 100) 
      : 0;

    // Top products today
    const productMap = {};
    todaySales.forEach((s) => {
      if (!productMap[s.product.name]) {
        productMap[s.product.name] = { name: s.product.name, quantity: 0, revenue: 0 };
      }
      productMap[s.product.name].quantity += s.quantity;
      productMap[s.product.name].revenue += parseFloat(s.totalAmount);
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Slow products (no sales in 7 days)
    const slowProducts = products
      .filter((p) => {
        const lastSale = p.sales[0];
        if (!lastSale) return true;
        return new Date(lastSale.createdAt) < lastWeek;
      })
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        daysSinceSale: p.sales[0] 
          ? Math.floor((today - new Date(p.sales[0].createdAt)) / (1000 * 60 * 60 * 24))
          : 30,
      }));

    // Stock alerts
    const threshold = user?.lowStockThreshold || 10;
    const stockAlerts = products
      .filter((p) => p.quantity <= threshold)
      .map((p) => ({
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
      }));

    // Prepare data for Gemini
    const storeData = {
      storeName: user?.storeName || 'My Store',
      date: today.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }),
      currency,
      todayRevenue: todayRevenue.toLocaleString(),
      yesterdayRevenue: yesterdayRevenue.toLocaleString(),
      salesChange,
      todayProfit: todayProfit.toLocaleString(),
      profitMargin,
      totalProducts: products.length,
      lowStockCount: stockAlerts.length,
      topProducts,
      slowProducts,
    };

    // Get AI insights from Gemini
    const aiResponse = await generateInsights(storeData);

    res.json({
      summary: aiResponse.summary,
      salesChange,
      profitMargin,
      topProducts,
      slowProducts,
      stockAlerts,
      recommendations: aiResponse.recommendations,
      closing: aiResponse.closing,
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};