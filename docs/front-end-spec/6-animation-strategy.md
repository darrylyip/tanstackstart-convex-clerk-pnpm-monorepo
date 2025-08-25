# 6. Animation Strategy

## CSS Animations (Simple Interactions)
```css
/* Tailwind classes for micro-interactions */
.btn-hover {
  @apply transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-md;
}

.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.loading-pulse {
  @apply animate-pulse bg-muted;
}

/* Custom CSS for healthcare-specific animations */
.status-indicator {
  @apply transition-colors duration-200 ease-in-out;
}

.conflict-warning {
  @apply animate-bounce;
  animation-iteration-count: 3;
}
```

## Framer Motion (Complex Animations)
```tsx
// Page transitions
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Schedule calendar interactions
const scheduleCardVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.02, rotate: 0.5 },
  dragging: { scale: 1.05, rotate: 5, zIndex: 999 }
};

// Modal entrance
const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  }
};
```

## Animation Guidelines
- **CSS for**: Hover states, focus indicators, loading states, simple transitions
- **Framer Motion for**: Page transitions, drag interactions, complex state changes, orchestrated sequences
- **Performance**: Prefer transform and opacity changes, use `will-change` sparingly
- **Accessibility**: Respect `prefers-reduced-motion` user preference
