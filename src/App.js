fetch('/api/knowledge-base')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('Knowledge base loaded:', data);
        setKnowledgeBase(JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('Fetch error:', error);
        setError('Failed to load knowledge base. Using fallback.');
        setKnowledgeBase(FALLBACK_KNOWLEDGE_BASE);
    });
