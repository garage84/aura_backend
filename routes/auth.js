const express = require("express");
const crypto = require("crypto");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// Generate unique AURA username
async function generateUsername() {
    for (let i = 0; i < 5; i++) {
        const code = crypto
            .randomBytes(5)
            .toString("hex")
            .toUpperCase();

        const username = `aura_${code}`;

        const exists = await User.exists({ username });

        if (!exists) return username;
    }

    throw new Error("Could not generate username");
}

// Create JWT
function createToken(user) {
    return jwt.sign(
        {
            userId: user.userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || password.length < 12) {
            return res.status(400).json({
                message: "Valid email and password of at least 12 characters required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const username = await generateUsername();

        const user = new User({
            userId: randomUUID(),
            username,
            email: normalizedEmail,
            password
        });

        await user.save();

        const token = createToken(user);

        res.status(201).json({
            message: "Welcome to AURA!",
            token,
            user: {
                id: user.userId,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword = await user.comparePassword(password);

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.userId,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;
