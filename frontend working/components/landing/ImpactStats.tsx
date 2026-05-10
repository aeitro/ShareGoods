'use client'

import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"

const stats = [
  { label: "Items Donated", value: 25000, suffix: "+", sub: "Giving things new life" },
  { label: "People Helped", value: 12000, suffix: "+", sub: "Families supported" },
  { label: "Cities Reached", value: 150, suffix: "+", sub: "Growing community" },
  { label: "Satisfaction", value: 98, suffix: "%", sub: "User trust rating" },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 50,
    damping: 30,
  })
  
  const displayValue = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString()
  )

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [inView, value, spring])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  )
}

export default function ImpactStats() {
  return (
    <section className="py-24 bg-[#0F172A] overflow-hidden relative">
      {/* Sophisticated Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4CAF50_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              className="text-center relative group"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 inline-block">
                <Counter value={stat.value} suffix={stat.suffix} />
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="h-1.5 bg-[#4CAF50] rounded-full mt-1 opacity-50" 
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-black text-green-400 uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {stat.sub}
                </div>
              </div>
              
              {/* Subtle hover connector */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-px bg-white/5 hidden md:block last:hidden" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
