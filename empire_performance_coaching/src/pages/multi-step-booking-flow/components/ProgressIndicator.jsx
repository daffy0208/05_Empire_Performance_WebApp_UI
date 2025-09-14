import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, stepTitle }) => {
  const steps = [
    { number: 1, title: "Location", icon: "MapPin" },
    { number: 2, title: "Date & Time", icon: "Calendar" },
    { number: 3, title: "Coach", icon: "User" },
    { number: 4, title: "Player Details", icon: "FileText" },
    { number: 5, title: "Payment", icon: "CreditCard" }
  ];

  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step Title */}
        <div className="text-center mb-6">
          <motion.h1 
            key={stepTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-header font-bold text-foreground"
          >
            {stepTitle}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2"></div>
          
          {/* Progress Line */}
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-primary transform -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          ></motion.div>

          {/* Step Indicators */}
          <div className="relative flex justify-between">
            {steps?.map((step) => (
              <div key={step?.number} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: step?.number <= currentStep ? '#C9A227' : '#F5F5F5',
                    borderColor: step?.number <= currentStep ? '#C9A227' : '#E5E5E5',
                    color: step?.number <= currentStep ? '#000000' : '#6B6B6B'
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                    step?.number === currentStep ? 'shadow-lg' : ''
                  }`}
                >
                  {step?.number < currentStep ? (
                    <Icon name="Check" size={16} className="text-primary-foreground" />
                  ) : (
                    <Icon 
                      name={step?.icon} 
                      size={16} 
                      className={step?.number <= currentStep ? 'text-primary-foreground' : 'text-muted-foreground'}
                    />
                  )}
                </motion.div>
                
                <motion.span
                  initial={false}
                  animate={{
                    color: step?.number <= currentStep ? '#000000' : '#6B6B6B',
                    fontWeight: step?.number === currentStep ? '600' : '400'
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-center font-body hidden sm:block"
                >
                  {step?.title}
                </motion.span>
              </div>
            ))}
          </div>
        </div>

        {/* Empire Branding */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full">
            <div className="w-4 h-4 mr-2">
              <img
                src="/assets/images/FB_IMG_1755863428093-1756597782107.jpg"
                alt="Empire"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-medium text-primary font-body">
              Empire Performance Coaching
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;