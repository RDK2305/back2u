const mysql = require("mysql2/promise");
require("dotenv").config();

async function insertDummyData() {
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  if (process.env.DB_SSL === "true") {
    dbConfig.ssl = {
      rejectUnauthorized: false,
    };
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get available claims
    const [claims] = await connection.query(`SELECT id FROM claims LIMIT 10`);
    if (claims.length === 0) {
      console.error("❌ No claims found in database. Please create claims first.");
      process.exit(1);
    }

    // Get available users
    const [users] = await connection.query(`SELECT id FROM users LIMIT 10`);
    if (users.length < 4) {
      console.error("❌ Not enough users in database. Need at least 4 users.");
      process.exit(1);
    }

    // Get available items
    const [items] = await connection.query(`SELECT id FROM items LIMIT 10`);
    if (items.length === 0) {
      console.error("❌ No items found in database.");
      process.exit(1);
    }

    console.log("📝 Inserting dummy messages...");
    // Clear existing messages first
    await connection.query(`DELETE FROM messages`);

    // Use actual IDs from database
    const claimId1 = claims[0].id;
    const claimId2 = claims.length > 1 ? claims[1].id : claims[0].id;
    const claimId3 = claims.length > 2 ? claims[2].id : claims[0].id;
    const userId1 = users[0].id;
    const userId2 = users[1].id;
    const userId3 = users[2].id;
    const userId4 = users[3].id;

    // Insert sample messages
    await connection.query(
      `
      INSERT INTO messages (claim_id, sender_id, receiver_id, message, \`read\`) VALUES
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)
    `,
      [
        claimId1,
        userId2,
        userId1,
        "Hi, I have the blue leather wallet you found. Can we schedule a pickup?",
        1,
        claimId1,
        userId1,
        userId2,
        "Sure! I can meet you tomorrow at 2pm at the library.",
        1,
        claimId1,
        userId2,
        userId1,
        "Perfect! See you then.",
        0,
        claimId2,
        userId3,
        userId1,
        "Do you still have the MacBook Pro?",
        0,
        claimId2,
        userId1,
        userId3,
        "Yes, it's in great condition. When can you pick it up?",
        1,
        claimId3,
        userId4,
        userId3,
        "Hello, I found your ID card. I have it with me.",
        1,
        claimId3,
        userId3,
        userId4,
        "Thank you so much! I really appreciate it. Can I get it from you?",
        0,
      ],
    );
    console.log(`✅ Sample messages inserted (7 messages using claim IDs: ${claimId1}, ${claimId2}, ${claimId3})`);

    console.log("📝 Inserting dummy notifications...");
    // Clear existing notifications first
    await connection.query(`DELETE FROM notifications`);

    const itemId1 = items[0].id;
    const itemId2 = items.length > 1 ? items[1].id : items[0].id;
    const itemId3 = items.length > 2 ? items[2].id : items[0].id;

    // Insert sample notifications
    await connection.query(
      `
      INSERT INTO notifications (user_id, type, title, message, related_item_id, related_claim_id, \`read\`) VALUES
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId1,
        "claim_submission",
        "🔍 New Claim on Your Item",
        "Someone has claimed your item",
        itemId1,
        claimId1,
        1,
        userId1,
        "claim_submission",
        "🔍 New Claim on Your Item",
        "Someone has claimed another item",
        itemId2,
        claimId2,
        1,
        userId3,
        "claim_submission",
        "🔍 New Claim on Your Item",
        "Someone has claimed your item",
        itemId3,
        claimId3,
        0,
        userId2,
        "claim_approved",
        "✅ Claim Approved",
        "Your claim has been approved!",
        itemId1,
        claimId1,
        1,
        userId4,
        "message",
        "💬 New Message",
        "You have a new message about a claim",
        itemId3,
        claimId3,
        0,
        userId3,
        "claim_rejected",
        "❌ Claim Rejected",
        "Your claim could not be verified",
        itemId2,
        claimId2,
        1,
      ],
    );
    console.log(`✅ Sample notifications inserted (6 notifications)`);

    console.log("\n🎉 All dummy data inserted successfully!");
    console.log("\n📊 Dummy Data Summary:");
    console.log("   ✓ 7 sample messages (for claim communication)");
    console.log("   ✓ 6 sample notifications (for alert testing)");
    console.log("\n💡 Test Users (still available):");
    console.log("   Security Staff: r123@conestogac.on.ca / Abc@123@");
    console.log("   Student 1:      maya@conestogac.on.ca / Abc@123@");
    console.log("   Student 2:      alex@conestogac.on.ca / Abc@123@");
    console.log("   Student 3:      sarah@conestogac.on.ca / Abc@123@");
    console.log("\n🎯 Next Steps:");
    console.log("   1. Start the server: npm start");
    console.log("   2. Login to test accounts");
    console.log("   3. View My Claims to see messages");
    console.log("   4. Check notifications on Dashboard");
  } catch (error) {
    console.error("❌ Error inserting dummy data:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

insertDummyData();
