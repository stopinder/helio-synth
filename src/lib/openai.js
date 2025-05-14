// src/lib/openai.js

export async function fetchAIResponse(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages
        })
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('❌ OpenAI API error:', data)
        return '⚠️ Assistant could not respond.'
    }

    return data.choices?.[0]?.message?.content || '⚠️ No reply received.'
}
