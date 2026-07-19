const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: build image URL from multer file
const buildImageUrl = (file) => {
  if (!file) return null;
  const image = file.path || file.filename;
  if (image.startsWith('http')) return image;
  return `http://localhost:${process.env.PORT || 5001}/uploads/${image}`;
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, costPrice, sellingPrice, description } = req.body;
    const userId = req.userId; // from auth middleware

    const productCount = await prisma.product.count({ where: { userId } });
    if (productCount >= 200) {
      return res.status(403).json({ message: 'Product limit reached (200). Upgrade to add more.' });
    }

    const image = buildImageUrl(req.file);

    const product = await prisma.product.create({
      data: {
        userId,
        name,
        category: category || 'Uncategorized',
        quantity: parseInt(quantity) || 0,
        unit: unit || 'pieces',
        costPrice: costPrice.toString(),
        sellingPrice: sellingPrice.toString(),
        description: description || null,
        image,
      },
    });

    res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id), userId: req.userId },
      include: { sales: { orderBy: { createdAt: 'desc' } } },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, costPrice, sellingPrice, description } = req.body;
    const userId = req.userId;

    // Verify ownership before updating
    const existing = await prisma.product.findFirst({
      where: { id: parseInt(id), userId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = req.file ? buildImageUrl(req.file) : undefined;

    const data = {
      name,
      category: category || 'Uncategorized',
      quantity: parseInt(quantity) || 0,
      unit: unit || 'pieces',
      costPrice: costPrice?.toString(),
      sellingPrice: sellingPrice?.toString(),
      description: description || null,
    };
    if (image) data.image = image;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership before deleting
    const existing = await prisma.product.findFirst({
      where: { id: parseInt(id), userId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const threshold = user?.lowStockThreshold || 10;

    const products = await prisma.product.findMany({
      where: {
        userId: req.userId,
        quantity: { lte: threshold },
      },
      orderBy: { quantity: 'asc' },
    });

    res.json({ products, threshold });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};