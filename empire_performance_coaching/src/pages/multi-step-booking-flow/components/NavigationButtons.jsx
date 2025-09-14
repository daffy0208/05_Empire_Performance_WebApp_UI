import React from 'react';
import { btnPrimary, btnSecondary } from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  onCancel,
  isNextDisabled = false,
  isLoading = false,
  nextButtonText = "Next",
  showCancel = false
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed top-4 right-4 z-50 md:relative md:top-auto md:right-auto md:z-auto">
      {/* Desktop: Top-right positioning */}
      <div className="hidden md:flex items-center space-x-4">
        {showCancel && (
          <button
            onClick={onCancel}
            className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-3 py-2"
          >
            Cancel
          </button>
        )}
        
        {currentStep > 1 && (
          <button
            onClick={onPrevious}
            disabled={isLoading}
            className={`${btnSecondary} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon name="ChevronLeft" size={16} className="mr-1" />
            Previous
          </button>
        )}
        
        <button
          onClick={onNext}
          disabled={isNextDisabled || isLoading}
          className={`${btnPrimary} ${
            isNextDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading && <Icon name="Loader2" size={16} className="mr-2 animate-spin" />}
          {nextButtonText}
          {!isLoading && currentStep < totalSteps && (
            <Icon name="ChevronRight" size={16} className="ml-1" />
          )}
        </button>
      </div>

      {/* Mobile: Sticky at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E0E10] border-t border-[#2A2A2E] p-4">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto">
          {showCancel && (
            <button
              onClick={onCancel}
              className="text-[#CFCFCF] hover:text-[#C9A43B] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A43B]/50 rounded px-3 py-2"
            >
              Cancel
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={onPrevious}
                disabled={isLoading}
                className={`${btnSecondary} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Previous
              </button>
            )}
            
            <button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className={`${btnPrimary} ${
                isNextDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && <Icon name="Loader2" size={16} className="mr-2 animate-spin" />}
              {nextButtonText}
              {!isLoading && currentStep < totalSteps && (
                <Icon name="ChevronRight" size={16} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;