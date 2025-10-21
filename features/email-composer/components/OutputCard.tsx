import React, { useState, useCallback } from 'react';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { CopyIcon, CheckIcon } from '../../../components/shared/icons';

interface OutputCardProps {
  title: string;
  content: string | string[];
  isLoading: boolean;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

const OutputCard: React.FC<OutputCardProps> = ({ title, content, isLoading, icon, children }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (isLoading || !content || content.length === 0) return;

    const textToCopy = Array.isArray(content) ? content.join('\n') : content;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [content, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    const hasContent = Array.isArray(content) ? content.length > 0 : !!content;

    if (hasContent) {
        if (Array.isArray(content)) {
            return (
                <ul className="list-disc list-inside space-y-2">
                {content.map((item, index) => (
                    <li key={index} className="text-gray-300">{item}</li>
                ))}
                </ul>
            );
        }
        return <p className="text-gray-300 whitespace-pre-wrap">{content}</p>;
    }
    return <p className="text-gray-500 italic">Output will appear here...</p>;
  };

  const hasContent = Array.isArray(content) ? content.length > 0 : !!content;

  return (
    <div className="bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/10 backdrop-blur-md">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center text-gray-200">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          disabled={!hasContent || isLoading}
          className={`p-1.5 rounded-md transition ${hasContent && !isLoading ? 'text-gray-400 hover:bg-white/10 hover:text-gray-200' : 'text-gray-600 cursor-not-allowed'}`}
          aria-label="Copy to clipboard"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <div className="p-6 min-h-[120px]">
        {renderContent()}
      </div>
      {children && (
        <div className="p-4 border-t border-white/10 bg-black/10 rounded-b-2xl">
            {children}
        </div>
      )}
    </div>
  );
};

export default OutputCard;