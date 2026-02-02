const { User } = require('../models');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@edumini.com';
        const adminPassword = 'admin123'; // Default password

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            // Create new admin
            await User.create({
                username: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log(`Admin user created successfully.\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

module.exports = seedAdmin;
