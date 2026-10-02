const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PG = require('../models/PG');
const User = require('../models/User');

const MONGO_URI = 'mongodb://Harsh_admin:ZG1kHQrz9GetaO7X@ac-yzxqiwm-shard-00-00.zwhyi2r.mongodb.net:27017,ac-yzxqiwm-shard-00-01.zwhyi2r.mongodb.net:27017,ac-yzxqiwm-shard-00-02.zwhyi2r.mongodb.net:27017/smart-pg?ssl=true&replicaSet=atlas-epydum-shard-0&authSource=admin&retryWrites=true&w=majority';


const locations = [
  { city: 'Ahmedabad', state: 'Gujarat', pin: '380015' },
  { city: 'Hyderabad', state: 'Telangana', pin: '500081' },
  { city: 'Bangalore', state: 'Karnataka', pin: '560100' },
  { city: 'Pune', state: 'Maharashtra', pin: '411057' },
  { city: 'Delhi', state: 'Delhi', pin: '110021' }
];

const adjectives = ['Premium', 'Luxury', 'Comfort', 'Elite', 'Prime', 'Royal', 'Zen', 'Nexus', 'Aura', 'Metro'];
const names = ['Residency', 'Homes', 'Coliving', 'Nest', 'Stay', 'Abode', 'Hub', 'Living', 'Haven', 'Space'];
const amenitiesList = ['High-Speed WiFi', 'AC Rooms', 'Attached Bathroom', 'Laundry', 'Meals Included', 'Gym', 'CCTV', 'Power Backup', 'Cleaning Service', 'Game Room'];

const generateSamplePGs = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Create a dummy owner user if it doesn't exist
    let owner = await User.findOne({ email: 'pgowner@example.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Demo Owner',
        email: 'pgowner@example.com',
        phone: '9999999999',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'ADMIN'
      });
    }

    let createdCount = 0;

    for (const loc of locations) {
      // Create 5 to 8 PGs per location
      const count = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < count; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const nom = names[Math.floor(Math.random() * names.length)];
        const pgName = `${adj} ${nom} PG`;
        
        // Pick 4-6 random amenities
        const shuffledAmenities = [...amenitiesList].sort(() => 0.5 - Math.random());
        const selectedAmenities = shuffledAmenities.slice(0, Math.floor(Math.random() * 3) + 4);

        await PG.create({
          name: pgName,
          address: {
            street: `Plot ${Math.floor(Math.random() * 100) + 1}, Sector ${Math.floor(Math.random() * 20) + 1}`,
            city: loc.city,
            state: loc.state,
            pincode: loc.pin
          },
          contact: {
            phone: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
            email: `contact@${pgName.toLowerCase().replace(/\s/g, '')}.com`
          },
          amenities: selectedAmenities,
          ownerId: owner._id,
          photos: []
        });
        createdCount++;
      }
    }
    
    console.log(`Successfully created ${createdCount} sample PGs!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding PGs:', err);
    process.exit(1);
  }
};

generateSamplePGs();
