'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Link } from "@/navigation"
import { motion } from "framer-motion"
import { Heart, ArrowRight, Star } from "lucide-react"

interface HeroProps {
  title: string
  description: string
  getStartedText: string
}

export default function Hero({ title, description, getStartedText }: HeroProps) {
  return (
    <section id="home" className="pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-green-50/50 rounded-full blur-[100px] -mr-40 -mt-40" />
      
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full mb-8"
            >
              <Star className="w-4 h-4 text-[#4CAF50] fill-[#4CAF50]" />
              <span className="text-xs font-black text-[#4CAF50] uppercase tracking-widest">Trusted by 12,000+ Members</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight mb-8">
              {title.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-3">
                  {i >= title.split(' ').length - 2 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CAF50] to-[#45a049]">
                      {word}
                    </span>
                  ) : word}
                </span>
              ))}
            </h1>
            
            <p className="text-xl text-gray-500 leading-relaxed max-w-xl mb-12 font-medium">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/choose-role">
                <Button className="group bg-[#4CAF50] hover:bg-[#45a049] text-white px-10 py-8 text-xl font-black rounded-3xl shadow-2xl shadow-green-200 transition-all hover:scale-105 active:scale-95">
                  {getStartedText}
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" className="px-10 py-8 text-xl font-black rounded-3xl text-gray-600 hover:text-[#4CAF50] hover:bg-green-50 transition-colors">
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center space-x-6">
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="w-14 h-14 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg relative group"
                  >
                    <Image 
                      src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                      alt="Community Member" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </motion.div>
                ))}
                <div className="w-14 h-14 rounded-2xl border-4 border-white bg-green-500 flex items-center justify-center text-white text-sm font-black shadow-lg">
                  +12k
                </div>
              </div>
              <div className="h-10 w-px bg-gray-100" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">
                Active <br /> Contributors
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-green-100/50 to-transparent rounded-[4rem] blur-3xl -z-10 animate-pulse" />
            
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-[12px] border-white group">
              <Image
                src="/images/hero-premium.png"
                alt="People sharing and donating items"
                width={800}
                height={1000}
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating Info Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-50 flex items-center space-x-5 hidden sm:flex hover:-translate-y-2 transition-transform cursor-default"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Heart className="w-7 h-7 text-[#4CAF50] fill-[#4CAF50]" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Impact</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">25,431 Items</p>
              </div>
            </motion.div>

            {/* Subtle Floating Element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 -z-10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
