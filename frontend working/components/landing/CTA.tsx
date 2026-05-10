'use client'

import { Button } from "@/components/ui/button"
import { Link } from "@/navigation"
import { motion } from "framer-motion"
import { Heart, Sparkles, ArrowRight } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-32 bg-[#0F172A] overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#4CAF50]/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-[4rem] p-12 sm:p-24 text-center shadow-[0_40px_100px_-20px_rgba(76,175,80,0.3)] relative overflow-hidden group">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-80 h-80 border-[40px] border-white/5 rounded-full"
          />
          
          <div className="relative z-10 space-y-12">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl"
            >
              <Heart className="w-12 h-12 text-white fill-white" />
            </motion.div>
            
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
                Change a life <br /> <span className="text-green-200">with a click.</span>
              </h2>
              <p className="text-green-50 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Your unused items hold the power to transform someone's day. Join the 12,000+ members building a more generous world.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
              <Link href="/choose-role">
                <Button className="group bg-white text-[#4CAF50] hover:bg-[#F8FAFC] px-12 py-9 text-2xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Get Started
                  <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 px-12 py-9 text-2xl font-black rounded-[2rem] border-2 border-white/20">
                  Log In
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-200" />
                <span className="text-green-100 text-sm font-black uppercase tracking-widest">Free Forever</span>
              </div>
              <div className="w-1.5 h-1.5 bg-green-200 rounded-full" />
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-200" />
                <span className="text-green-100 text-sm font-black uppercase tracking-widest">100% Secure</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
