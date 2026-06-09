/**
 * LUXE BRAND — Product Data
 * Catalogue de démonstration réaliste
 */

const PRODUCTS = [
  // ── Nike ──
  {
    id: 'nike-air-max-90-001',
    name: 'Air Max 90 "Triple Black"',
    brand: 'Nike',
    category: 'sneakers',
    subcategory: 'running',
    price: 149.99,
    originalPrice: 179.99,
    discount: 17,
    rating: 4.8,
    reviews: 342,
    stock: 8,
    isNew: false,
    isSale: true,
    isHot: true,
    gender: 'unisexe',
    colors: ['Noir', 'Blanc', 'Gris'],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    ],
    description: 'La Nike Air Max 90 "Triple Black" incarne l\'excellence de l\'amorti Air. Un coloris iconique entièrement noir pour un style urbain intemporel.',
    tags: ['bestseller', 'iconique', 'amorti'],
  },
  {
    id: 'nike-dunk-low-002',
    name: 'Dunk Low "Panda"',
    brand: 'Nike',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 119.99,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    reviews: 892,
    stock: 3,
    isNew: true,
    isSale: false,
    isHot: true,
    gender: 'unisexe',
    colors: ['Noir/Blanc'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&q=80',
    ],
    description: 'Le Nike Dunk Low "Panda" est devenu l\'une des sneakers les plus convoitées au monde. Son coloris noir et blanc intemporel s\'adapte à toutes les tenues.',
    tags: ['limited', 'hype', 'lifestyle'],
  },
  {
    id: 'nike-af1-003',
    name: 'Air Force 1 \'07 "White"',
    brand: 'Nike',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 109.99,
    originalPrice: null,
    discount: 0,
    rating: 4.7,
    reviews: 1240,
    stock: 25,
    isNew: false,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Blanc', 'Noir', 'Beige'],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45', '46'],
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    description: 'L\'Air Force 1 originale. Depuis 1982, cette silhouette iconique reste la référence absolue du style urbain casual.',
    tags: ['classique', 'iconique'],
  },
  {
    id: 'nike-tech-fleece-004',
    name: 'Sweat Tech Fleece Full-Zip',
    brand: 'Nike',
    category: 'vetements',
    subcategory: 'sweats',
    price: 159.99,
    originalPrice: 189.99,
    discount: 16,
    rating: 4.6,
    reviews: 187,
    stock: 15,
    isNew: false,
    isSale: true,
    isHot: false,
    gender: 'homme',
    colors: ['Noir', 'Gris chiné', 'Bleu marine'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
    ],
    description: 'Le sweat zippé Tech Fleece de Nike combine technologie innovante et confort exceptionnel. Le tissu léger et chaud est devenu un incontournable du streetwear contemporain.',
    tags: ['tech', 'confort', 'streetwear'],
  },

  // ── Adidas ──
  {
    id: 'adidas-samba-005',
    name: 'Samba OG "Core Black"',
    brand: 'Adidas',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 99.99,
    originalPrice: null,
    discount: 0,
    rating: 4.8,
    reviews: 654,
    stock: 12,
    isNew: true,
    isSale: false,
    isHot: true,
    gender: 'unisexe',
    colors: ['Noir/Blanc', 'Blanc/Gomme', 'Bleu/Gomme'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    description: 'La Adidas Samba OG est l\'une des silhouettes les plus emblématiques de la marque aux trois bandes. Sa semelle gomme et son cuir premium en font un classique intemporel.',
    tags: ['classique', 'retro', 'must-have'],
  },
  {
    id: 'adidas-stan-smith-006',
    name: 'Stan Smith "Lux"',
    brand: 'Adidas',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 89.99,
    originalPrice: 109.99,
    discount: 18,
    rating: 4.5,
    reviews: 423,
    stock: 20,
    isNew: false,
    isSale: true,
    isHot: false,
    gender: 'unisexe',
    colors: ['Blanc/Vert', 'Blanc/Marine', 'Crème'],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
    ],
    description: 'Rééditée dans une version luxe avec des matières premium, la Stan Smith conserve son design pur qui la rend intemporelle depuis les années 70.',
    tags: ['classique', 'cuir', 'minimaliste'],
  },
  {
    id: 'adidas-gazelle-007',
    name: 'Gazelle Indoor "Bold Gold"',
    brand: 'Adidas',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 119.99,
    originalPrice: null,
    discount: 0,
    rating: 4.7,
    reviews: 298,
    stock: 7,
    isNew: true,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Bleu/Or', 'Bordeaux/Or', 'Vert/Or'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    images: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
    ],
    description: 'La Gazelle Indoor ressurgit avec des accents dorés audacieux. Une réinterprétation moderne d\'un classique des années 90.',
    tags: ['retro', 'velours', 'trend'],
  },

  // ── New Balance ──
  {
    id: 'nb-550-008',
    name: '550 "White Green"',
    brand: 'New Balance',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 119.99,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    reviews: 521,
    stock: 5,
    isNew: true,
    isSale: false,
    isHot: true,
    gender: 'unisexe',
    colors: ['Blanc/Vert', 'Blanc/Bleu', 'Crème'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80',
    ],
    description: 'La New Balance 550 est la sneaker de basket revisitée qui a conquis le monde. Son profil chunky et ses matières premium la placent au sommet des tendances actuelles.',
    tags: ['trend', 'basketball', 'retro'],
  },
  {
    id: 'nb-574-009',
    name: '574 "Grey Day"',
    brand: 'New Balance',
    category: 'sneakers',
    subcategory: 'running',
    price: 109.99,
    originalPrice: 129.99,
    discount: 15,
    rating: 4.6,
    reviews: 387,
    stock: 18,
    isNew: false,
    isSale: true,
    isHot: false,
    gender: 'unisexe',
    colors: ['Gris/Blanc', 'Marine/Rouge', 'Kaki'],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    description: 'La New Balance 574 est la sneaker polyvalente par excellence. Confort optimal, style intemporel et polyvalence absolue.',
    tags: ['classique', 'confort', 'polyvalent'],
  },
  {
    id: 'nb-1906r-010',
    name: '1906R "Protection Pack"',
    brand: 'New Balance',
    category: 'sneakers',
    subcategory: 'running',
    price: 179.99,
    originalPrice: null,
    discount: 0,
    rating: 4.8,
    reviews: 203,
    stock: 4,
    isNew: true,
    isSale: false,
    isHot: true,
    gender: 'unisexe',
    colors: ['Argent/Blanc', 'Noir/Or'],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80',
    ],
    description: 'La 1906R "Protection Pack" pousse les limites du design avec ses matières réfléchissantes et son look futuriste. La sneaker la plus avant-gardiste de New Balance.',
    tags: ['futuriste', 'premium', 'limited'],
  },

  // ── Birkenstock ──
  {
    id: 'birk-arizona-011',
    name: 'Arizona Suede "Tabac"',
    brand: 'Birkenstock',
    category: 'sneakers',
    subcategory: 'sandales',
    price: 129.99,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    reviews: 876,
    stock: 22,
    isNew: false,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Tabac', 'Noir', 'Mocha', 'Blanc'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    ],
    description: 'La sandale iconique de Birkenstock depuis 1963. La semelle en liège naturel épouse la forme du pied pour un confort inégalé, tandis que le suède tabac apporte une élégance décontractée.',
    tags: ['confort', 'naturel', 'iconique'],
  },
  {
    id: 'birk-boston-012',
    name: 'Boston Soft Footbed "Black"',
    brand: 'Birkenstock',
    category: 'sneakers',
    subcategory: 'sandales',
    price: 149.99,
    originalPrice: 169.99,
    discount: 12,
    rating: 4.8,
    reviews: 432,
    stock: 11,
    isNew: false,
    isSale: true,
    isHot: false,
    gender: 'unisexe',
    colors: ['Noir', 'Marron', 'Bleu'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80',
    ],
    description: 'Le sabot Boston de Birkenstock avec semelle intérieure douce pour un confort maximum. Un must-have de saison en saison.',
    tags: ['confort', 'sabot', 'trend'],
  },

  // ── Carhartt ──
  {
    id: 'carhartt-detroit-jacket-013',
    name: 'WIP Detroit Jacket "Hamilton Brown"',
    brand: 'Carhartt',
    category: 'vetements',
    subcategory: 'vestes',
    price: 239.99,
    originalPrice: null,
    discount: 0,
    rating: 4.8,
    reviews: 156,
    stock: 9,
    isNew: true,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Hamilton Brown', 'Black', 'Heritage Tonal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    ],
    description: 'La Detroit Jacket Carhartt WIP est une référence du workwear devenu streetwear. Sa toile Dearborn robuste et ses poches multiples en font la veste de travail ultime réinterprétée par la culture urbaine.',
    tags: ['workwear', 'robuste', 'iconique'],
  },
  {
    id: 'carhartt-beanie-014',
    name: 'WIP Watch Hat Beanie "Black"',
    brand: 'Carhartt',
    category: 'accessoires',
    subcategory: 'bonnets',
    price: 39.99,
    originalPrice: null,
    discount: 0,
    rating: 4.7,
    reviews: 298,
    stock: 45,
    isNew: false,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Noir', 'Gris chiné', 'Vert', 'Rouge', 'Marine'],
    sizes: ['Unique'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    description: 'Le bonnet Watch Hat de Carhartt WIP est une pièce incontournable de la culture streetwear. Tissé en acrylique épais pour un maintien chaud et un style affirmé.',
    tags: ['accessoire', 'hiver', 'streetwear'],
  },
  {
    id: 'carhartt-tshirt-015',
    name: 'T-Shirt Pocket "White"',
    brand: 'Carhartt',
    category: 'vetements',
    subcategory: 't-shirts',
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    rating: 4.5,
    reviews: 412,
    stock: 32,
    isNew: false,
    isSale: true,
    isHot: false,
    gender: 'unisexe',
    colors: ['Blanc', 'Noir', 'Gris chiné', 'Bleu marine'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    ],
    description: 'Le T-shirt Pocket Carhartt WIP en coton 100% biologique. Simple, robuste et intemporel — la base parfaite pour tout look streetwear.',
    tags: ['basique', 'bio', 'essentiel'],
  },
  {
    id: 'converse-chuck-016',
    name: 'Chuck 70 Hi "Parchment"',
    brand: 'Converse',
    category: 'sneakers',
    subcategory: 'lifestyle',
    price: 94.99,
    originalPrice: null,
    discount: 0,
    rating: 4.6,
    reviews: 567,
    stock: 28,
    isNew: false,
    isSale: false,
    isHot: false,
    gender: 'unisexe',
    colors: ['Parchment', 'Blanc', 'Noir', 'Rouge'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    description: 'Le Chuck 70 revisite le classique All Star avec des matières premium. La semelle vintage et le toile épais lui confèrent un caractère authentique.',
    tags: ['classique', 'vintage', 'iconique'],
  },
];

// Brands data
const BRANDS = [
  {
    id: 'nike',
    name: 'Nike',
    tagline: 'Just Do It',
    founded: 1964,
    origin: 'États-Unis',
    productCount: 142,
    description: 'Fondée en 1964 par Phil Knight et Bill Bowerman, Nike est devenu le leader mondial de l\'équipement sportif. Chaque paire de chaussures Nike que nous proposons est certifiée authentique et provient de distributeurs officiels agréés.',
    color: '#111',
    cover: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
  },
  {
    id: 'adidas',
    name: 'Adidas',
    tagline: 'Impossible is Nothing',
    founded: 1949,
    origin: 'Allemagne',
    productCount: 98,
    description: 'Fondé par Adolf Dassler en 1949, Adidas est la marque aux trois bandes qui incarne depuis plus de 70 ans l\'alliance du sport et du style. Nos produits Adidas sont 100% authentiques.',
    color: '#000',
    cover: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&q=80',
  },
  {
    id: 'new-balance',
    name: 'New Balance',
    tagline: 'Fearlessly Independent',
    founded: 1906,
    origin: 'États-Unis',
    productCount: 76,
    description: 'Depuis 1906, New Balance fabrique des chaussures pour toutes les foulées. La marque est connue pour son confort exceptionnel et ses collaborations artistiques exclusives.',
    color: '#CF232A',
    cover: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80',
  },
  {
    id: 'birkenstock',
    name: 'Birkenstock',
    tagline: '250 Years of Excellence',
    founded: 1774,
    origin: 'Allemagne',
    productCount: 54,
    description: 'Depuis 1774, Birkenstock crée des chaussures qui respectent la biomécanique naturelle du pied. La légendaire semelle en liège-latex naturel offre un confort et un soutien incomparables.',
    color: '#8B6914',
    cover: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80',
  },
  {
    id: 'carhartt',
    name: 'Carhartt',
    tagline: 'Since 1889',
    founded: 1889,
    origin: 'États-Unis',
    productCount: 63,
    description: 'Carhartt fabrique des vêtements de travail robustes depuis 1889. Devenu icône de la culture streetwear grâce à Carhartt WIP, la marque allie durabilité et style urbain.',
    color: '#F4A100',
    cover: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
  },
  {
    id: 'converse',
    name: 'Converse',
    tagline: 'Since 1908',
    founded: 1908,
    origin: 'États-Unis',
    productCount: 47,
    description: 'Converse révolutionne la sneaker culture depuis 1908. La Chuck Taylor All Star reste l\'une des chaussures les plus vendues de l\'histoire, adoptée par tous les genres et sous-cultures.',
    color: '#E31936',
    cover: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
  },
];

// Helper functions
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getProductsByBrand(brand) {
  return PRODUCTS.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
}

function getProductsByCategory(category) {
  return PRODUCTS.filter(p => p.category === category);
}

function getNewArrivals(limit = 4) {
  return PRODUCTS.filter(p => p.isNew).slice(0, limit);
}

function getBestSellers(limit = 4) {
  return [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

function getSaleProducts(limit = 4) {
  return PRODUCTS.filter(p => p.isSale).slice(0, limit);
}

function getTrending(limit = 4) {
  return PRODUCTS.filter(p => p.isHot).slice(0, limit);
}

function searchProducts(query) {
  const q = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + ' €';
}

function getBrandById(id) {
  return BRANDS.find(b => b.id === id);
}
