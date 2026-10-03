const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DeviceToken = require('./models/DeviceToken');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const tokens = await DeviceToken.find({});
  console.log('Registered Devices:', tokens.length);
  for (const t of tokens) {
    console.log(`- User: ${t.userId}, Token: ${t.token.substring(0,20)}...`);
  }
  process.exit(0);
});
