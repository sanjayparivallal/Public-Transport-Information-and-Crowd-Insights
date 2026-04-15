const mongoose = require('mongoose');
require('dotenv').config();
const { processMessage } = require('./services/chatbotService');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  try {
    const params = {
      userId: new mongoose.Types.ObjectId().toString(),
      userRole: 'commuter',
      userName: 'Test User',
      userMessage: 'show me the details of bus from salem'
    };
    const res = await processMessage(params);
    console.log("Reply:", res.reply);
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
}
test();
