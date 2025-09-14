import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      role: "Parent",
      location: "Glasgow",
      rating: 5,
      text: "My son has developed tremendously since joining Empire Performance. The coaches are patient, professional, and genuinely care about each player's progress.",
      playerAge: "Age 12"
    },
    {
      id: 2,
      name: "David Thompson",
      role: "Parent",
      location: "Paisley",
      rating: 5,
      text: "Outstanding coaching quality. The structured approach and positive environment have helped my daughter build both skills and confidence on the pitch.",
      playerAge: "Age 10"
    },
    {
      id: 3,
      name: "Lisa Campbell",
      role: "Parent",
      location: "Kilmarnock",
      rating: 5,
      text: "Empire Performance has been transformational. Not just for football skills, but for discipline and teamwork. Highly recommend to any parent.",
      playerAge: "Age 14"
    },
    {
      id: 4,
      name: "Michael Brown",
      role: "Parent",
      location: "Greenock",
      rating: 5,
      text: "The personal attention each player receives is incredible. My son looks forward to every session and has made great friends along the way.",
      playerAge: "Age 11"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials?.length) % testimonials?.length);
  };

  return (
    <section id="testimonials" className="relative empire-surface-1">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-header font-bold text-empire-white mb-4">
            What Parents Say
          </h2>
          <div className="empire-gold-divider w-24 mx-auto mb-6"></div>
          <p className="text-empire-offwhite/80 max-w-3xl mx-auto font-body">
            Hear from families across Scotland who trust Empire Performance Coaching 
            to develop their young athletes.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="empire-surface-2 p-8 text-center"
          >
            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[...Array(testimonials?.[currentSlide]?.rating)]?.map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={20}
                  className="text-empire-gold fill-current"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl font-body text-empire-offwhite leading-relaxed mb-8 max-w-3xl mx-auto">
              "{testimonials?.[currentSlide]?.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-empire-gold/20 rounded-full flex items-center justify-center">
                <span className="text-empire-gold font-bold text-lg">
                  {testimonials?.[currentSlide]?.name?.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <div className="font-header font-semibold text-empire-white">
                  {testimonials?.[currentSlide]?.name}
                </div>
                <div className="text-empire-offwhite/60 text-sm">
                  {testimonials?.[currentSlide]?.role} • {testimonials?.[currentSlide]?.location}
                </div>
                <div className="text-empire-gold text-xs font-medium">
                  {testimonials?.[currentSlide]?.playerAge}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={prevSlide}
              className="w-10 h-10 bg-empire-onyx/60 hover:bg-empire-gold/20 rounded-full flex items-center justify-center border border-white/10 hover:border-empire-gold/40 transition-all"
            >
              <Icon name="ChevronLeft" size={16} className="text-empire-gold" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-empire-gold' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-10 h-10 bg-empire-onyx/60 hover:bg-empire-gold/20 rounded-full flex items-center justify-center border border-white/10 hover:border-empire-gold/40 transition-all"
            >
              <Icon name="ChevronRight" size={16} className="text-empire-gold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;