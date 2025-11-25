import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

interface RedesignRequestBody {
    image: string;
    prompt: string;
    referenceImages?: string[];
    aspectRatio?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: RedesignRequestBody = await req.json();
        const { image, prompt, referenceImages, aspectRatio } = body;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        if (!image || !prompt) {
            return NextResponse.json(
                { error: "Image and prompt are required" },
                { status: 400 }
            );
        }

        // Remove data:image/jpeg;base64, prefix from PDF page image
        const base64Image = image.split(",")[1];

        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        // Enhance prompt for higher quality (4K) and aspect ratio
        let enhancedPrompt = `${prompt} Generate the output image in high resolution 4K quality (3840x2160 pixels or equivalent high resolution). Ensure sharp details, crisp text, and professional quality suitable for presentation.`;

        if (aspectRatio && aspectRatio !== "original") {
            enhancedPrompt += ` The output image MUST have an aspect ratio of ${aspectRatio}.`;
        }

        const contentParts: Part[] = [
            { text: enhancedPrompt },
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
        ];

        // Add reference images if provided
        if (referenceImages && referenceImages.length > 0) {
            referenceImages.forEach((refImg: string) => {
                const base64Ref = refImg.split(",")[1];
                contentParts.push({
                    inlineData: {
                        data: base64Ref,
                        mimeType: "image/jpeg",
                    }
                });
            });
            // Add instruction to use references
            contentParts[0] = { text: `${enhancedPrompt} Refer to the style of the attached reference images.` };
        }

        const result = await model.generateContent(contentParts);

        const response = await result.response;

        // Check if the response has inline data (images)
        // Note: The actual structure depends on the model's output capability.
        // If it returns an image, it might be in candidates[0].content.parts[0].inlineData
        // or it might be a text description if the model is text-only.
        // Assuming 'gemini-3-pro-image-preview' returns an image in the response.

        // Inspecting candidates for image data
        const candidates = response.candidates;
        let resultData = "";

        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    // Found an image
                    resultData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                } else if (part.text) {
                    // Fallback to text, or maybe the text IS the base64 (less likely but possible in some setups)
                    // Or maybe it returns a URL?
                    resultData = part.text;
                }
            }
        }

        if (!resultData) {
            // Fallback if standard access fails
            resultData = response.text();
        }

        return NextResponse.json({ result: resultData });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
