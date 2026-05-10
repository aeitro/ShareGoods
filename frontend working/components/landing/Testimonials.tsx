'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    text: "ShareGoods helped me find winter coats for my children when we were going through a tough time. The kindness of strangers restored my faith in humanity.",
    author: "Maria Rodriguez",
    role: "Recipient",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=maria"
  },
  {
    text: "I love how easy it is to donate items I no longer need. Knowing they're going directly to families in my community makes it so much more meaningful.",
    author: "James Chen",
    role: "Donor",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=james"
  },
  {
    text: "The platform connected me with a local family who needed professional clothes for job interviews. It felt amazing to help someone get back on their feet.",
    author: "Sarah Johnson",
    role: "Donor",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center mb-2"
          >
            <Heart className="w-8 h-8 text-[#4CAF50] fill-[#4CAF50]" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight"
          >
            Stories from our <span className="text-[#4CAF50]">community.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed"
          >
            Real people making a real difference. See how ShareGoods is transforming lives through the power of collective kindness.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <motion.div 
              key={t.author}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <Card className="h-full border-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 rounded-[3rem] p-10 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#4CAF50] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                
                <CardContent className="space-y-10 p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-400 space-x-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-10 h-10 text-gray-100 group-hover:text-green-100 transition-colors duration-500" />
                  </div>

                  <p className="text-lg text-gray-600 font-bold leading-relaxed italic relative z-10">
                    "{t.text}"
                  </p>

                  <div className="flex items-center space-x-5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Image 
                        src={t.avatar} 
                        alt={t.author} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-lg tracking-tight">{t.author}</div>
                      <div className="text-xs font-black text-[#4CAF50] uppercase tracking-[0.2em]">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
