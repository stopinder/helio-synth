export async function fetchAIResponseStream(messages, onChunk) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            stream: true,
        }),
    })

    if (!res.ok) {
        const error = await res.text()
        console.error("❌ OpenAI error:", res.status, error)
        return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let fullText = ""

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter(line => line.trim().startsWith("data:"))

        for (const line of lines) {
            const json = line.replace(/^data: /, "")
            if (json === "[DONE]") return

            try {
                const parsed = JSON.parse(json)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                    fullText += content
                    onChunk(fullText)
                }
            } catch (err) {
                console.error("❌ Error parsing stream:", err)
            }
        }
    }
}

