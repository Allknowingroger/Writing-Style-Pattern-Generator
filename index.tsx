import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const App = () => {
  const [writingStyle, setWritingStyle] = useState('');
  const [genre, setGenre] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const genres = ['Blog Post', 'Short Story', 'Poem', 'News Article', 'Script', 'Tweet', 'Product Description', 'Email', 'Fairy Tale'];
  
  const surpriseStyles = [
    'A world-weary detective in a rain-soaked, noir city.',
    'An overly enthusiastic travel blogger discovering a new city.',
    'A wise, ancient storyteller sharing a legend by a campfire.',
    'A cynical satirist in the style of Jonathan Swift.',
    'A Shakespearean playwright chronicling modern events.',
    'A futuristic AI assistant providing a report, with logical but cold precision.'
  ];
  
  const surpriseTopics = [
    'The invention of the coffee machine.',
    'The first person to walk on Mars.',
    'The mystery of a missing sock.',
    'The unexpected friendship between a cat and a mouse.',
    'Why pineapple on pizza is a culinary debate.',
    'The rise and fall of a forgotten social media platform.'
  ];

  const handleSurpriseMe = () => {
    const randomStyle = surpriseStyles[Math.floor(Math.random() * surpriseStyles.length)];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const randomTopic = surpriseTopics[Math.floor(Math.random() * surpriseTopics.length)];
    setWritingStyle(randomStyle);
    setGenre(randomGenre);
    setTopic(randomTopic);
    setError('');
    setResult('');
  };

  const handleGenerate = async () => {
    if (!writingStyle || !topic || !genre) {
      setError('Please provide a writing style, genre, and topic.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setCopyButtonText('Copy');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Your task is to act as a writer who embodies the following style: "${writingStyle}".

      Now, using that exact style, write a ${genre} about this topic: "${topic}".
      
      Do not break character. Generate the text directly in the requested style and format of a ${genre}.`;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      for await (const chunk of responseStream) {
        setResult((prevResult) => prevResult + (chunk.text || ''));
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="app-container">
      <h1>Writing Style Pattern Generator</h1>
      
      <div className="input-group">
        <label htmlFor="writing-style">Writing Style</label>
        <textarea
          id="writing-style"
          value={writingStyle}
          onChange={(e) => setWritingStyle(e.target.value)}
          placeholder="e.g., A witty and sarcastic tech blogger from the early 2000s"
          aria-label="Enter the desired writing style"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          aria-label="Select the genre"
        >
          <option value="" disabled>Select a genre...</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="topic">Topic</label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The rise of social media"
          aria-label="Enter the topic for the text"
        />
      </div>

      <div className="button-group">
        <button 
          className="generate-button"
          onClick={handleGenerate} 
          disabled={loading}
          aria-label="Generate text based on style and topic"
        >
          {loading ? 'Generating...' : 'Generate Text'}
        </button>
        <button 
          className="secondary-button"
          onClick={handleSurpriseMe} 
          disabled={loading}
          aria-label="Generate random style, genre, and topic"
        >
          Surprise Me
        </button>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      
      {(result || (loading && !result)) && (
        <div className={`result-container ${loading && !result ? 'placeholder' : ''}`} aria-live="polite">
          {result && (
            <button className="copy-button" onClick={handleCopy} aria-label="Copy generated text">
              {copyButtonText}
            </button>
          )}
          {loading && !result ? 'Generating...' : <pre>{result}</pre>}
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);