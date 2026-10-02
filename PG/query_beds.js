const mongoose = require('mongoose');
const Bed = require('./smart-pg-hostel-management/backend/src/models/Bed');

mongoose.connect('mongodb+srv://harshpanchal0321:3iR0P2yYwUeD70o9@cluster0.b0gta.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })
  .then(async () => {
    const beds = await Bed.find().limit(5);
    console.log(beds.map(b => b.label));
    process.exit(0);
  });
