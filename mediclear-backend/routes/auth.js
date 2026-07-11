import express from "express";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

// POST /auth/signup — creates a new user account
router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name }, // saved into Supabase's user_metadata
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
        message: "Signup successful.",
        user: data.user,
    });
});

// POST /auth/login — logs in an existing user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    res.status(200).json({
        message: "Login successful.",
        session: data.session,
        user: data.user,
    });
});

export default router;

// GET /auth/me — checks a token and returns the logged-in user, if valid
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: "Invalid or expired session." });
    }

    res.status(200).json({ user: data.user });
});