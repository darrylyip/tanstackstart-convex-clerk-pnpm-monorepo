# 5. Theming & Design Tokens

## Color System (Light/Dark Mode)

### Tailwind CSS Custom Tokens
```css
/* CSS Variables for theme switching */
:root {
  /* Light mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Healthcare-specific colors */
  --medical-blue: 213 94% 68%;
  --medical-green: 142 76% 36%;
  --medical-amber: 38 92% 50%;
  --medical-red: 0 84% 60%;
}

.dark {
  /* Dark mode overrides */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  
  /* Healthcare-specific dark mode */
  --medical-blue: 213 94% 78%;
  --medical-green: 142 76% 46%;
  --medical-amber: 38 92% 60%;
  --medical-red: 0 84% 70%;
}
```

### Theme Switching Component
```tsx
// Using shadcn Button + custom theme hook
<Button
  variant="ghost"
  size="sm"
  onClick={toggleTheme}
  className="h-9 w-9"
>
  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
</Button>
```

## Typography
```css
/* Font Stack - Healthcare optimized */
font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale - Tailwind custom */
--text-xs: 0.75rem;     /* 12px - Labels, captions */
--text-sm: 0.875rem;    /* 14px - Body secondary */
--text-base: 1rem;      /* 16px - Body primary */
--text-lg: 1.125rem;    /* 18px - Subheadings */
--text-xl: 1.25rem;     /* 20px - Headings */
--text-2xl: 1.5rem;     /* 24px - Page titles */
--text-3xl: 1.875rem;   /* 30px - Hero headings */
```

## Spacing & Layout
```css
/* Tailwind spacing extended for healthcare UI */
--space-0.5: 0.125rem;  /* 2px - Fine adjustments */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
```
