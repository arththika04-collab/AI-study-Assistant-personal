// Vercel Serverless Function Proxy
import fetch from "node-fetch";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    const { provider, prompt } = req.body;

    if (!provider || !prompt) {
        return res.status(400).json({ error: "Missing provider or prompt" });
    }

    try {
        let apiResponse;

        /* ===========================
           🔵 OPENAI HANDLER
        ============================== */
        if (provider === "openai") {
            apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4.1",
                    messages: [
                        { role: "system", content: "You are a helpful study assistant." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            const data = await apiResponse.json();
            const text = data.choices?.[0]?.message?.content || "No response.";
            return res.status(200).json({ result: text });
        }

        /* ===========================
           🟣 CLAUDE HANDLER
        ============================== */
        if (provider === "claude") {
            apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-latest",
                    max_tokens: 1000,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });

            const data = await apiResponse.json();
            const text = data.content?.[0]?.text || "No response.";
            return res.status(200).json({ result: text });
        }

        return res.status(400).json({ error: "Unknown provider" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
