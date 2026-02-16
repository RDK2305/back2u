const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  // First, connect to MySQL server (without selecting database)
  const adminConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  // Add SSL configuration for Aiven cloud database
  if (process.env.DB_SSL === 'true') {
    adminConfig.ssl = {
      rejectUnauthorized: false,
    };
  }

  const adminConnection = await mysql.createConnection(adminConfig);

  let connection;
  try {
    // Check if database exists, if not create it
    const [databases] = await adminConnection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [process.env.DB_NAME]
    );
    
    if (databases.length === 0) {
      await adminConnection.query(`CREATE DATABASE ??`, [process.env.DB_NAME]);
      console.log(`Database ${process.env.DB_NAME} created`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }

    await adminConnection.end();

    // Now connect to our actual database
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    // Add SSL configuration for Aiven cloud database
    if (process.env.DB_SSL === 'true') {
      dbConfig.ssl = {
        rejectUnauthorized: false,
      };
    }

    connection = await mysql.createConnection(dbConfig);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        program VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'security')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('wallet', 'phone', 'keys', 'id', 'clothing', 'bag', 'textbook', 'electronics', 'other')),
        description TEXT,
        location_found VARCHAR(255) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        type VARCHAR(10) DEFAULT 'found' CHECK (type IN ('lost', 'found')),
        status VARCHAR(20) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Open', 'Claimed', 'Returned', 'Disposed', 'Done', 'Pending', 'Verified')),
        distinguishing_features TEXT,
        date_lost DATE,
        date_found DATE,
        image_url VARCHAR(500),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Claims table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        claimer_id INT NOT NULL,
        owner_id INT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
        verification_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("All tables created successfully!");

    // Insert sample data for testing
    const [userResult] = await connection.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userResult[0].count);
    
    if (userCount === 0) {
      await connection.query(`
        INSERT INTO users (student_id, email, first_name, last_name, campus, program, password, is_verified, role) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'S001', 'r123@conestogac.on.ca', 'Rudraksh', 'Kharadi', 'Main', 'Mobile and Web Development', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'security',
        'S002', 'bishal@conestogac.on.ca', 'Bishal', 'Paudel', 'Main', 'Web Development', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'security',
        'S003', 'maya@conestogac.on.ca', 'Maya', 'Singh', 'Waterloo', 'Business Management', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'student',
        'S004', 'alex@conestogac.on.ca', 'Alex', 'Johnson', 'Main', 'Computer Science', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'student',
        'S005', 'sarah@conestogac.on.ca', 'Sarah', 'Williams', 'Cambridge', 'Engineering', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'student',
        'S006', 'abc@conestogac.on.ca', 'Mike', 'Admin', 'Main', 'Administration', '$2a$10$MrPaz3lPm.YqJYcyumAHDu41Pabp9L8ynM1z0b/lCrA0HoDnNuktW', true, 'student'
      ]);
      console.log("Sample users inserted");
      // password is "Abc@123@" for all data 

      // Insert sample items
      await connection.query(`
        INSERT INTO items (title, category, description, location_found, campus, type, status, date_found, distinguishing_features, user_id) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'MacBook Pro 2021', 'electronics', 'Found near library, has apple sticker. Missing charger.', 'Library Building', 'Main', 'found', 'Open', '2026-02-08', 'Silver, 15-inch screen', 1,
        'Calculus Textbook', 'textbook', 'Advanced Calculus 5th Edition. Name written inside.', 'Math Lab', 'Main', 'found', 'Open', '2026-02-07', 'Blue cover with markings', 1,
        'Student ID Card', 'id', 'Blue student ID card with photo.', 'Cafeteria', 'Waterloo', 'found', 'Open', '2026-02-09', 'Laminated blue card', 3,
        'Red Backpack', 'bag', 'Red canvas backpack with stickers. Contains notebooks.', 'Parking Lot B', 'Main', 'found', 'Open', '2026-02-06', 'Canvas material with patches', 2,
        'Car Keys', 'keys', 'Ford car keys with blue keychain. Found at entrance.', 'Main Entrance', 'Main', 'found', 'Open', '2026-02-05', 'Blue rubber keychain', 4,
        'Wireless Earbuds', 'electronics', 'Apple AirPods Pro. Found in gym.', 'Gymnasium', 'Cambridge', 'found', 'Open', '2026-02-04', 'White charging case', 5,
        'Chemistry Lab Notebook', 'textbook', 'Lab notebook for CHM 201. Contains experiments.', 'Science Building', 'Main', 'found', 'Open', '2026-02-03', 'Spiral bound, black cover', 1,
        'Black Leather Jacket', 'clothing', 'XL black leather jacket. Found in lost and found.', 'Lost and Found', 'Main', 'found', 'Open', '2026-02-02', 'XL size, leather material', 6,
        'Programming Textbook', 'textbook', 'Introduction to Python - Latest Edition', 'Computer Lab', 'Main', 'found', 'Open', '2026-02-01', 'Yellow and blue cover', 2,
        'Gold Watch', 'electronics', 'Vintage gold watch. Still working.', 'Cafeteria', 'Waterloo', 'found', 'Open', '2026-01-31', 'Gold face with leather strap', 3
      ]);
      console.log("Sample items inserted");
      
      // Insert some lost items
      await connection.query(`
        INSERT INTO items (title, category, description, location_found, campus, type, status, date_lost, distinguishing_features, user_id) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'iPhone 13 Pro', 'phone', 'Lost iPhone 13 Pro, space gray color, likely near library or cafeteria', 'Library/Cafeteria Area', 'Main', 'lost', 'Reported', '2026-02-08', 'Space gray with small crack on corner', 2,
        'Canvas Messenger Bag', 'bag', 'Lost dark gray canvas messenger bag with my initials SJ embroidered', 'Computer Lab', 'Main', 'lost', 'Reported', '2026-02-07', 'Dark gray with leather straps', 4,
        'Gold Necklace', 'electronics', 'Lost gold chain necklace with small pendant in student center', 'Student Center', 'Waterloo', 'lost', 'Reported', '2026-02-06', 'Delicate gold chain, small pendant', 5
      ]);
      console.log("Sample lost items inserted");

      // Insert sample claims
      await connection.query(`
        INSERT INTO claims (item_id, claimer_id, owner_id, status, verification_notes) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
      `, [
        1, 2, 1, 'verified', 'Student verified ownership by providing AppleCare details',
        2, 3, 1, 'pending', 'Waiting for verification',
        3, 4, 3, 'verified', 'ID verified by security member',
        5, 5, 4, 'completed', 'Item handed over to claimer',
        7, 6, 1, 'rejected', 'Claimer unable to provide proof of ownership',
        4, 3, 2, 'pending', 'Initial claim submitted'
      ]);
      console.log("Sample claims inserted");
    } else {
      console.log("Database already contains data, skipping sample data insertion");
    }
  } catch (error) {
    console.error("Error setting up database:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
