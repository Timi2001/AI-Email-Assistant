import React, { useState } from 'react';
import { SummaryIcon } from '../../../components/shared/icons';
import * as geminiService from '../../../services/geminiService';

const ThreadSummarizer: React.FC = () => {
    const [thread, setThread] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        setIsLoading(true);
        setSummary('');
        try {
            const result = await geminiService.summarizeThread(thread);
            setSummary(result);
        } catch (error) {
            console.error("Error summarizing thread:", error);
            setSummary("Sorry, there was an error summarizing the email thread.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyles = "w-full px-3 py-2 bg-white/5 text-gray-200 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500";

    return (
        <div className="relative bg-white/5 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-lg mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Email Thread Summarizer</h2>
            <div className="mb-6">
                <label htmlFor="email-thread" className="block text-sm font-medium text-gray-300 mb-1">Email Thread</label>
                <textarea
                    id="email-thread"
                    rows={10}
                    value={thread}
                    onChange={(e) => setThread(e.target.value)}
                    placeholder="Paste your email thread here..."
                    className={inputStyles}
                />
            </div>
            <div className="flex justify-end">
                <button
                    onClick={handleSummarize}
                    disabled={isLoading || !thread}
                    className="flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/50 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <><SummaryIcon /> Summarize</>
                    )}
                </button>
            </div>
            {summary && (
                 <div className="mt-6 p-4 bg-black/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Summary</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
                </div>
            )}
        </div>
    );
};

export default ThreadSummarizer;
