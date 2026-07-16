import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "lib", "cases.json");

async function readCases() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeCases(cases) {
  await fs.writeFile(dbPath, JSON.stringify(cases, null, 2), "utf8");
}

export async function GET() {
  const cases = await readCases();
  return NextResponse.json({ success: true, data: cases });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const cases = await readCases();

    const newId = `CASE-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(cases.length + 1).padStart(3, "0")}`;
    const newCase = {
      id: newId,
      caller: body.caller,
      phone: body.phone || "N/A",
      animal: body.animal,
      condition: body.condition,
      priority: body.priority || "MEDIUM",
      location: body.location,
      driver: body.driver,
      status: "Assigned",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      photo: null
    };

    cases.unshift(newCase);
    await writeCases(cases);

    return NextResponse.json({ success: true, data: newCase });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status, photo } = body;
    const cases = await readCases();

    const caseIndex = cases.findIndex(c => c.id === id);
    if (caseIndex === -1) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    if (status) cases[caseIndex].status = status;
    if (photo) cases[caseIndex].photo = photo;

    await writeCases(cases);
    return NextResponse.json({ success: true, data: cases[caseIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
