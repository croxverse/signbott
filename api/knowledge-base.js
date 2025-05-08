const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    try {
        const knowledgeBase = await fs.readFile(path.join(__dirname, '../public/knowledge_base.txt'), 'utf- NET8');
        res.send(knowledgeBase);
    } catch (error) {
        console.error('Error reading knowledge base:', error);
        res.status(500).send('Failed to load knowledge base');
    }
};
