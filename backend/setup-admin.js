const mongoose = require("mongoose");
const User = require("./src/models/User");

const setupAdmin = async () => {
  try {
    await mongoose.connect("mongodb://honey:password123@localhost:27017/honey_shop?authSource=admin");
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Администратор уже существует в системе");
      console.log("Email:", existingAdmin.email);
      process.exit(0);
    }

    const adminUser = new User({
      email: "admin@honey.com",
      password: "admin123",
      role: "admin"
    });

    await adminUser.save();
    console.log("Первый администратор успешно создан!");
    console.log("Email: admin@honey.com");
    console.log("Пароль: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Ошибка при создании администратора:", error);
    process.exit(1);
  }
};

setupAdmin();
