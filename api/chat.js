const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
            },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`Hyperbolic API error: ${response.status}`);
        res.json(data);
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: error.message });
    }
};
