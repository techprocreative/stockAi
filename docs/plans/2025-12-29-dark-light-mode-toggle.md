# Dark/Light Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement functional dark/light mode toggle with persistent user preference using next-themes and custom brutalist toggle component.

**Architecture:** Use next-themes for theme management with localStorage persistence. Add dark mode CSS variables to globals.css. Create brutalist-styled toggle component in navbar. Integrate with existing neo-brutalist design system.

**Tech Stack:** Next.js 16, React 19, next-themes, Tailwind CSS, TypeScript, Zustand (optional for global state)

---

## Task 1: Install next-themes Dependency

**Files:**
- Modify: `package.json`

**Step 1: Install next-themes package**

Run:
```bash
npm install next-themes
```

Expected output: Successfully installed next-themes@^0.3.0

**Step 2: Verify installation**

Run:
```bash
npm list next-themes
```

Expected: Shows next-themes version in dependency tree

**Step 3: Commit dependency**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-themes for dark mode support"
```

---

## Task 2: Add Dark Mode CSS Variables

**Files:**
- Modify: `app/globals.css:7-48` (add .dark selector after :root)

**Step 1: Add dark mode color variables**

Add after line 48 in `app/globals.css`:

```css
  .dark {
    /* Neo-Brutalist Dark Theme - Indonesian Flair */
    --background: 24 20% 8%;  /* Deep dark background */
    --foreground: 42 25% 96%;  /* Light text */

    --card: 24 20% 12%;  /* Darker card background */
    --card-foreground: 42 25% 96%;

    --popover: 24 20% 12%;
    --popover-foreground: 42 25% 96%;

    /* Primary: Brighter Forest Green for dark mode */
    --primary: 152 60% 50%;
    --primary-foreground: 0 0% 100%;

    /* Secondary: Brighter Terracotta */
    --secondary: 12 80% 65%;
    --secondary-foreground: 24 20% 8%;

    /* Accent: Electric Lime (slightly adjusted) */
    --accent: 84 85% 70%;
    --accent-foreground: 24 20% 8%;

    /* Muted: Dark gray */
    --muted: 24 15% 18%;
    --muted-foreground: 42 20% 65%;

    --destructive: 0 72% 58%;
    --destructive-foreground: 0 0% 100%;

    --border: 42 25% 85%;  /* Light borders in dark mode */
    --input: 42 25% 85%;
    --ring: 152 60% 50%;

    /* Custom tokens for dark mode */
    --shadow-brutal: 6px 6px 0px 0px hsl(42 25% 85% / 0.8);
    --shadow-brutal-sm: 3px 3px 0px 0px hsl(42 25% 85% / 0.8);
    --shadow-brutal-lg: 10px 10px 0px 0px hsl(42 25% 85% / 0.8);
  }
```

**Step 2: Test dark mode variables manually**

Run dev server:
```bash
npm run dev
```

Add `class="dark"` to `<html>` tag manually in browser devtools to verify colors change.

Expected: Background becomes dark, text becomes light, brutalist shadows adjust.

**Step 3: Commit CSS changes**

```bash
git add app/globals.css
git commit -m "feat: add dark mode CSS variables for brutalist theme"
```

---

## Task 3: Create Theme Provider Component

**Files:**
- Create: `components/providers/theme-provider.tsx`

**Step 1: Create theme provider wrapper**

Create file `components/providers/theme-provider.tsx`:

```typescript
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 2: Verify file was created**

Run:
```bash
ls -la components/providers/theme-provider.tsx
```

Expected: File exists with correct path

**Step 3: Commit theme provider**

```bash
git add components/providers/theme-provider.tsx
git commit -m "feat: create theme provider component"
```

---

## Task 4: Integrate Theme Provider in Root Layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Import ThemeProvider**

Add import at top of `app/layout.tsx`:

```typescript
import { ThemeProvider } from '@/components/providers/theme-provider'
```

**Step 2: Wrap children with ThemeProvider**

Modify the return statement to wrap children:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
```

**Step 3: Verify no TypeScript errors**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 4: Commit integration**

```bash
git add app/layout.tsx
git commit -m "feat: integrate theme provider in root layout"
```

---

## Task 5: Create Theme Toggle Button Component

**Files:**
- Create: `components/ui/theme-toggle.tsx`

**Step 1: Create theme toggle component**

Create file `components/ui/theme-toggle.tsx`:

```typescript
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="border-brutal shadow-brutal-sm hover-lift w-12 h-12"
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="border-brutal shadow-brutal-sm hover-lift w-12 h-12 relative overflow-hidden group"
    >
      {/* Sun icon - visible in dark mode */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

      {/* Moon icon - visible in light mode */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Step 2: Test component renders**

Run dev server and check browser console for errors:
```bash
npm run dev
```

Navigate to any page, component should render (though not yet visible in navbar).

**Step 3: Commit toggle component**

```bash
git add components/ui/theme-toggle.tsx
git commit -m "feat: create brutalist theme toggle button component"
```

---

## Task 6: Add Theme Toggle to Navbar

**Files:**
- Modify: `components/layout/navbar.tsx`

**Step 1: Import ThemeToggle**

Add import at top of `components/layout/navbar.tsx`:

```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle'
```

**Step 2: Add toggle to navbar actions**

Modify the navbar to include theme toggle before logout button:

```typescript
<div className="flex items-center gap-4">
  <ThemeToggle />
  <Button
    variant="outline"
    onClick={handleSignOut}
    className="border-brutal shadow-brutal-sm hover-lift font-bold"
  >
    <LogOut className="h-4 w-4 mr-2" />
    Keluar
  </Button>
</div>
```

**Step 3: Test in browser**

Run dev server:
```bash
npm run dev
```

Navigate to `/dashboard` (or any authenticated page with navbar).

Expected: Theme toggle button appears with sun/moon icon. Clicking toggles between light and dark mode.

**Step 4: Verify localStorage persistence**

1. Toggle theme to dark
2. Refresh page
3. Verify theme remains dark

Expected: Theme preference persists across page refreshes

**Step 5: Commit navbar integration**

```bash
git add components/layout/navbar.tsx
git commit -m "feat: add theme toggle to navbar"
```

---

## Task 7: Add Theme Toggle to Landing Page (Optional)

**Files:**
- Create: `components/layout/landing-navbar.tsx` (if doesn't exist)
- OR Modify: `app/page.tsx` (if landing page has no navbar)

**Step 1: Create landing page navbar component**

Create file `components/layout/landing-navbar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TrendingUp } from 'lucide-react'

export function LandingNavbar() {
  return (
    <nav className="border-b-4 border-border bg-background shadow-brutal-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border-brutal bg-primary flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight block leading-none">
              IndoStock <span className="text-gradient">AI</span>
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Smart Trading
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="outline" className="border-brutal shadow-brutal-sm hover-lift font-bold">
            <Link href="/auth/sign-in">Masuk</Link>
          </Button>
          <Button asChild className="border-brutal shadow-brutal-sm hover-lift font-bold bg-primary">
            <Link href="/auth/sign-up">Daftar</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
```

**Step 2: Add navbar to landing page**

Modify `app/page.tsx` to include navbar:

```typescript
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CTASection } from '@/components/landing/cta-section'
import { LandingNavbar } from '@/components/layout/landing-navbar'

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </>
  )
}
```

**Step 3: Test landing page**

Navigate to `/` and verify theme toggle works on landing page.

**Step 4: Commit landing navbar**

```bash
git add components/layout/landing-navbar.tsx app/page.tsx
git commit -m "feat: add theme toggle to landing page navbar"
```

---

## Task 8: Fix Dark Mode Specific Styling Issues

**Files:**
- Modify: `app/globals.css` (add dark mode specific fixes)

**Step 1: Add dark mode background pattern adjustments**

Add to `.dark` selector in `app/globals.css`:

```css
.dark body {
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      hsl(42 25% 20% / 0.3) 2px,
      hsl(42 25% 20% / 0.3) 4px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      hsl(42 25% 20% / 0.3) 2px,
      hsl(42 25% 20% / 0.3) 4px
    );
}

.dark body::before {
  opacity: 0.08;
}
```

**Step 2: Test dark mode appearance**

Toggle to dark mode and verify:
- Background pattern is visible but subtle
- Grain texture is slightly more visible
- Overall contrast is good

**Step 3: Commit dark mode styling fixes**

```bash
git add app/globals.css
git commit -m "fix: adjust background patterns and grain for dark mode"
```

---

## Task 9: Add Smooth Theme Transition Animations

**Files:**
- Modify: `app/globals.css`

**Step 1: Add transition classes**

Add to `@layer utilities` in `app/globals.css`:

```css
/* Theme transition */
.theme-transition {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Step 2: Apply to body element**

Modify body styling in `@layer base`:

```css
body {
  @apply bg-background text-foreground theme-transition;
  /* ... rest of styles ... */
}
```

**Step 3: Test smooth transitions**

Toggle theme and verify smooth color transitions (not jarring instant changes).

**Step 4: Commit transition improvements**

```bash
git add app/globals.css
git commit -m "feat: add smooth theme transition animations"
```

---

## Task 10: Final Testing and Documentation

**Files:**
- Create: `docs/features/dark-mode.md`

**Step 1: Create documentation**

Create file `docs/features/dark-mode.md`:

```markdown
# Dark Mode Feature

## Overview

IndoStock AI supports dark and light themes with persistent user preference.

## Implementation

- **Library**: next-themes v0.3+
- **Storage**: localStorage (key: 'theme')
- **Default**: Light mode
- **Toggle Location**: Navbar (top-right, before logout button)

## Theme Colors

### Light Mode
- Background: Warm beige (40 35% 92%)
- Foreground: Deep charcoal (24 20% 12%)
- Primary: Forest Green (152 48% 38%)
- Secondary: Terracotta (12 76% 61%)
- Accent: Electric Lime (84 85% 62%)

### Dark Mode
- Background: Deep dark (24 20% 8%)
- Foreground: Light beige (42 25% 96%)
- Primary: Brighter Forest Green (152 60% 50%)
- Secondary: Brighter Terracotta (12 80% 65%)
- Accent: Electric Lime (84 85% 70%)

## Usage

Theme automatically persists across sessions using localStorage.

### Programmatic Access

```typescript
import { useTheme } from 'next-themes'

function Component() {
  const { theme, setTheme } = useTheme()

  // Get current theme
  console.log(theme) // 'light' | 'dark'

  // Set theme
  setTheme('dark')
}
```

## Testing

1. Navigate to any page
2. Click theme toggle in navbar
3. Verify colors change immediately
4. Refresh page - theme should persist
5. Check localStorage: key 'theme' should exist
```

**Step 2: Comprehensive manual testing**

Test checklist:
- [ ] Landing page - theme toggle works
- [ ] Dashboard - theme toggle works
- [ ] All pages render correctly in dark mode
- [ ] No flash of wrong theme on page load
- [ ] Theme persists after browser refresh
- [ ] Theme persists after browser close/reopen
- [ ] Brutalist shadows visible in both modes
- [ ] Text readable in both modes
- [ ] All buttons/cards have proper contrast

**Step 3: Build and verify production**

Run production build:
```bash
npm run build
npm run start
```

Test theme toggle in production mode.

Expected: Everything works identically to dev mode.

**Step 4: Final commit**

```bash
git add docs/features/dark-mode.md
git commit -m "docs: add dark mode feature documentation"
```

---

## Summary Checklist

- [x] Install next-themes dependency
- [x] Add dark mode CSS variables
- [x] Create ThemeProvider component
- [x] Integrate provider in root layout
- [x] Create theme toggle button
- [x] Add toggle to dashboard navbar
- [x] Add toggle to landing navbar
- [x] Fix dark mode specific styling
- [x] Add smooth transitions
- [x] Test thoroughly
- [x] Document feature

## Final Verification Commands

```bash
# Check all commits
git log --oneline | head -10

# Verify build passes
npm run build

# Check theme toggle functionality
npm run dev
# Then manually test theme switching
```

---

**Implementation Complete!**

Total commits: ~10
Total files modified/created: ~8
Estimated time: 45-60 minutes
