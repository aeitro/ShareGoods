'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

export default function About() {
  return (
    <section id="about" className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-50 rounded-full blur-3xl -z-10" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="/placeholder.jpg"
                alt="Community members helping each other"
                width={500}
                height={400}
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Experience Badge */}
            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-50 hidden md:block">
              <div className="text-center">
                <p className="text-4xl font-black text-[#4CAF50] mb-1">5+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Years of Trust</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-[#4CAF50] text-xs font-bold uppercase tracking-wider">
                <span>Our Story</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Building Stronger Communities Through the Power of Sharing
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  ShareGoods was founded on a simple yet profound belief: that no item with life left in it should go to waste, and no person in our community should go without basic necessities.
                </p>
                <p>
                  We've built more than just a donation platform; we've created a digital bridge that connects neighborhoods, fosters empathy, and turns "extra" into "essential" for families in need.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Our Mission</h4>
                <p className="text-sm text-gray-500">To make community sharing as effortless and impactful as possible.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Our Vision</h4>
                <p className="text-sm text-gray-500">A world where resources are circular and everyone is supported.</p>
              </div>
            </div>

            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 rounded-2xl transition-all hover:translate-x-2">
              Learn More About Our Impact
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
