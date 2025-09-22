import React from 'react';

export const WelcomeScreen = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const prompts = [
        { title: 'Saved Prompt Templates', description: 'Users save and reuse prompt templates for consistency.' },
        { title: 'Media Type Selection', description: 'Users select media type for tailored response generation.' },
        { title: 'Multilingual Support', description: 'Choose language for better interaction.' },
    ];

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div className="bg-gray-800/50 p-8 rounded-2xl max-w-lg w-full">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">How can I help you today?</h1>
                <p className="text-gray-400 mb-8">
                    This code will display a prompt asking the user for their name, and then it will display a greeting message with the name entered by the user.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {prompts.map((p) => (
                        <button key={p.title} onClick={() => onPromptClick(p.description)} className="bg-gray-700/60 p-4 rounded-lg text-left hover:bg-gray-700 transition-colors">
                            <h3 className="font-semibold text-gray-200 text-sm">{p.title}</h3>
                            <p className="text-gray-400 text-xs mt-1">{p.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
