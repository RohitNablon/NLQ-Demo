import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import './LoaderScreen.css';



const LoaderScreen = ({ onComplete, customSteps, title }) => {
    const defaultSteps = [
        { id: 1, text: 'Connecting to database...' },
        { id: 2, text: 'Analyzing schema structure...' },
        { id: 3, text: 'Extracting table relationships...' },
        { id: 4, text: 'Building metadata index...' },
        { id: 5, text: 'Initializing query engine...' },
    ];
    const steps = customSteps || defaultSteps;

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(stepInterval);
                return prev;
            });
        }, 1000);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 100) {
                    return prev + 2;
                }
                clearInterval(progressInterval);
                return 100;
            });
        }, 100);

        const completeTimeout = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    return (
        <div className="loader-screen">
            <div className="loader-content">
                <div className="loader-spinner-wrapper">
                    <div className="loader-spinner"></div>
                </div>

                <h2 className="loader-title">{title || 'Processing Database'}</h2>
                <p className="loader-status">{steps[currentStep]?.text}</p>

                <div className="loader-progress-container">
                    <div className="progress-track">
                        <div
                            className="progress-glow-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="loader-steps">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`loader-step ${index < currentStep ? 'completed' :
                                index === currentStep ? 'active' : ''
                                }`}
                        >
                            <span className="step-indicator">
                                {index < currentStep ? <Check size={14} /> : index + 1}
                            </span>
                            <span className="step-text">{step.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoaderScreen;
