import { useRef, type ReactNode } from 'react'
import { motion, useInView, type Variants, useReducedMotion } from 'motion/react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'

interface ScrollRevealProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  className?: string
  amount?: number | 'some' | 'all'
}

// Framer's signature smooth ease: quick initial burst that smoothly floats into place
export const framerEase = [0.16, 1, 0.3, 1] as const

const getHidden = (direction: Direction, distance: number, prefersReduced: boolean) => {
  if (prefersReduced) {
    return { opacity: 0, scale: 1, filter: 'blur(0px)' }
  }
  switch (direction) {
    case 'up':
      return { opacity: 0, y: distance, filter: 'blur(12px)', scale: 0.95 }
    case 'down':
      return { opacity: 0, y: -distance, filter: 'blur(12px)', scale: 0.95 }
    case 'left':
      return { opacity: 0, x: distance, filter: 'blur(12px)', scale: 0.95 }
    case 'right':
      return { opacity: 0, x: -distance, filter: 'blur(12px)', scale: 0.95 }
    case 'scale':
      return { opacity: 0, scale: 0.88, filter: 'blur(10px)' }
    case 'fade':
      return { opacity: 0, filter: 'blur(10px)' }
  }
}

const getVisible = () => ({
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
})

/**
 * Robust ScrollReveal using useInView:
 * Only when scrolled into view does this element float up slowly.
 */
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 1.15,
  distance = 70,
  className,
  amount = 0.18,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount, margin: '0px 0px -50px 0px' })
  const prefersReduced = useReducedMotion()

  const hidden = getHidden(direction, distance, Boolean(prefersReduced))
  const visible = getVisible()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={{
        duration: prefersReduced ? 0.2 : duration,
        delay: prefersReduced ? 0 : delay,
        ease: framerEase,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger container using useInView:
 * When the grid container scrolls into view, each child card floats up in sequence.
 */
export function StaggerContainer({
  children,
  className,
  stagger = 0.14,
  delay = 0.05,
  amount = 0.15,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  amount?: number | 'some' | 'all'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount, margin: '0px 0px -50px 0px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReduced ? 0 : stagger,
            delayChildren: prefersReduced ? 0 : delay,
          },
        },
      }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

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
