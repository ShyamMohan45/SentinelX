// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import db from "../db.js";

// const router = express.Router();

// router.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   console.log("[AUTH] /login request body:", req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   db.query(
//     "SELECT * FROM users WHERE email = ?",
//     [email],
//     async (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: "DB error" });
//       }
//       if (!result || result.length === 0) {
//         return res.status(401).json({ message: "User not found" });
//       }

//       const user = result[0];
//       let isMatch = false;
//       try {
//         isMatch = await bcrypt.compare(password, user.password);
//       } catch (e) {
//         return res.status(500).json({ message: "Password check error" });
//       }

//       if (!isMatch) {
//         return res.status(401).json({ message: "Invalid password" });
//       }

//       let token = null;
//       try {
//         token = jwt.sign(
//           { id: user.id },
//           process.env.JWT_SECRET,
//           { expiresIn: "1d" }
//         );
//       } catch (e) {
//         return res.status(500).json({ message: "Token generation error" });
//       }

//       return res.json({ token, user: { id: user.id, email: user.email } });
//     }
//   );
// });

// // Signup route
// router.post("/signup", async (req, res) => {
//   const { username, email, mobile, password } = req.body;
//   console.log("[AUTH] /signup request body:", req.body);
//   if (!username || !email || !mobile || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//   // Check if user already exists
//   db.query(
//     "SELECT * FROM users WHERE email = ?",
//     [email],
//     async (err, result) => {
//       if (err) return res.status(500).json({ message: "DB error" });
//       if (result && result.length > 0) {
//         return res.status(409).json({ message: "User already exists" });
//       }
//       // Hash password
//       let hashedPassword;
//       try {
//         hashedPassword = await bcrypt.hash(password, 10);
//       } catch (e) {
//         return res.status(500).json({ message: "Password hash error" });
//       }
//       // Insert user
//       db.query(
//         "INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)",
//         [username, email, mobile, hashedPassword],
//         (err, result) => {
//           if (err) return res.status(500).json({ message: "DB insert error" });
//           return res.status(201).json({ message: "User created" });
//         }
//       );
//     }
//   );
// });

// export default router;
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, "../users.json");

const router = express.Router();

/* =========================
   USER LOGIN (MODIFIED FOR JSON)
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request received for:", email);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    console.log("Users loaded:", users.length);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("User found:", user);
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      console.error("Bcrypt compare error:", e);
      throw e;
    }
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("Signing token for user:", user.id);
    let token;
    try {
      token = jwt.sign(
        { id: user.id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
    } catch (e) {
      console.error("JWT sign error:", e);
      throw e;
    }

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   USER SIGNUP (MODIFIED FOR JSON)
========================= */
router.post("/signup", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  if (!username || !email || !mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      mobile,
      password: hashedPassword
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   🔐 ADMIN LOGIN (NEW)
========================= */
router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

export default router;
