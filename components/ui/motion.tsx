"use client"

import { motion } from "framer-motion"

// Animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.5,
    },
  },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
}

export const buttonTap = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
}

// Motion components
export const MotionDiv = motion.div
export const MotionButton = motion.button
export const MotionLink = motion.a
export const MotionSection = motion.section
export const MotionCard = motion.div
export const MotionHeader = motion.header
export const MotionFooter = motion.footer

