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
import db from "../db.js";

const router = express.Router();

/* =========================
   USER LOGIN (UNCHANGED)
========================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!result || result.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token, user: { id: user.id, email: user.email } });
    }
  );
});

/* =========================
   USER SIGNUP (UNCHANGED)
========================= */
router.post("/signup", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  if (!username || !email || !mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)",
        [username, email, mobile, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: "DB insert error" });
          res.status(201).json({ message: "User created" });
        }
      );
    }
  );
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
