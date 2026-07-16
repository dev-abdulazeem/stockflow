const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.recordSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < qty) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${product.quantity} ${product.unit}`,
      });
    }

    const sellingPrice = parseFloat(product.sellingPrice);
    const costPrice = parseFloat(product.costPrice);
    const totalAmount = sellingPrice * qty;
    const profit = (sellingPrice - costPrice) * qty;

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          productId: parseInt(productId),
          quantity: qty,
          totalAmount: totalAmount.toString(),
          profit: profit.toString(),
        },
      });

      await tx.product.update({
        where: { id: parseInt(productId) },
        data: { quantity: { decrement: qty } },
      });

      return newSale;
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    res.status(201).json({
      message: 'Sale recorded',
      sale,
      remainingStock: updatedProduct.quantity,
    });
  } catch (error) {
    console.error('Record sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate + 'T00:00:00'),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const [sales, total] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        include: {
          product: {
            select: { name: true, unit: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.sale.count({ where }),
    ]);

    res.json({
      sales,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: {
          select: { name: true, unit: true, costPrice: true, sellingPrice: true },
        },
      },
    });

    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ sale });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: sale.productId },
        data: { quantity: { increment: sale.quantity } },
      });

      await tx.sale.delete({ where: { id: parseInt(id) } });
    });

    res.json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};