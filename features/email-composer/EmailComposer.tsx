import React, { useState, useCallback, useMemo } from 'react';
import { ActionType, ToneOfVoice } from '../../types';
import { TONE_OPTIONS, SAMPLE_PROMPTS } from '../../constants';
import * as geminiService from '../../services/geminiService';
import { Chat } from '../../services/geminiService';
import { trackEvent } from '../../services/analytics';
import OutputCard from './components/OutputCard';
import { SubjectIcon, BodyIcon, TestIcon, PersonalizeIcon, CtaIcon, SpamIcon, FeedbackIcon } from '../../components/shared/icons';
import ParticleBackground from '../../components/shared/ParticleBackground';
import FeedbackModal from '../../components/shared/FeedbackModal';

const EmailComposer: React.FC = () => {
    const [emailGoal, setEmailGoal] = useState<string>('');
    const [targetAudience, setTargetAudience] = useState<string>('');
    const [keyMessage, setKeyMessage] = useState<string>('');
    const [tone, setTone] = useState<ToneOfVoice>(ToneOfVoice.Friendly);

    const [chat, setChat] = useState<Chat | null>(null);

    const [subjectLines, setSubjectLines] = useState<string[]>([]);
    const [emailBody, setEmailBody] = useState<string>('');
    const [abTestSuggestion, setAbTestSuggestion] = useState<string>('');
    const [personalizationIdeas, setPersonalizationIdeas] = useState<string>('');
    const [ctaSuggestions, setCtaSuggestions] = useState<string[]>([]);
    const [spamAnalysis, setSpamAnalysis] = useState<string>('');

    const [loadingStates, setLoadingStates] = useState<Record<ActionType, boolean>>({
        [ActionType.Subject]: false,
        [ActionType.Body]: false,
        [ActionType.AbTest]: false,
        [ActionType.Personalization]: false,
        [ActionType.Cta]: false,
        [ActionType.Spam]: false,
    });

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const isBodyLoading = loadingStates[ActionType.Body];
    const hasBodyContent = emailBody.length > 0;

    const inputs = useMemo(() => ({ goal: emailGoal, audience: targetAudience, message: keyMessage, tone }), [emailGoal, targetAudience, keyMessage, tone]);

    const populateExample = useCallback(() => {
        trackEvent('click', 'ui_interaction', 'try_example');
        const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
        const example = SAMPLE_PROMPTS[randomIndex];
        setEmailGoal(example.goal);
        setTargetAudience(example.audience);
        setKeyMessage(example.message);
        setTone(example.tone);
    }, []);

    const handleAction = useCallback(async (action: ActionType) => {
        trackEvent('click', 'generation', `generate_${action.toLowerCase()}`);
        setLoadingStates(prev => ({ ...prev, [action]: true }));
        try {
            switch (action) {
                case ActionType.Subject:
                    setSubjectLines(await geminiService.generateSubjectLines(inputs));
                    break;
                case ActionType.AbTest:
                    setAbTestSuggestion(await geminiService.suggestAbTest(inputs));
                    break;
                case ActionType.Personalization:
                    setPersonalizationIdeas(await geminiService.getPersonalizationIdeas(inputs));
                    break;
                case ActionType.Cta:
                    setCtaSuggestions(await geminiService.generateCTAs(inputs));
                    break;
                case ActionType.Spam:
                    if(hasBodyContent) setSpamAnalysis(await geminiService.analyzeForSpam(emailBody));
                    break;
            }
        } catch (error) {
            console.error(`Error during ${action}:`, error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [action]: false }));
        }
    }, [inputs, emailBody, hasBodyContent]);

    const handleComposeBody = useCallback(async () => {
        trackEvent('click', 'generation', 'compose_body');
        setLoadingStates(prev => ({ ...prev, [ActionType.Body]: true }));
        setEmailBody('');

        const newChat = geminiService.startChat();
        setChat(newChat);

        try {
            const stream = geminiService.composeEmailBodyStream(newChat, inputs);
            for await (const chunk of stream) {
                setEmailBody(prev => prev + chunk);
            }
        } catch (error) {
            console.error(`Error during Body composition:`, error);
            setEmailBody("Sorry, an error occurred while generating the email.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [ActionType.Body]: false }));
        }
    }, [inputs]);

    const handleRefineBody = useCallback(async (instruction: string) => {
        if (!chat) return;
        trackEvent('click', 'generation', instruction);
        setLoadingStates(prev => ({ ...prev, [ActionType.Body]: true }));
        let currentBody = '';
        setEmailBody('');
        try {
            const stream = geminiService.refineEmailBodyStream(chat, instruction);
            for await (const chunk of stream) {
                currentBody += chunk;
                setEmailBody(currentBody);
            }
        } catch (error) {
             console.error(`Error during Body refinement:`, error);
             setEmailBody("Sorry, an error occurred while refining the email.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [ActionType.Body]: false }));
        }
    }, [chat]);

    const ActionButton: React.FC<{ action: ActionType, onClick: () => void, icon: React.ReactNode, text: string }> = ({ action, onClick, icon, text }) => (
        <button onClick={onClick} disabled={loadingStates[action]} className="flex items-center justify-center w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/50 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
            {loadingStates[action] ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
                <>{icon} {text}</>
            )}
        </button>
    );

    const inputStyles = "w-full px-3 py-2 bg-white/5 text-gray-200 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500";

    return (
        <div className="min-h-screen font-sans text-gray-200 overflow-hidden">
            <ParticleBackground />
            <main className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 z-10">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">AI Email Marketing Assistant</h1>
                    <p className="mt-3 text-lg text-gray-400">Generate powerful email content in seconds.</p>
                </header>

                <div className="relative bg-white/5 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-lg">
                    <div className="absolute top-4 right-4">
                        <button onClick={populateExample} className="text-sm font-semibold text-cyan-400 hover:text-cyan-200 transition">Try an Example</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="email-goal" className="block text-sm font-medium text-gray-300 mb-1">Email Goal</label>
                            <input type="text" id="email-goal" value={emailGoal} onChange={(e) => setEmailGoal(e.target.value)} placeholder="e.g., Promote a new product" className={inputStyles}/>
                        </div>
                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                            <input type="text" id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Existing customers" className={inputStyles}/>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="key-message" className="block text-sm font-medium text-gray-300 mb-1">Key Message / Rough Draft</label>
                        <textarea id="key-message" rows={5} value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} placeholder="Input main points or a draft of your email..." className={inputStyles}/>
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-1">Tone of Voice</label>
                        <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as ToneOfVoice)} className={`${inputStyles} md:w-1/2`}>
                            {TONE_OPTIONS.map(opt => (<option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 my-8">
                    <ActionButton action={ActionType.Subject} onClick={() => handleAction(ActionType.Subject)} icon={<SubjectIcon />} text="Subjects" />
                    <ActionButton action={ActionType.Body} onClick={handleComposeBody} icon={<BodyIcon />} text="Email" />
                    <ActionButton action={ActionType.Cta} onClick={() => handleAction(ActionType.Cta)} icon={<CtaIcon />} text="CTAs" />
                    <ActionButton action={ActionType.AbTest} onClick={() => handleAction(ActionType.AbTest)} icon={<TestIcon />} text="A/B Test" />
                    <ActionButton action={ActionType.Personalization} onClick={() => handleAction(ActionType.Personalization)} icon={<PersonalizeIcon />} text="Ideas" />
                </div>

                <div className="space-y-6">
                    <OutputCard title="Subject Lines" content={subjectLines} isLoading={loadingStates.Subject} icon={<SubjectIcon />} />
                    <OutputCard title="Calls to Action (CTAs)" content={ctaSuggestions} isLoading={loadingStates.Cta} icon={<CtaIcon />} />
                    <OutputCard title="Email Body" content={emailBody} isLoading={isBodyLoading} icon={<BodyIcon />}>
                        {hasBodyContent && !isBodyLoading && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-400 self-center mr-2">Refine:</span>
                                <button onClick={() => handleRefineBody('Make it shorter and more concise.')} className="text-sm bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-1 px-3 rounded-full transition">Shorter</button>
                                <button onClick={() => handleRefineBody('Make the tone more professional.')} className="text-sm bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-1 px-3 rounded-full transition">More Professional</button>
                                <button onClick={() => handleRefineBody('Add some relevant emojis to make it more friendly.')} className="text-sm bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-1 px-3 rounded-full transition">Add Emojis</button>
                            </div>
                        )}
                    </OutputCard>
                    <OutputCard title="Spam Trigger Analysis" content={spamAnalysis} isLoading={loadingStates.Spam} icon={<SpamIcon />}>
                         {hasBodyContent && !isBodyLoading && (
                            <div className="flex justify-start">
                                <button onClick={() => handleAction(ActionType.Spam)} disabled={loadingStates.Spam} className="flex items-center text-sm bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 font-semibold py-1.5 px-4 rounded-lg transition disabled:opacity-50">
                                   {loadingStates.Spam ? 'Analyzing...' : 'Analyze for Spam Triggers'}
                                </button>
                            </div>
                         )}
                    </OutputCard>
                    <OutputCard title="A/B Test Suggestion" content={abTestSuggestion} isLoading={loadingStates.AbTest} icon={<TestIcon />} />
                    <OutputCard title="Personalization Ideas" content={personalizationIdeas} isLoading={loadingStates.Personalization} icon={<PersonalizeIcon />} />
                </div>
            </main>

            <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-40"
                aria-label="Open feedback form"
            >
                <FeedbackIcon />
            </button>

            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />
             <footer className="relative text-center p-4 z-10">
                <p className="text-sm text-gray-500">Powered by Google Gemini</p>
            </footer>
        </div>
    );
};

export default EmailComposer;