const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, costPrice, sellingPrice, description } = req.body;
    
    // Handle image path
    let image = null;
    if (req.file) {
      image = req.file.path || req.file.filename;
      // If local upload, prepend server URL
      if (!image.startsWith('http')) {
        image = `http://localhost:${process.env.PORT || 5001}/uploads/${image}`;
      }
    }

    const product = await prisma.product.create({
      data: {
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
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
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
    
    let image = undefined;
    if (req.file) {
      image = req.file.path || req.file.filename;
      if (!image.startsWith('http')) {
        image = `http://localhost:${process.env.PORT || 5001}/uploads/${image}`;
      }
    }

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
      where: { quantity: { lte: threshold } },
      orderBy: { quantity: 'asc' },
    });

    res.json({ products, threshold });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};