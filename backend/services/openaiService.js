const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate flashcards from text content using OpenAI
 * @param {string} content - The text content to generate flashcards from
 * @param {object} options - Generation options
 * @returns {Promise<Array>} - Array of flashcard objects
 */
const generateFlashcards = async (content, options = {}) => {
    try {
        const {
            cardCount = 10,
            difficulty = 'medium',
            subject = '',
            customPrompt = ''
        } = options;

        // Build the prompt based on options
        let prompt = `You are an expert educator creating flashcards. Generate ${cardCount} high-quality flashcards from the following content.

Requirements:
- Create exactly ${cardCount} flashcards
- Difficulty level: ${difficulty}
- Each flashcard should have a clear question and a comprehensive answer
- Focus on key concepts, definitions, and important facts
- Make questions specific and answers informative
- Avoid overly simple yes/no questions
- Include diverse question types (what, how, why, when, etc.)`;

        if (subject) {
            prompt += `\n- Subject focus: ${subject}`;
        }

        if (customPrompt) {
            prompt += `\n- Additional instructions: ${customPrompt}`;
        }

        prompt += `\n\nContent to study:\n${content}

Please respond with a JSON array of flashcards in this exact format:
[
  {
    "question": "Your question here",
    "answer": "Your detailed answer here",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]

Make sure the response is valid JSON with exactly ${cardCount} flashcards.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert educator who creates high-quality educational flashcards. Always respond with valid JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4000,
            temperature: 0.7
        });

        const flashcardText = response.choices[0].message.content.trim();
        
        // Try to parse the JSON response
        let flashcards;
        try {
            flashcards = JSON.parse(flashcardText);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', parseError);
            console.error('OpenAI response:', flashcardText);
            
            // Fallback: try to extract JSON from the response
            const jsonMatch = flashcardText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('OpenAI response is not valid JSON format');
            }
        }

        // Validate the response structure
        if (!Array.isArray(flashcards)) {
            throw new Error('OpenAI response is not an array');
        }

        // Ensure each flashcard has required fields
        const validatedFlashcards = flashcards.map((card, index) => {
            if (!card.question || !card.answer) {
                throw new Error(`Flashcard ${index + 1} is missing question or answer`);
            }

            return {
                question: card.question.trim(),
                answer: card.answer.trim(),
                difficulty: card.difficulty || difficulty,
                tags: Array.isArray(card.tags) ? card.tags : []
            };
        });

        // Ensure we have the right number of cards
        if (validatedFlashcards.length !== cardCount) {
            console.warn(`Expected ${cardCount} flashcards, got ${validatedFlashcards.length}`);
        }

        return validatedFlashcards.slice(0, cardCount); // Take only the requested number

    } catch (error) {
        console.error('OpenAI Service Error:', error);
        
        // Provide more specific error messages
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing.');
        } else if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key.');
        } else if (error.message.includes('JSON')) {
            throw new Error('Failed to generate properly formatted flashcards. Please try again.');
        }
        
        throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
};

/**
 * Test OpenAI connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
const testConnection = async () => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello, OpenAI connection is working!"'
                }
            ],
            max_tokens: 20
        });

        return response.choices[0].message.content.includes('Hello');
    } catch (error) {
        console.error('OpenAI connection test failed:', error);
        return false;
    }
};

module.exports = {
    generateFlashcards,
    testConnection
};