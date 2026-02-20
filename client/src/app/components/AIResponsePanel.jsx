'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const AIResponsePanel = ({ query }) => {
  const [responses, setResponses] = useState({
    gemini: { 
      text: '', 
      isLoading: false, 
      error: null,
      images: [],
      videos: [],
      sources: []
    }
  });
  const [activeTab, setActiveTab] = useState('gemini');

  useEffect(() => {
    if (!query) return;

    const processStream = async () => {
      try {
        setResponses(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            isLoading: true,
            text: '',
            images: [],
            videos: [],
            sources: []
          }
        }));

        const token = "YOUR_AUTH_TOKEN"; // Replace with your actual token
        const response = await fetch('https://lunnaa.vercel.app/api/proxy/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({ 
            prompt: query,
            options: { 
              includeYouTube: true, 
              includeImageSearch: true 
            } 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let messageText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const [eventLine, ...dataLines] = event.split('\n');
            const eventType = eventLine.replace('event:', '').trim();
            const data = dataLines.join('\n').replace('data:', '').trim();

            if (!data) continue;

            try {
              const jsonData = JSON.parse(data);
              
              setResponses(prev => {
                const current = { ...prev[activeTab] };
                
                switch (eventType) {
                  case 'message':
                    messageText += jsonData.text || '';
                    return {
                      ...prev,
                      [activeTab]: {
                        ...current,
                        text: messageText
                      }
                    };
                  
                  case 'images':
                    return {
                      ...prev,
                      [activeTab]: {
                        ...current,
                        images: jsonData.images || []
                      }
                    };
                  
                  case 'youtubeResults':
                    return {
                      ...prev,
                      [activeTab]: {
                        ...current,
                        videos: jsonData.videos || []
                      }
                    };
                  
                  case 'sources':
                    return {
                      ...prev,
                      [activeTab]: {
                        ...current,
                        sources: jsonData.sources || []
                      }
                    };
                  
                  default:
                    return prev;
                }
              });
            } catch (error) {
              console.error('Error parsing event data:', error);
            }
          }
        }
      } catch (error) {
        setResponses(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            error: error.message,
            isLoading: false
          }
        }));
      } finally {
        setResponses(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            isLoading: false
          }
        }));
      }
    };

    processStream();
  }, [query, activeTab]);

  const renderContent = () => {
    const { text, isLoading, error, images, videos, sources } = responses[activeTab];

    if (isLoading && !text) {
      return (
        <div className="flex space-x-1 justify-center items-center h-full">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    return (
      <div className="space-y-4">
        {text && <MarkdownContent content={text} />}
        
        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Related Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {images.map((img, index) => (
                <a 
                  key={index} 
                  href={img.pageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={img.thumbnailUrl || img.imageUrl} 
                    alt={img.title}
                    className="w-full h-24 object-cover rounded"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Related Videos</h3>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="flex gap-3">
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <img 
                      src={video.thumbnails?.medium?.url || ''} 
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                      loading="lazy"
                    />
                  </a>
                  <div>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-sm line-clamp-2"
                    >
                      {video.title}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium mb-2">Sources</h3>
            <ul className="space-y-2 text-sm">
              {sources.map((source, index) => (
                <li key={index}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="border-b">
        {Object.keys(responses).map((model) => (
          <button
            key={model}
            className={`px-4 py-2 font-medium ${
              activeTab === model
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(model)}
          >
            {model.charAt(0).toUpperCase() + model.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIResponsePanel;