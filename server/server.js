import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set in .env");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// ============================
// Helpers
// ============================

function sanitizeBase64(b64) {
    if (!b64 || typeof b64 !== "string") return b64;

    const commaIdx = b64.indexOf(",");
    if (b64.startsWith("data:") && commaIdx !== -1) {
        b64 = b64.slice(commaIdx + 1);
    }

    b64 = b64.replace(/\s+/g, "");

    const mod = b64.length % 4;
    if (mod === 1) b64 = b64.slice(0, -1);
    else if (mod === 2) b64 += "==";
    else if (mod === 3) b64 += "=";

    return b64;
}


// ============================
// AI PHOTOSHOOT PROMPT (FULL)
// ============================

function buildAiPhotoshootPrompt({
    model_type = "Indian Female",
    background_style = "Studio",
    category = "Upper Body",
    extra_prompt,
}) {
    const bgMap = {
        studio: "a neutral studio background with soft studio lights",
        urban: "an urban street environment with shallow depth of field",
        nature: "an outdoor natural environment with greenery and soft, diffused daylight",
        outdoor: "an outdoor natural environment with greenery and soft, diffused daylight",
        beach: "a bright beach environment with natural sunlight",
    };

    const bgKey = (background_style || "studio").trim().toLowerCase();
    const backgroundPhrase =
        bgMap[bgKey] || background_style || "a studio background";

    model_type = (model_type || "Indian Female").trim();
    category = (category || "Upper Body").trim();

    const promptParts = [
        `Create a full-body, head-to-toe, hyper-realistic e-commerce fashion photo of an ${model_type} model wearing the exact garment shown in the provided image.`,
        "Include the entire person in frame from head to toe — do NOT crop at knees or waist.",
        "Preserve the garment's fabric texture, prints, embroidery, embellishments, and colors exactly.",
        `Place the model in ${backgroundPhrase}. Match realistic lighting, shadows and perspective so the garment appears naturally worn.`,
        "Keep the model's pose natural and confident; maintain realistic body proportions and natural occlusion (hair, hands should occlude clothing where appropriate).",
        `Garment category: ${category}.`,
        "Produce a studio-quality, photorealistic, full-body image suitable for e-commerce (no text, watermarks, or extra accessories).",
    ];

    if (extra_prompt) {
        const safeExtra = extra_prompt.replace(/[^\x20-\x7E]/g, "").slice(0, 800);
        promptParts.push("Additional instructions: " + safeExtra);
    }

    promptParts.push(
        "Prefer a vertical (portrait) composition that shows the model's full body with feet visible."
    );

    return promptParts.join(" ");
}


// ============================
// VIRTUAL TRY-ON PROMPT (FULL)
// ============================

function buildVirtualTryonPrompt({
    garment_type,
    garment_orientation,
    extra_prompt,
}) {
    let sourceDesc = "the provided garment image";

    if (garment_orientation) {
        const o = garment_orientation.toLowerCase();
        if (["flatlay", "flat"].includes(o))
            sourceDesc = "the garment shown on a flat lay";
        else if (["hanger"].includes(o))
            sourceDesc = "the garment shown on a hanger";
        else if (["mannequin", "mannequin-style"].includes(o))
            sourceDesc = "the garment shown on a mannequin";
        else if (["on-person", "person", "worn"].includes(o))
            sourceDesc = "the garment shown worn by another person";
    }

    const gtype = garment_type ? `Garment type: ${garment_type}.` : "";

    let prompt = `
Generate a single, high-resolution, photorealistic image of the reference person wearing the garment shown in ${sourceDesc}.

This instruction applies to any garment type — ethnic wear, western wear, formal, casual, or multi-layered outfits.

${gtype}

**1. Garment Fidelity**
- Recreate the garment exactly as shown in the garment image, preserving all colors, prints, embroidery, embellishments, textures, and folds.
- Keep hue and saturation identical to the garment image. Adjust only brightness and contrast to match the person's lighting.
- Preserve garment proportions — do not distort or crop parts of the clothing.

**2. Full-Body Composition**
- Include the entire visible body of the person, from head to toe, in the frame.
- Keep both hands, arms, and feet visible as per the reference person’s posture.
- Do NOT crop or zoom in on the garment — maintain the original framing and proportions of the person image.
- If the person image already shows full body, reproduce it entirely without truncation.

**3. Realism & Fit**
- The garment must fit the person naturally with correct alignment on shoulders, waist, and sleeves.
- Hair, hands, and arms must correctly overlap the garment where natural (occlusion should be realistic).
- Simulate natural fabric behavior: drape, folds, and stretch consistent with body pose and gravity.

**4. Lighting & Scene Consistency**
- Match the lighting direction, temperature, and shadow softness of the person image.
- Adjust garment luminance only for realistic blending; do not alter hue or material properties.
- Preserve material-specific properties like silk sheen, cotton matte, denim weave, chiffon translucency.

**5. Background & Person Integrity**
- Keep the original person’s face, body shape, pose, and background intact.
- Do NOT modify the person's face, head, or neck in any way. Preserve identity, facial features, expression, eye gaze, hairline, and skin tone EXACTLY as in the person reference image.
- No background replacement unless explicitly needed for realism.
- No text, watermark, accessories, or extra props.

**6. Output Requirements**
- Output should look like a professional e-commerce fashion photo.
- Maintain full-body composition, photorealistic quality, and proper lighting harmony.
- Return a single PNG or JPEG image only.
`;

    if (extra_prompt) {
        prompt += "\nAdditional instructions: " + extra_prompt;
    }

    return prompt;
}


// ============================
// Gemini Call
// ============================

async function callGemini(images, prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
            ...images.map((b64) => ({
                inlineData: {
                    mimeType: "image/png",
                    data: b64,
                },
            })),
            { text: prompt },
        ],
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No image returned from Gemini");
}


// ============================
// AI Photoshoot Endpoint
// ============================

app.post("/api/ai-photoshoot", async (req, res) => {
    try {
        const payload = { ...req.body };

        payload.garment_image = sanitizeBase64(payload.garment_image);

        const prompt = buildAiPhotoshootPrompt(payload);

        const imageBase64 = await callGemini(
            [payload.garment_image],
            prompt
        );

        return res.json({
            success: true,
            result_image: `data:image/png;base64,${imageBase64}`,
        });
    } catch (err) {
        console.error("AI Photoshoot error:", err);
        return res.status(500).json({ error: "AI Photoshoot failed" });
    }
});


// ============================
// Virtual Try-On Endpoint
// ============================

app.post("/api/virtual-tryon", async (req, res) => {
    try {
        const payload = { ...req.body };

        payload.user_image = sanitizeBase64(payload.user_image);
        payload.garment_image = sanitizeBase64(payload.garment_image);

        const prompt = buildVirtualTryonPrompt(payload);

        const imageBase64 = await callGemini(
            [payload.user_image, payload.garment_image],
            prompt
        );

        return res.json({
            success: true,
            result_image: `data:image/png;base64,${imageBase64}`,
        });
    } catch (err) {
        console.error("Virtual Try-On error:", err);
        return res.status(500).json({ error: "Virtual Try-On failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
