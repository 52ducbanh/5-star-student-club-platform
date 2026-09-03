import type { Variants } from 'motion/react'

// Framer's signature smooth ease: quick initial burst that smoothly floats into place
export const framerEase = [0.16, 1, 0.3, 1] as const

/**
 * Responsive Stagger item variants generator
 */
export const getStaggerItem = (prefersReduced = false): Variants => ({
  hidden: prefersReduced
    ? { opacity: 0, scale: 1, filter: 'blur(0px)' }
    : { opacity: 0, y: 55, scale: 0.95, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: prefersReduced ? 0.2 : 1.0,
      ease: framerEase,
    },
  },
})

/**
 * Default Stagger item variants: Attached directly to each card in a grid.
 */
export const staggerItem: Variants = getStaggerItem(false)
