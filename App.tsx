import React, { useState } from 'react';
import EmailComposer from './features/email-composer/EmailComposer';
import ThreadSummarizer from './features/inbox-management/components/ThreadSummarizer';

type Feature = 'composer' | 'inbox';

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature>('composer');

    return (
        <div className="min-h-screen font-sans text-gray-200 overflow-hidden">
            <nav className="bg-white/5 p-4">
                <div className="max-w-4xl mx-auto flex justify-center gap-4">
                    <button
                        onClick={() => setActiveFeature('composer')}
                        className={`px-4 py-2 rounded-md transition ${activeFeature === 'composer' ? 'bg-cyan-500 text-white' : 'hover:bg-white/10'}`}
                    >
                        Email Composer
                    </button>
                    <button
                        onClick={() => setActiveFeature('inbox')}
                        className={`px-4 py-2 rounded-md transition ${activeFeature === 'inbox' ? 'bg-cyan-500 text-white' : 'hover:bg-white/10'}`}
                    >
                        Inbox Management
                    </button>
                </div>
            </nav>
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 z-10">
                {activeFeature === 'composer' && <EmailComposer />}
                {activeFeature === 'inbox' && <ThreadSummarizer />}
            </main>
        </div>
    );
};

export default App;
