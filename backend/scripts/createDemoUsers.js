// Script to create demo users for testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@campus.edu',
    password: 'password',
    role: 'admin',
  },
  {
    name: 'Tech Support',
    email: 'tech@campus.edu',
    password: 'password',
    role: 'technician',
  },
  {
    name: 'John Student',
    email: 'student@campus.edu',
    password: 'password',
    role: 'student',
    studentId: 'S123456',
    phone: '555-0123',
    dormitory: 'Dorm A',
  },
];

const createDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nYou can now login with:');
    console.log('Admin: admin@campus.edu / password');
    console.log('Technician: tech@campus.edu / password');
    console.log('Student: student@campus.edu / password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createDemoUsers();

