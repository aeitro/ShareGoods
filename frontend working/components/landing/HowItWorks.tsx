'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Package, Users, Heart, ArrowRight } from "lucide-react"
import { motion, Variants } from "framer-motion"
import Image from "next/image"

const steps = [
  {
    icon: Package,
    title: "List Your Items",
    description: "Snap a photo and add a quick description. It only takes 60 seconds to start making a difference.",
    color: "bg-green-50",
    iconColor: "text-[#4CAF50]",
    tag: "SIMPLE"
  },
  {
    icon: Users,
    title: "Connect Locally",
    description: "Our smart matching engine connects you with verified neighbors and NGOs who need exactly what you have.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    tag: "LOCAL"
  },
  {
    icon: Heart,
    title: "Give with Impact",
    description: "Hand over your item and feel the immediate joy of helping someone. Track your community impact in real-time.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    tag: "IMPACT"
  },
]

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  },
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-50/30 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 bg-green-50 rounded-full"
            >
              <span className="text-xs font-black text-[#4CAF50] uppercase tracking-[0.2em]">Our Process</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight"
            >
              Simple sharing for a <span className="text-[#4CAF50]">better world.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500 leading-relaxed max-w-xl"
            >
              We've redesigned the donation experience to be as frictionless as possible. Because helping others should be the easiest thing you do today.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 w-full max-w-[500px] mx-auto aspect-square">
              <Image 
                src="/images/illustration-3d.png" 
                alt="3D Illustration of giving" 
                fill
                className="object-contain"
              />
            </div>
            {/* Ambient glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-green-100/50 to-blue-100/50 rounded-full blur-3xl opacity-50 -z-10" />
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-10"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="relative group">
              <div className="absolute -inset-4 bg-gray-50/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              
              <Card className="h-full bg-white border-0 shadow-none group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-300 group-hover:text-[#4CAF50] transition-colors">
                      {step.tag}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-[#4CAF50] font-black text-lg">0{index + 1}.</span>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center text-[#4CAF50] font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Connecting line for desktop */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 w-10 h-px bg-gray-100 -z-20" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
