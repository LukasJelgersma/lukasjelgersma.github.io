import { motion, anticipate } from 'framer-motion'
import type { ReactNode } from 'react'


interface PageTransitionProps {
    children: ReactNode
    className?: string
}

const pageVariants = {
    initial: { opacity: 0, scale: 0.8 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.2 }
}

const pageTransition = {
    type: "tween" as const,
    ease: anticipate,
    duration: 0.6
}

function PageTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            className={`page-wrapper ${className}`}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    )
}

export default PageTransition