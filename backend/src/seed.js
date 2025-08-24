const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Цветочный мёд',
    description: 'Нежный мёд с ароматом полевых цветов. Собран с разнотравья в экологически чистом районе.',
    price: 650,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 50
  },
  {
    name: 'Липовый мёд',
    description: 'Ароматный мёд с насыщенным вкусом липы. Обладает целебными свойствами при простудных заболеваниях.',
    price: 750,
    image: 'https://images.unsplash.com/photo-1558583055-d7ac93557d05?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 30
  },
  {
    name: 'Гречишный мёд',
    description: 'Тёмный мёд с характерным вкусом гречихи. Богат железом и полезными микроэлементами.',
    price: 700,
    image: 'https://images.unsplash.com/photo-1555878453-4efd73c9640f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 40
  },
  {
    name: 'Акациевый мёд',
    description: 'Светлый мёд с нежным ароматом акации. Долго не кристаллизуется, подходит для детей.',
    price: 800,
    image: 'https://images.unsplash.com/photo-1582993728550-c3c3d51c4e08?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Горный мёд',
    description: 'Собран в горных районах с альпийских лугов. Обладает богатым вкусом и ароматом горных трав.',
    price: 900,
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 20
  },
  {
    name: 'Каштановый мёд',
    description: 'Темный мёд с ярким характерным вкусом. Богат минералами и антиоксидантами.',
    price: 850,
    image: 'https://images.unsplash.com/photo-1600657644140-aa5b5fd2b3c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: 15
  }
];

const seedDB = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect('mongodb://honey:password123@mongodb:27017/honey_shop?authSource=admin');
    console.log('Connected to MongoDB');

    // Очистка существующих продуктов
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Добавление новых продуктов
    const createdProducts = await Product.insertMany(products);
    console.log(`Added ${createdProducts.length} products`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
