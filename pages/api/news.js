const SYSTEM_PROMPT = `You are an AI news curator for a Korean fashion/commerce brand director.
Search for today's most important AI news and summarize them in Korean.
Return ONLY a valid JSON array (no markdown, no backticks, no explanation) with 6-8 items:
[{"id":1,"category":"커머스·커머스AI"|"생성AI·LLM"|"마케팅·광고AI"|"산업·비즈니스"|"정책·규제"|"툴·자동화","title":"뉴스 제목 20자 이내","summary":"1. ...\n2. ...\n3. ... 형식 3개","insight":"💡 활용방안: 실무 시사점 1문장","impact":"high"|"medium"|"low","source":"출처"}]
Focus on AI in commerce, marketing automation, generative AI tools, business adoption.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Today is ${today}. Search top AI news. Return ONLY JSON array.` }],
      }),
    });
    if (!response.ok) {
      const e = await response.text();
      return res.status(response.status).json({ error: e });
    }
    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === "text");
    if (!textBlocks.length) return res.status(500).json({ error: "No text in response" });
    const raw = textBlocks[textBlocks.length - 1].text.replace(/```json|```/g, "").trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: "Cannot parse JSON" });
    return res.status(200).json({ news: JSON.parse(match[0]) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
