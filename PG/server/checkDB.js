require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const users = await User.find({}, 'email role');
    console.log('Users in DB:');
    console.log(users);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
