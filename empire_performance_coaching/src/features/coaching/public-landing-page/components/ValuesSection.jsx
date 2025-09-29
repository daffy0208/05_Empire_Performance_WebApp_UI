import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const ValuesSection = () => {
  const values = [
    {
      id: 1,
      icon: "Target",
      title: "Commitment",
      subtitle: "To Excellence",
      description: "Dedicated to helping every player reach their full potential through structured training."
    },
    {
      id: 2,
      icon: "Shield",
      title: "Integrity",
      subtitle: "In Everything",
      description: "Building character through honest feedback, fair play, and respect for all."
    },
    {
      id: 3,
      icon: "TrendingUp",
      title: "Progression",
      subtitle: "Every Session",
      description: "Continuous improvement in technical skills, tactical understanding, and personal growth."
    },
    {
      id: 4,
      icon: "Users",
      title: "Community",
      subtitle: "First Always",
      description: "Creating lasting friendships and a supportive environment for young athletes."
    }
  ];

  return (
    <section className="relative empire-surface-1">
      <div className="w-full px-6 md:px-10 py-16 md:py-24">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-header font-bold text-empire-white mb-4">
            Our Core Values
          </h2>
          <div className="empire-gold-divider w-24 mx-auto mb-6"></div>
          <p className="text-empire-offwhite/80 max-w-3xl mx-auto font-body">
            These principles guide everything we do, shaping not just better players, 
            but stronger individuals ready to succeed in football and life.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values?.map((value, index) => (
            <motion.div
              key={value?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="empire-card text-center"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-empire-gold/10 rounded-full mx-auto mb-6 group-hover:bg-empire-gold/20 transition-all duration-300">
                <Icon
                  name={value?.icon}
                  size={24}
                  className="text-empire-gold"
                />
              </div>

              {/* Content */}
              <h3 className="font-header font-bold text-lg text-empire-white mb-1 uppercase tracking-tight">
                {value?.title}
              </h3>
              <p className="text-empire-gold text-xs font-medium mb-4 uppercase tracking-wide">
                {value?.subtitle}
              </p>
              <p className="text-empire-offwhite/70 text-sm leading-relaxed font-body">
                {value?.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;