import { supabase } from "../config/supabaseClient.js";

// This checks that a request has a valid login token before letting it
// through to the actual route. Any route that needs to know "who is this?"
// uses this same check instead of repeating the logic every time.
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: "Invalid or expired session." });
    }

    req.user = data.user; // attach the logged-in user to the request
    next(); // let the request continue to the actual route
}