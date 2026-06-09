# 🔤 ActiveFit Typography Guide

## Design Philosophy

The ActiveFit typography system is designed to convey **energy, strength, and professionalism** - key attributes of premium athletic wear. Our font choices create a bold, impactful visual hierarchy that captures attention and drives action.

---

## 🎯 Font Stack

### 1. **Bebas Neue** - Display Font
**Usage:** Hero titles, major headings, impactful statements

**Characteristics:**
- Ultra-bold, condensed sans-serif
- Athletic, commanding presence
- Excellent for large display sizes
- All-caps friendly

**Examples:**
- Hero title: "UNLEASH YOUR ATHLETIC POWER"
- Section titles: "FEATURED PRODUCTS"
- Category cards: "MEN'S COLLECTION"

**CSS:**
```css
font-family: 'Bebas Neue', sans-serif;
font-weight: 400;
letter-spacing: 1.5-3px;
text-transform: uppercase;
```

---

### 2. **Oswald** - Heading Font
**Usage:** Section headings, product names, feature titles

**Characteristics:**
- Strong, modern condensed font
- Sporty aesthetic
- Excellent readability
- Professional appearance

**Examples:**
- Product names: "Elite Compression Tights"
- Feature titles: "Free Shipping"

**CSS:**
```css
font-family: 'Oswald', sans-serif;
font-weight: 400-700;
letter-spacing: 0.3-1px;
```

---

### 3. **Montserrat** - Secondary Font
**Usage:** Buttons, labels, category tags, navigation

**Characteristics:**
- Clean, geometric sans-serif
- Professional and versatile
- Great for UI elements
- Excellent weight variation

**Examples:**
- Navigation links: "SHOP" "MEN" "WOMEN"
- Buttons: "SHOP NOW"
- Product categories: "MEN'S TRAINING"
- Filter buttons: "ALL" "SALE"

**CSS:**
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600-800;
letter-spacing: 1-2.5px;
text-transform: uppercase;
```

---

### 4. **Inter** - Body Font
**Usage:** Paragraphs, descriptions, body text

**Characteristics:**
- Modern, highly legible
- Optimized for screens
- Neutral, professional
- Excellent readability

**Examples:**
- Hero description text
- Product descriptions
- Footer text
- Form inputs

**CSS:**
```css
font-family: 'Inter', sans-serif;
font-weight: 300-700;
letter-spacing: 0.3-0.5px;
```

---

## 📐 Typography Scale

### Display Sizes (Hero/Landing)
- **Hero Title**: 110px (desktop) / 56px (mobile)
- **Hero Label**: 13px, uppercase, 2.5px letter-spacing
- **Hero Description**: 22px (desktop) / 17px (mobile)

### Heading Sizes
- **H1 (Section Titles)**: 64px (desktop) / 40px (mobile)
- **H2 (Subsections)**: 56px (desktop) / 36px (mobile)
- **H3 (Category Cards)**: 38px
- **H4 (Feature Titles)**: 20px

### Body Sizes
- **Large Body**: 18-22px (hero descriptions)
- **Regular Body**: 16-17px (paragraphs)
- **Small Body**: 14-15px (metadata)
- **Tiny Text**: 11-13px (labels, categories)

### UI Elements
- **Navigation Links**: 14px, 600 weight, 0.5px spacing
- **Brand Name**: 32px, 400 weight, 1.5px spacing
- **Buttons**: 14px, 700 weight, 1.5px spacing
- **Form Inputs**: 16px
- **Price (Large)**: 26px, 800 weight
- **Price (Small)**: 18px, strikethrough

---

## 🎨 Typography Treatments

### Uppercase Styling
Used extensively for impact and uniformity:
- All hero titles
- Navigation items
- Buttons and CTAs
- Section headings
- Category labels
- Product categories

### Letter Spacing
Strategic use for readability and style:
- **Tight (0.3-0.5px)**: Body text, product names
- **Medium (1-1.5px)**: Buttons, labels, headings
- **Wide (2-3px)**: Hero titles, display text

### Font Weights
- **Light (300)**: Subtle body text
- **Regular (400)**: Standard body, Bebas Neue
- **Medium (500-600)**: Navigation, emphasis
- **Bold (700)**: Buttons, strong emphasis
- **Extra Bold (800)**: Prices, CTAs
- **Black (900)**: Special display elements

### Text Shadows
Used for depth and legibility:
- **Hero Title**: 3px 6px 20px rgba(0,0,0,0.4)
- **Highlight Text**: 3px 6px 24px rgba(255,107,53,0.6)

---

## 🎭 Usage Examples

### Hero Section
```html
<span class="hero-label">NEW COLLECTION 2024</span>
<h1 class="hero-title">
    Unleash Your<br>
    <span class="highlight">ATHLETIC POWER</span>
</h1>
<p class="hero-description">
    Premium performance wear designed for champions.
</p>
```

### Product Card
```html
<span class="product-category">MEN'S TRAINING</span>
<h3 class="product-name">Pro Performance Training Shirt</h3>
<div class="product-price">
    <span class="price-current">$49.99</span>
</div>
```

### Section Header
```html
<h2 class="section-title">FEATURED PRODUCTS</h2>
<p class="section-subtitle">Discover our best-selling athletic wear</p>
```

---

## 📱 Responsive Typography

### Mobile Adjustments (< 768px)
- Hero title: 110px → **56-72px**
- Section titles: 64px → **40-48px**
- Reduce letter-spacing by 25-50%
- Maintain font hierarchy
- Ensure minimum 16px for body text

### Tablet (768px - 1024px)
- Scale between mobile and desktop
- Use clamp() for fluid typography
- Maintain readability at all sizes

---

## ✅ Typography Checklist

When adding new content:

- [ ] Use Bebas Neue for major display text
- [ ] Use Oswald for headings and emphasis
- [ ] Use Montserrat for UI elements
- [ ] Use Inter for body content
- [ ] Apply uppercase to buttons and labels
- [ ] Add appropriate letter-spacing
- [ ] Ensure font weight supports hierarchy
- [ ] Check mobile responsiveness
- [ ] Verify contrast ratios (WCAG AA)
- [ ] Test with actual content

---

## 🎨 Brand Voice Through Typography

**Bold & Commanding** - Bebas Neue creates immediate impact
**Athletic & Energetic** - Oswald reinforces sports performance
**Professional & Trustworthy** - Montserrat provides credibility
**Clear & Accessible** - Inter ensures easy reading

Together, these fonts create a cohesive brand experience that positions ActiveFit as a premium, performance-focused athletic brand.

---

## 🔗 Resources

**Google Fonts:**
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue)
- [Oswald](https://fonts.google.com/specimen/Oswald)
- [Montserrat](https://fonts.google.com/specimen/Montserrat)
- [Inter](https://fonts.google.com/specimen/Inter)

**Import Code:**
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

**Last Updated:** 2024-10-30  
**Version:** 1.3