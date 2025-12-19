'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Leaf,
  Bus,
  Clock,
  Users,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  TreePine,
  Wifi,
  CreditCard,
  Timer
} from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: 'ease-out-cubic',
    });

    setIsLoaded(true);

    // GSAP Marquee Animation
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        xPercent: -500,
        ease: 'none',
        duration: 15,
        repeat: -1,
      });
    }

    // GSAP Stats Counter Animation
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.stat-number', {
          textContent: 0,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: 1 },
          stagger: 0.2,
        });
      },
    });

    // Journey path animation
    gsap.fromTo(
      '.journey-line',
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        duration: 3,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: journeyRef.current,
          start: 'top 70%',
        },
      }
    );

    // Feature rotation
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Leaf, title: 'Carbon Neutral', desc: 'Every ride plants a tree' },
    { icon: Timer, title: 'Real-Time', desc: 'Live tracking & updates' },
    { icon: CreditCard, title: 'Seamless Pay', desc: 'Multiple payment options' },
    { icon: Wifi, title: 'Connected', desc: 'WiFi enabled buses' },
  ];

  const cities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Trincomalee',
    'Anuradhapura', 'Batticaloa', 'Matara', 'Kurunegala'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col justify-between px-6 md:px-12 lg:px-20 py-8"
      >

        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-12">
          {/* Left - Large Text */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <p className="text-sm md:text-base text-muted-foreground tracking-widest uppercase mb-4">
                The Future of Travel
              </p>
              <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tight">
                <span className="block">Journey</span>
                <span className="block text-muted-foreground/30">Reimagined</span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-md"
            >
              Sri Lanka's first carbon-neutral bus booking platform.
              Travel smarter. Travel greener.
            </motion.p>
          </div>

          {/* Top Bar */}
          <div className="md:hidden flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-1">
                Y<span className="text-chart-2">AM</span>U
              </h1>

              <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
                by <span className="text-red-500">TRI</span><span className="text-blue-500">MIDS</span>
              </span>
            </motion.div>
          </div>
          {/* Right - Search Card */}
          <motion.div
            initial={{ opacity: 1, scale: 1, rotateY: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 border border-border rounded-full opacity-20" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-chart-2/50 rounded-full" />

              {/* Search Card */}
              <div className="relative bg-transparent backdrop-blur-sm border border-border rounded-sm p-8 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div>
                    <p className="text-5xl text-text">Book Your</p>
                    <p className="text-5xl">Journey</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* From */}
                  <div className="group relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="From"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 bg-muted/50 border border-transparent rounded-sm focus:border-primary focus:bg-background outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </motion.button>
                  </div>

                  {/* To */}
                  <div className="group relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="To"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 bg-muted/50 border border-transparent rounded-sm focus:border-primary focus:bg-background outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Date */}
                  <div className="group relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 bg-muted/50 border border-transparent rounded-sm focus:border-primary focus:bg-background outline-none transition-all text-foreground"
                    />
                  </div>

                  {/* Search Button */}
                  <Link href={"/booking"}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-sm font-medium flex items-center justify-center gap-2 group"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Buses</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.section>

      {/* Marquee Section */}
      <section className="py-4 border-y border-border overflow-hidden bg-muted/30">
        <div ref={marqueeRef} className="flex gap-12 whitespace-nowrap">
          {[...cities, ...cities].map((city, i) => (
            <span
              key={i}
              className="text-4xl md:text-6xl font-bold text-muted-foreground/20 flex items-center gap-8"
            >
              {city}
              <span className="w-3 h-3 rounded-full bg-chart-2/30" />
            </span>
          ))}
        </div>
      </section>

      {/* Journey Visualization Section */}
      <section
        ref={journeyRef}
        className="min-h-screen py-24 px-6 md:px-12 lg:px-20 relative"
      >
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute left-6 md:left-12 top-24 writing-mode-vertical text-xs tracking-[0.3em] text-muted-foreground uppercase hidden lg:block"
          style={{ writingMode: 'vertical-rl' }}
        >
          How It Works
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-20" data-aos="fade-up">
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Three Steps
              <br />
              <span className="text-muted-foreground/40">To Your</span>
              <br />
              Destination
            </h3>
          </div>

          {/* Journey Steps */}
          <div className="relative">
            {/* SVG Connection Line */}
            <svg
              className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 hidden lg:block"
              viewBox="0 0 1000 10"
            >
              <path
                className="journey-line"
                d="M0 5 Q250 5 500 5 T1000 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="1000"
              />
            </svg>

            <div className="grid lg:grid-cols-3 gap-16 lg:gap-8 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Search',
                  desc: 'Enter your route and preferred date',
                  icon: Search,
                },
                {
                  step: '02',
                  title: 'Select',
                  desc: 'Choose your perfect seat and bus',
                  icon: Bus,
                },
                {
                  step: '03',
                  title: 'Travel',
                  desc: 'Board with your digital ticket',
                  icon: Sparkles,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative group"
                >
                  {/* Step Number */}
                  <span className="text-8xl font-bold text-muted/50 absolute -top-12 -left-4">
                    {item.step}
                  </span>

                  {/* Card */}
                  <div className="relative bg-card backdrop-blur-sm border border-border rounded-sm p-8 hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eco Impact Section */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-chart-2/10 text-chart-2 px-4 py-2 rounded-full text-sm mb-8">
                <TreePine className="w-4 h-4" />
                <span>Eco Impact</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                <span className="block text-chart-2">Travel That</span>
                <span className="block text-muted-foreground/30">Gives Back</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mt-5">
                Every journey with Y<span className="text-chart-2">AM</span>U contributes to reforestation projects
                across Sri Lanka. Your travel, our planet's future.
              </p>

              <div className="flex gap-6">
                <div>
                  <p className="text-3xl font-bold text-chart-2">12,450</p>
                  <p className="text-sm text-muted-foreground">Trees Planted</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold">2.5T</p>
                  <p className="text-sm text-muted-foreground">CO₂ Offset</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div data-aos="fade-left" className="relative">
              {/* Decorative Circles */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border border-dashed border-border rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 border border-dashed border-chart-2/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-16 border border-chart-2/50 rounded-full"
                />

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-chart-2/10 rounded-full flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-chart-2" />
                  </div>
                </div>

                {/* Floating Elements */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                    }}
                    className="absolute w-8 h-8 bg-card border border-border rounded-sm flex items-center justify-center"
                    style={{
                      top: `${20 + i * 20}%`,
                      left: i % 2 === 0 ? '10%' : '80%',
                    }}
                  >
                    <TreePine className="w-4 h-4 text-chart-2" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left - Title */}
            <div className="lg:w-1/2 lg:sticky lg:top-24" data-aos="fade-up">
              <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Why Choose
                <br />
                <span className="text-muted-foreground/40">Y<span className="text-chart-2">AM</span>U?</span>
              </h3>

              {/* Feature Indicators */}
              <div className="flex gap-2 mt-8">
                {features.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-8 bg-primary' : 'w-2 bg-border'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Right - Features */}
            <div className="lg:w-1/2 space-y-8">
              <AnimatePresence mode="wait">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3, y: 0 }}
                    animate={{
                      opacity: i === activeFeature ? 1 : 0.3,
                      scale: i === activeFeature ? 1 : 0.98,
                    }}
                    className={`p-8 rounded-sm border transition-all duration-300 ${i === activeFeature
                      ? 'bg-card border-primary/50'
                      : 'bg-transparent border-border'
                      }`}
                    onMouseEnter={() => setActiveFeature(i)}
                  >
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-14 h-14 rounded-sm flex items-center justify-center transition-colors ${i === activeFeature ? 'bg-primary/10' : 'bg-muted'
                          }`}
                      >
                        <feature.icon
                          className={`w-7 h-7 transition-colors ${i === activeFeature ? 'text-primary' : 'text-muted-foreground'
                            }`}
                        />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-24 px-6 md:px-12 lg:px-20 border-y border-border"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { number: 50000, suffix: '+', label: 'Travelers' },
              { number: 200, suffix: '+', label: 'Routes' },
              { number: 15, suffix: '', label: 'Bus Partners' },
              { number: 4.9, suffix: '★', label: 'Rating' },
            ].map((stat, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="text-center lg:text-left"
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="stat-number">{stat.number}</span>
                  {stat.suffix}
                </p>
                <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="min-h-screen flex items-center justify-center py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[20vw] font-bold text-text  tracking-tighter opacity-10">
            Y<span className="text-chart-2">AM</span>U
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl" data-aos="fade-up">

          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Ready to
            <br />
            <span className="text-muted-foreground/40">Start Your Journey?</span>
          </h3>

          <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
            Join thousands of travelers experiencing the future of bus travel in Sri Lanka.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium group"
          >
            <span>Book Your First Trip</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>

          <p className="mt-8 text-sm text-muted-foreground">
            No registration required • Instant booking
          </p>
        </div>
      </section>
    </div>
  );
}