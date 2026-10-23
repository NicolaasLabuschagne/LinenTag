'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/** Fades and lifts content into view once as it scrolls in. Static for reduced-motion users. */
export function Reveal({
  delay = 0,
  y = 24,
  className,
  children,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.6, 0.35, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its <RevealItem> children. */
export function RevealGroup({ className, children, ...props }: HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.6, 0.35, 1] } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
