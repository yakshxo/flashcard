const { InferenceClient } = require('@huggingface/inference');

const client = new InferenceClient(process.env.HF_TOKEN);

// Use env vars so you can switch models/providers without editing code
const HF_MODEL =
  process.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

const HF_PROVIDER =
  process.env.HF_PROVIDER || 'auto';

// Small helper to safely extract model text
const getMessageContent = (response) => {
  return response?.choices?.[0]?.message?.content?.trim() || '';
};

/**
 * Parse JSON array from model output
 */
const parseFlashcardsJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Model response does not contain a JSON array');
    }
    return JSON.parse(jsonMatch[0]);
  }
};

/**
 * Generate flashcards from text content using Hugging Face
 * @param {string} content
 * @param {object} options
 * @returns {Promise<Array>}
 */
const generateFlashcards = async (content, options = {}) => {
  try {
    const {
      cardCount = 10,
      difficulty = 'medium',
      subject = '',
      customPrompt = '',
    } = options;

    if (!content || !content.trim()) {
      throw new Error('No study content provided');
    }

    let prompt = `You are an expert educator. Generate exactly ${cardCount} flashcards from the study content below.

Requirements:
- Return ONLY valid JSON
- Return exactly ${cardCount} flashcards
- Difficulty level: ${difficulty}
- Each flashcard must have:
  - question
  - answer
  - difficulty
  - tags
- Questions should be specific and useful for revision
- Answers should be concise but complete
- Use different question styles where appropriate
- Avoid yes/no questions unless absolutely necessary`;

    if (subject) {
      prompt += `\n- Subject focus: ${subject}`;
    }

    if (customPrompt) {
      prompt += `\n- Additional instructions: ${customPrompt}`;
    }

    prompt += `

Study content:
${content}

Return this exact JSON shape:
[
  {
    "question": "Question here",
    "answer": "Answer here",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`;

    const response = await client.chatCompletion({
      provider: HF_PROVIDER, // "auto" is safest
      model: HF_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You create educational flashcards. Respond with only valid JSON. No markdown. No explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.4,
    });

    const rawText = getMessageContent(response);

    if (!rawText) {
      throw new Error('Empty response from Hugging Face');
    }

    const flashcards = parseFlashcardsJson(rawText);

    if (!Array.isArray(flashcards)) {
      throw new Error('Model response is not an array');
    }

    const validatedFlashcards = flashcards.map((card, index) => {
      if (!card?.question || !card?.answer) {
        throw new Error(`Flashcard ${index + 1} is missing question or answer`);
      }

      return {
        question: String(card.question).trim(),
        answer: String(card.answer).trim(),
        difficulty: card.difficulty || difficulty,
        tags: Array.isArray(card.tags)
          ? card.tags.map((tag) => String(tag).trim()).filter(Boolean)
          : [],
      };
    });

    return validatedFlashcards.slice(0, cardCount);
  } catch (error) {
    console.error('Hugging Face Service Error:', error);

    const message = error?.message || 'Unknown Hugging Face error';

    if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
      throw new Error('Invalid Hugging Face token.');
    }

    if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
      throw new Error('Hugging Face token does not have the required permissions.');
    }

    if (
      message.toLowerCase().includes('inference provider') ||
      message.toLowerCase().includes('provider information')
    ) {
      throw new Error(
        `No working Hugging Face provider was found for model "${HF_MODEL}". Try another model/provider in env vars.`
      );
    }

    if (
      message.toLowerCase().includes('rate limit') ||
      message.includes('429')
    ) {
      throw new Error('Hugging Face rate limit exceeded. Please try again later.');
    }

    if (message.toLowerCase().includes('json')) {
      throw new Error('Model returned invalid JSON. Please try again.');
    }

    throw new Error(`Failed to generate flashcards: ${message}`);
  }
};

/**
 * Test Hugging Face connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const response = await client.chatCompletion({
      provider: HF_PROVIDER,
      model: HF_MODEL,
      messages: [
        {
          role: 'user',
          content: 'Reply with exactly this word: HELLO',
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const text = getMessageContent(response);
    return text.toUpperCase().includes('HELLO');
  } catch (error) {
    console.error('Hugging Face connection test failed:', error);
    return false;
  }
};

module.exports = {
  generateFlashcards,
  testConnection,
};
