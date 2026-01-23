import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // No authorization header
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Invalid header format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtErr) {
      console.log("JWT verification failed:", jwtErr.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
}
