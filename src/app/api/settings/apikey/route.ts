import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ApiKeyRequestBody {
    apiKey: string;
}

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

export async function GET() {
    try {
        // Read directly from file to get the latest value
        if (!fs.existsSync(ENV_FILE_PATH)) {
            return NextResponse.json({ apiKey: "" });
        }

        const envContent = fs.readFileSync(ENV_FILE_PATH, "utf-8");
        const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
        const apiKey = match ? match[1].trim() : "";

        return NextResponse.json({ apiKey });
    } catch (error) {
        console.error("Failed to read API key:", error);
        return NextResponse.json({ error: "Failed to read API key" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: ApiKeyRequestBody = await req.json();
        const { apiKey } = body;

        let envContent = "";
        if (fs.existsSync(ENV_FILE_PATH)) {
            envContent = fs.readFileSync(ENV_FILE_PATH, "utf-8");
        }

        // Update or append GEMINI_API_KEY
        const keyRegex = /^GEMINI_API_KEY=.*$/m;
        if (keyRegex.test(envContent)) {
            envContent = envContent.replace(keyRegex, `GEMINI_API_KEY=${apiKey}`);
        } else {
            envContent += `\nGEMINI_API_KEY=${apiKey}`;
        }

        fs.writeFileSync(ENV_FILE_PATH, envContent.trim() + "\n");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save API key:", error);
        return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
    }
}
