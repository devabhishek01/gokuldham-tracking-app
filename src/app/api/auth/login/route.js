import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "gokuldham_secret_fallback";
const COOKIE_NAME = "auth_token";

export async function POST(req) {
  try {
    const body = await req.json();
    const { role, email, password, vehicleInput } = body;

    if (!role || !password) {
      return NextResponse.json(
        { success: false, error: "Role and password are required" },
        { status: 400 }
      );
    }

    let user = null;

    if (role === "DRIVER") {
      // Driver login: match by vehicle plate number (e.g. HR-55-1001, HR551001), ambulance number, or vehicle_name
      if (!vehicleInput) {
        return NextResponse.json(
          { success: false, error: "Vehicle plate or ambulance number is required" },
          { status: 400 }
        );
      }

      const rawInput = vehicleInput.trim();
      const cleanInput = rawInput.toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "hr551001" or "ambulance01" or "1"

      const digitsOnly = rawInput.match(/^\d+$/);
      const ambNum = digitsOnly ? parseInt(digitsOnly[0], 10) : null;
      const ambPadded = ambNum ? `Ambulance ${String(ambNum).padStart(2, "0")}` : null;

      const result = await query(
        `SELECT u.*, 
                COALESCE(d.plate, a.registration, u.vehicle_name) as plate_no,
                COALESCE(d.name, u.name) as driver_display_name
         FROM users u
         LEFT JOIN drivers d ON (
           LOWER(d.vehicle_name) = LOWER(u.vehicle_name)
           OR d.ambulance_number::text = REPLACE(LOWER(u.vehicle_name), 'ambulance ', '')
         )
         LEFT JOIN ambulances a ON (
           LOWER(a.vehicle_name) = LOWER(u.vehicle_name)
           OR a.ambulance_number::text = REPLACE(LOWER(u.vehicle_name), 'ambulance ', '')
         )
         WHERE u.role = 'DRIVER'
           AND (
             LOWER(u.vehicle_name) = LOWER($1)
             OR ( $2::text IS NOT NULL AND LOWER(u.vehicle_name) = LOWER($2) )
             OR ( d.plate IS NOT NULL AND LOWER(REPLACE(d.plate, '-', '')) = $3 )
             OR ( a.registration IS NOT NULL AND LOWER(REPLACE(a.registration, '-', '')) = $3 )
             OR ( d.ambulance_number::text = $1 )
             OR ( a.ambulance_number::text = $1 )
           )
         LIMIT 1`,
        [rawInput, ambPadded, cleanInput]
      );
      user = result.rows[0];
    } else {
      // Admin / Telecaller login: match by email + role
      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email is required" },
          { status: 400 }
        );
      }
      const result = await query(
        "SELECT * FROM users WHERE email = $1 AND role = $2",
        [email.toLowerCase().trim(), role]
      );
      user = result.rows[0];
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your details." },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password." },
        { status: 401 }
      );
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      name: user.name,
      role: user.role,
      email: user.email || null,
      vehicleName: user.vehicle_name || null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
      vehicleName: user.vehicle_name || null,
    });
  } catch (err) {
    console.error("[Auth Login Error]", err.message);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
