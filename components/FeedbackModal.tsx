import React, { useState, useCallback } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;

    setIsSubmitted(true);
    
    // NOTE: Replace with your actual feedback email address
    const feedbackEmail = "feedback-for-my-app@example.com";
    const subject = encodeURIComponent(`Feedback: ${category}`);
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${feedbackEmail}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');

    setTimeout(() => {
      onClose();
      // Reset state for next time modal is opened, after a short delay for the closing animation
      setTimeout(() => {
          setIsSubmitted(false);
          setMessage('');
          setCategory('General');
      }, 300);
    }, 2500);
  }, [category, message, onClose]);

  if (!isOpen) return null;

  const inputStyles = "w-full px-3 py-2 bg-white/5 text-gray-200 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-900/50 rounded-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank you!</h3>
            <p className="text-gray-300">Your email client should now be open for you to send the feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">Share Your Feedback</h3>
              <p className="text-sm text-gray-400 mt-1">We'd love to hear what you think.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select id="feedback-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputStyles}`}>
                  <option value="General" className="bg-gray-800">General Feedback</option>
                  <option value="Bug" className="bg-gray-800">Report a Bug</option>
                  <option value="Feature" className="bg-gray-800">Suggest a Feature</option>
                </select>
              </div>
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea
                  id="feedback-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className={inputStyles}
                  required
                />
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-b-2xl flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 rounded-md transition">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:opacity-90 transition">Submit Feedback</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;