"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const POSTS = [
  {
    tag: "Riders",
    tagColor: "#FF6A2C",
    title: "How Emeka turned his motorbike into a ₦200k/month business",
    excerpt:
      "From delivery side hustle to full-time income — the story of one Lagos rider who built financial freedom with GoDrop.",
    readTime: "4 min read",
    date: "May 12, 2026",
    bgFrom: "rgba(255,106,44,0.12)",
    bgTo: "transparent",
  },
  {
    tag: "Product",
    tagColor: "#1E5FFF",
    title: "Why we built real-time tracking before anything else",
    excerpt:
      "Trust is the hardest thing to earn in logistics. Here's how live GPS became the foundation of everything we do.",
    readTime: "5 min read",
    date: "Apr 28, 2026",
    bgFrom: "rgba(30,95,255,0.12)",
    bgTo: "transparent",
  },
  {
    tag: "Lagos",
    tagColor: "#1DB984",
    title: "30 minutes or less: the science behind our delivery promise",
    excerpt:
      "Traffic. Distance. Time of day. We break down how we consistently hit our average in one of Africa's busiest cities.",
    readTime: "6 min read",
    date: "Apr 10, 2026",
    bgFrom: "rgba(29,185,132,0.12)",
    bgTo: "transparent",
  },
];

export default function BlogTeaserSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">

        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          variants={staggerContainer(0.1)}
          {...inViewProps}
        >
          <div>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="w-16 h-px bg-white/20" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Stories</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-white font-bold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
            >
              From the ground up.
            </motion.h2>
          </div>
          <motion.a
            variants={fadeUp}
            href="#blog"
            className="text-sm font-semibold text-white/35 hover:text-white/65 transition-colors shrink-0"
          >
            View all stories →
          </motion.a>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer(0.1, 0.1)}
          {...inViewProps}
        >
          {POSTS.map((post) => (
            <motion.a
              key={post.title}
              href="#blog"
              variants={fadeUp}
              className="group rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                textDecoration: "none",
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Image placeholder */}
              <div
                className="h-44 relative overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${post.bgFrom}, ${post.bgTo})` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl"
                  style={{ background: `${post.tagColor}12`, border: `1px solid ${post.tagColor}1E` }}
                />
                <div
                  className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: `${post.tagColor}1A`, color: post.tagColor, border: `1px solid ${post.tagColor}2E` }}
                >
                  {post.tag}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white/75 font-bold text-sm leading-snug mb-2 group-hover:text-white transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-white/30 text-xs leading-relaxed flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="text-white/22 text-[10px]">{post.date}</span>
                  <span className="text-white/22 text-[10px]">{post.readTime}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
