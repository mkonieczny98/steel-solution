// Biblioteka bloków (sekcji), z których buduje się strony w panelu /admin/strony.
// Plik bez zależności od bazy – korzysta z niego serwer (render, walidacja) i edytor w przeglądarce.
import { IMAGES } from '@/lib/images'
import { sanitizeValues, mergeValues, emptyValue, type Field, type Values } from '@/lib/fields'

export type Block = { id: string; type: BlockType; hidden?: boolean; data: Values }

type BlockDef = {
  label: string
  description: string
  icon: string
  fields: Field[]
  defaults: Values
  summary?: (data: Values) => string
  // Sekcje „z danych” działają tylko na stronach kategorii produktów / marek pojazdów
  scope?: 'entity' | 'category' | 'brand'
}

const BACKGROUNDS = [
  { value: 'light', label: 'Jasne' },
  { value: 'muted', label: 'Szare z siatką' },
  { value: 'dark', label: 'Ciemne' },
]

const background = (def = 'light'): Field => ({
  key: 'background',
  label: 'Tło sekcji',
  type: 'select',
  options: [...BACKGROUNDS.filter((o) => o.value === def), ...BACKGROUNDS.filter((o) => o.value !== def)],
})

const eyebrow: Field = { key: 'eyebrow', label: 'Etykieta nad nagłówkiem', type: 'text' }
const title: Field = { key: 'title', label: 'Nagłówek', type: 'text' }
const titleAccent: Field = { key: 'titleAccent', label: 'Wyróżniona (czerwona) część nagłówka', type: 'text' }
const description: Field = { key: 'description', label: 'Opis', type: 'textarea' }
const linkHint = 'Np. /kontakt, /realizacje, /oferta/produkty albo pełny adres https://…'

export const ICON_OPTIONS = [
  { value: 'ruler', label: 'Miarka' },
  { value: 'wrench', label: 'Klucz' },
  { value: 'shield', label: 'Tarcza' },
  { value: 'users', label: 'Ludzie' },
  { value: 'truck', label: 'Pojazd' },
  { value: 'clock', label: 'Zegar' },
  { value: 'award', label: 'Medal' },
  { value: 'check', label: 'Ptaszek' },
  { value: 'flame', label: 'Płomień' },
  { value: 'package', label: 'Paczka' },
  { value: 'hammer', label: 'Młotek' },
  { value: 'zap', label: 'Błyskawica' },
  { value: 'map', label: 'Mapa' },
  { value: 'phone', label: 'Telefon' },
]

const statsList: Field = {
  key: 'stats',
  label: 'Pasek z liczbami',
  type: 'list',
  itemLabel: 'Liczba',
  hint: 'W wartościach możesz użyć {marki}, {kategorie}, {realizacje} – podstawią się aktualne liczby. Pusta lista = brak paska.',
  fields: [
    { key: 'value', label: 'Wartość', type: 'text' },
    { key: 'label', label: 'Opis', type: 'text' },
  ],
}

export const BLOCKS = {
  hero: {
    label: 'Hero / baner',
    description: 'Duży nagłówek na zdjęciu z przyciskami i opcjonalnym paskiem liczb.',
    icon: 'image',
    fields: [
      eyebrow,
      title,
      titleAccent,
      { key: 'lead', label: 'Tekst pod nagłówkiem', type: 'textarea' },
      { key: 'image', label: 'Zdjęcie w tle', type: 'image' },
      { key: 'imagePosition', label: 'Kadr zdjęcia — komputer', type: 'select', options: [{ value: 'center', label: 'Środek' }, { value: 'left', label: 'Lewa strona' }, { value: 'right', label: 'Prawa strona' }] },
      { key: 'mobileImagePosition', label: 'Kadr zdjęcia — telefon', type: 'select', options: [{ value: 'right', label: 'Prawa strona' }, { value: 'center', label: 'Środek' }, { value: 'left', label: 'Lewa strona' }] },
      {
        key: 'size',
        label: 'Wysokość',
        type: 'select',
        options: [
          { value: 'compact', label: 'Niski (podstrona)' },
          { value: 'full', label: 'Pełny ekran' },
        ],
      },
      { key: 'primaryLabel', label: 'Główny przycisk – tekst', type: 'text', hint: 'Puste = brak przycisku' },
      { key: 'primaryHref', label: 'Główny przycisk – link', type: 'text', hint: linkHint },
      { key: 'secondaryLabel', label: 'Drugi przycisk – tekst', type: 'text' },
      { key: 'secondaryHref', label: 'Drugi przycisk – link', type: 'text', hint: linkHint },
      statsList,
    ],
    defaults: {
      eyebrow: 'Nowa sekcja',
      title: 'Nagłówek strony',
      titleAccent: '',
      lead: 'Krótki opis, który zachęci do czytania dalej.',
      image: IMAGES.fireTruckForest,
      size: 'compact',
      imagePosition: 'center',
      mobileImagePosition: 'right',
      primaryLabel: 'Bezpłatna wycena',
      primaryHref: '/kontakt#formularz',
      secondaryLabel: '',
      secondaryHref: '',
      stats: [],
    },
  },
  textImage: {
    label: 'Tekst + zdjęcie',
    description: 'Nagłówek, opis i lista atutów obok zdjęcia. Zdjęcie po lewej lub prawej.',
    icon: 'columns',
    fields: [
      eyebrow,
      title,
      titleAccent,
      { key: 'text', label: 'Tekst', type: 'textarea', hint: 'Pusta linia rozdziela akapity.' },
      { key: 'points', label: 'Lista z ptaszkami', type: 'strings', itemLabel: 'Punkt' },
      { key: 'image', label: 'Zdjęcie', type: 'image' },
      { key: 'secondaryImage', label: 'Małe zdjęcie (opcjonalne)', type: 'image' },
      { key: 'badgeValue', label: 'Plakietka – wartość (opcjonalna)', type: 'text' },
      { key: 'badgeLabel', label: 'Plakietka – opis', type: 'text' },
      {
        key: 'imagePosition',
        label: 'Zdjęcie',
        type: 'select',
        options: [
          { value: 'right', label: 'Po prawej' },
          { value: 'left', label: 'Po lewej' },
        ],
      },
      { key: 'linkLabel', label: 'Link pod tekstem – tekst', type: 'text' },
      { key: 'linkHref', label: 'Link pod tekstem – adres', type: 'text', hint: linkHint },
      background(),
    ],
    defaults: {
      eyebrow: 'Etykieta',
      title: 'Nagłówek sekcji',
      titleAccent: '',
      text: 'Opisz tutaj, co wyróżnia ofertę.',
      points: ['Pierwszy atut', 'Drugi atut'],
      image: IMAGES.welding,
      secondaryImage: '',
      badgeValue: '',
      badgeLabel: '',
      imagePosition: 'right',
      linkLabel: '',
      linkHref: '',
      background: 'light',
    },
  },
  features: {
    label: 'Kafelki z ikonami',
    description: 'Siatka 2–4 kafelków z ikoną, tytułem i opisem – zasady, atuty, usługi.',
    icon: 'grid',
    fields: [
      eyebrow,
      title,
      description,
      {
        key: 'items',
        label: 'Kafelki',
        type: 'list',
        itemLabel: 'Kafelek',
        fields: [
          { key: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
          { key: 'title', label: 'Tytuł', type: 'text' },
          { key: 'text', label: 'Opis', type: 'textarea' },
        ],
      },
      background('dark'),
    ],
    defaults: {
      eyebrow: 'Atuty',
      title: 'Dlaczego my',
      description: '',
      items: [
        { icon: 'ruler', title: 'Na wymiar', text: 'Projekt pod konkretny pojazd.' },
        { icon: 'wrench', title: 'Własna produkcja', text: 'Kontrola jakości na każdym etapie.' },
        { icon: 'shield', title: 'Bezpieczeństwo', text: 'Pewne mocowanie sprzętu.' },
      ],
      background: 'dark',
    },
  },
  steps: {
    label: 'Kroki procesu',
    description: 'Ponumerowane etapy ze zdjęciami – np. jak wygląda współpraca.',
    icon: 'list-ordered',
    fields: [
      eyebrow,
      title,
      titleAccent,
      description,
      {
        key: 'items',
        label: 'Kroki',
        type: 'list',
        itemLabel: 'Krok',
        fields: [
          { key: 'title', label: 'Tytuł', type: 'text' },
          { key: 'text', label: 'Opis', type: 'textarea' },
          { key: 'image', label: 'Zdjęcie', type: 'image' },
        ],
      },
    ],
    defaults: {
      eyebrow: 'Jak pracujemy',
      title: 'Proces',
      titleAccent: 'krok po kroku',
      description: '',
      items: [
        { title: 'Rozmowa', text: 'Poznajemy potrzeby.', image: IMAGES.measuring },
        { title: 'Projekt', text: 'Przygotowujemy rozwiązanie.', image: IMAGES.laserCutter },
        { title: 'Realizacja', text: 'Wykonujemy i montujemy.', image: IMAGES.weldingSparks },
      ],
    },
  },
  stats: {
    label: 'Liczby',
    description: 'Pasek z dużymi liczbami – doświadczenie, realizacje, gwarancja.',
    icon: 'hash',
    fields: [
      eyebrow,
      title,
      { ...statsList, key: 'items', label: 'Liczby' },
      {
        key: 'background',
        label: 'Tło',
        type: 'select',
        options: [
          { value: 'dark', label: 'Ciemne' },
          { value: 'red', label: 'Czerwone' },
          { value: 'light', label: 'Jasne' },
        ],
      },
    ],
    defaults: {
      eyebrow: '',
      title: '',
      items: [
        { value: '{realizacje}', label: 'realizacji' },
        { value: '{marki}', label: 'marek pojazdów' },
        { value: '100%', label: 'na wymiar' },
      ],
      background: 'dark',
    },
  },
  categories: {
    label: 'Kafelki produktów',
    description: 'Kategorie produktów ze zdjęciami – pobierane automatycznie z oferty.',
    icon: 'package',
    fields: [
      eyebrow,
      title,
      description,
      {
        key: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'bento', label: 'Jeden duży + mniejsze' },
          { value: 'grid', label: 'Równa siatka' },
        ],
      },
      {
        key: 'limit',
        label: 'Ile kategorii',
        type: 'select',
        options: [
          { value: '6', label: '6' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '8', label: '8' },
          { value: 'all', label: 'Wszystkie' },
        ],
      },
      background('muted'),
    ],
    defaults: { eyebrow: 'Oferta', title: 'Co dla Ciebie zrobimy', description: '', layout: 'bento', limit: '6', background: 'muted' },
  },
  projects: {
    label: 'Realizacje',
    description: 'Kafelki realizacji – wyróżnione albo najnowsze.',
    icon: 'truck',
    fields: [
      eyebrow,
      title,
      description,
      {
        key: 'source',
        label: 'Które realizacje',
        type: 'select',
        options: [
          { value: 'featured', label: 'Wyróżnione' },
          { value: 'latest', label: 'Najnowsze' },
        ],
      },
      {
        key: 'limit',
        label: 'Ile',
        type: 'select',
        options: [
          { value: '3', label: '3' },
          { value: '6', label: '6' },
          { value: '9', label: '9' },
        ],
      },
      background(),
    ],
    defaults: { eyebrow: 'Realizacje', title: 'Nasze realizacje', description: '', source: 'featured', limit: '3', background: 'light' },
  },
  brands: {
    label: 'Marki pojazdów',
    description: 'Siatka marek pojazdów z linkami do ich podstron.',
    icon: 'car',
    fields: [
      eyebrow,
      title,
      description,
      {
        key: 'show',
        label: 'Które marki',
        type: 'select',
        options: [
          { value: 'all', label: 'Ciężarowe i pickupy' },
          { value: 'truck', label: 'Tylko ciężarowe' },
          { value: 'pickup', label: 'Tylko pickupy' },
        ],
      },
      { key: 'compact', label: 'Kompaktowa lista bez modeli', type: 'boolean' },
      background('muted'),
    ],
    defaults: { eyebrow: 'Pojazdy', title: 'Znamy te podwozia', description: '', show: 'all', compact: false, background: 'muted' },
  },
  faq: {
    label: 'FAQ – pytania',
    description: 'Rozwijane pytania i odpowiedzi, opcjonalnie z ramką kontaktową.',
    icon: 'help',
    fields: [
      eyebrow,
      title,
      {
        key: 'items',
        label: 'Pytania',
        type: 'list',
        itemLabel: 'Pytanie',
        fields: [
          { key: 'q', label: 'Pytanie', type: 'text' },
          { key: 'a', label: 'Odpowiedź', type: 'textarea' },
        ],
      },
      { key: 'showContact', label: 'Pokaż ramkę z telefonem obok pytań', type: 'boolean' },
      { key: 'asideTitle', label: 'Ramka – nagłówek', type: 'text' },
      { key: 'asideText', label: 'Ramka – tekst', type: 'textarea' },
      background(),
    ],
    defaults: {
      eyebrow: 'FAQ',
      title: 'Najczęstsze pytania',
      items: [{ q: 'Pytanie?', a: 'Odpowiedź.' }],
      showContact: true,
      asideTitle: 'Nie znalazłeś odpowiedzi?',
      asideText: 'Zadzwoń – chętnie doradzimy.',
      background: 'light',
    },
  },
  text: {
    label: 'Tekst',
    description: 'Zwykły tekst z akapitami, śródtytułami i listami – np. regulamin, opis usługi.',
    icon: 'type',
    fields: [
      eyebrow,
      title,
      {
        key: 'text',
        label: 'Treść',
        type: 'textarea',
        hint: 'Pusta linia = nowy akapit. Linia zaczynająca się od „## ” = śródtytuł, od „- ” = punkt listy.',
      },
      {
        key: 'align',
        label: 'Wyrównanie',
        type: 'select',
        options: [
          { value: 'left', label: 'Do lewej' },
          { value: 'center', label: 'Wyśrodkowany' },
        ],
      },
      background(),
    ],
    defaults: { eyebrow: '', title: 'Nagłówek', text: 'Treść sekcji.', align: 'left', background: 'light' },
  },
  gallery: {
    label: 'Galeria zdjęć',
    description: 'Siatka zdjęć z powiększaniem po kliknięciu.',
    icon: 'images',
    fields: [
      eyebrow,
      title,
      description,
      {
        key: 'images',
        label: 'Zdjęcia',
        type: 'list',
        itemLabel: 'Zdjęcie',
        fields: [{ key: 'image', label: 'Zdjęcie', type: 'image' }],
      },
      background(),
    ],
    defaults: {
      eyebrow: 'Galeria',
      title: 'Zobacz z bliska',
      description: '',
      images: [{ image: IMAGES.fireTruckForest }, { image: IMAGES.hoseCompartment }, { image: IMAGES.weldingSparks }],
      background: 'light',
    },
  },
  quote: {
    label: 'Opinia / cytat',
    description: 'Duży cytat z autorem – opinia klienta albo motto firmy.',
    icon: 'quote',
    fields: [
      { key: 'quote', label: 'Cytat', type: 'textarea' },
      { key: 'author', label: 'Autor', type: 'text' },
      { key: 'role', label: 'Funkcja / jednostka', type: 'text' },
      { key: 'image', label: 'Zdjęcie w tle (opcjonalne)', type: 'image' },
    ],
    defaults: { quote: 'Treść opinii klienta.', author: 'Imię i nazwisko', role: 'Jednostka', image: '' },
  },
  video: {
    label: 'Wideo YouTube',
    description: 'Osadzony film z YouTube z nagłówkiem.',
    icon: 'video',
    fields: [
      eyebrow,
      title,
      description,
      { key: 'url', label: 'Link do filmu YouTube', type: 'text', hint: 'Np. https://www.youtube.com/watch?v=…' },
      background(),
    ],
    defaults: { eyebrow: 'Wideo', title: 'Zobacz nas w akcji', description: '', url: '', background: 'light' },
  },
  contact: {
    label: 'Dane kontaktowe',
    description: 'Telefon, e-mail, adres i godziny (z „Danych firmy”) z przyciskiem do formularza.',
    icon: 'phone',
    fields: [eyebrow, title, description, { key: 'buttonLabel', label: 'Przycisk', type: 'text' }, background('muted')],
    defaults: {
      eyebrow: 'Kontakt',
      title: 'Porozmawiajmy',
      description: 'Zadzwoń albo napisz – przygotujemy bezpłatną wycenę.',
      buttonLabel: 'Wypełnij formularz',
      background: 'muted',
    },
  },
  cta: {
    label: 'Pasek wezwania do działania',
    description: 'Wyrazisty pasek z nagłówkiem i przyciskami – zwykle na końcu strony.',
    icon: 'megaphone',
    fields: [
      title,
      description,
      { key: 'primaryLabel', label: 'Przycisk – tekst', type: 'text' },
      { key: 'primaryHref', label: 'Przycisk – link', type: 'text', hint: linkHint },
      { key: 'showPhone', label: 'Pokaż przycisk z telefonem', type: 'boolean' },
      {
        key: 'variant',
        label: 'Styl',
        type: 'select',
        options: [
          { value: 'red', label: 'Czerwony ze zdjęciem' },
          { value: 'dark', label: 'Ciemny' },
          { value: 'light', label: 'Jasny' },
        ],
      },
    ],
    defaults: {
      title: 'Masz pojazd do zabudowy?',
      description: 'Opisz pojazd i sprzęt, który ma się w nim znaleźć. Przygotujemy projekt i bezpłatną wycenę.',
      primaryLabel: 'Zamów wycenę',
      primaryHref: '/kontakt#formularz',
      showPhone: true,
      variant: 'red',
    },
  },
  // ---------- Sekcje „z danych” – stron kategorii produktów i marek pojazdów ----------
  entityHero: {
    label: 'Nagłówek strony (z danych)',
    description: 'Nazwa, opis i zdjęcie z formularza produktu / marki, z przyciskami.',
    icon: 'image',
    scope: 'entity',
    fields: [
      { key: 'eyebrow', label: 'Etykieta nad nazwą', type: 'text', hint: 'Puste = automatyczna (np. „Pojazd ciężarowy”).' },
      { key: 'showAside', label: 'Pokaż ramkę ze specyfikacją / modelami', type: 'boolean' },
      { key: 'primaryLabel', label: 'Przycisk wyceny – tekst', type: 'text', hint: 'Puste = brak przycisku. Formularz dostaje produkt lub pojazd automatycznie.' },
      { key: 'secondaryLabel', label: 'Drugi przycisk – tekst', type: 'text', hint: 'Przewija do pojazdów / produktów niżej na stronie. Możesz użyć {nazwa}.' },
    ],
    defaults: { eyebrow: '', showAside: true, primaryLabel: 'Zapytaj o wycenę', secondaryLabel: '' },
  },
  categoryFeatures: {
    label: 'Cechy i korzyści (z danych)',
    description: 'Dwie kolumny: cechy produktu i korzyści – listy z formularza kategorii.',
    icon: 'columns',
    scope: 'category',
    fields: [
      { key: 'featuresEyebrow', label: 'Cechy – etykieta', type: 'text' },
      { key: 'featuresTitle', label: 'Cechy – nagłówek', type: 'text' },
      { key: 'benefitsEyebrow', label: 'Korzyści – etykieta', type: 'text' },
      { key: 'benefitsTitle', label: 'Korzyści – nagłówek', type: 'text' },
    ],
    defaults: { featuresEyebrow: 'Cechy produktu', featuresTitle: 'Co dostajesz', benefitsEyebrow: 'Korzyści', benefitsTitle: 'Dlaczego z nami' },
  },
  entityDescription: {
    label: 'Opis rozszerzony (z danych)',
    description: 'Długi opis z formularza (pole „opis między produktami a galerią”) obok zdjęcia.',
    icon: 'columns',
    scope: 'entity',
    fields: [
      eyebrow,
      { key: 'title', label: 'Nagłówek', type: 'text', hint: 'Możesz użyć {nazwa}.' },
      { key: 'image', label: 'Zdjęcie (puste = z galerii)', type: 'image' },
      {
        key: 'imagePosition',
        label: 'Zdjęcie',
        type: 'select',
        options: [
          { value: 'right', label: 'Po prawej' },
          { value: 'left', label: 'Po lewej' },
        ],
      },
    ],
    defaults: { eyebrow: 'Więcej', title: '{nazwa}', image: '', imagePosition: 'right' },
  },
  categorySpecs: {
    label: 'Specyfikacja (z danych)',
    description: 'Tabela danych technicznych z formularza kategorii.',
    icon: 'hash',
    scope: 'category',
    fields: [eyebrow, title],
    defaults: { eyebrow: 'Specyfikacja', title: 'Dane techniczne' },
  },
  entityGallery: {
    label: 'Galeria (z danych)',
    description: 'Zdjęcia z galerii produktu / marki z powiększaniem.',
    icon: 'images',
    scope: 'entity',
    fields: [eyebrow, { key: 'title', label: 'Nagłówek', type: 'text', hint: 'Możesz użyć {nazwa}.' }],
    defaults: { eyebrow: 'Galeria', title: 'Zobacz z bliska' },
  },
  categoryVehicles: {
    label: 'Kompatybilne pojazdy (z danych)',
    description: 'Marki pojazdów przypisane do tej kategorii.',
    icon: 'car',
    scope: 'category',
    fields: [eyebrow, title, description],
    defaults: { eyebrow: 'Kompatybilne pojazdy', title: 'Dla jakich marek', description: 'Ten produkt wykonujemy dla następujących marek pojazdów.' },
  },
  brandCategories: {
    label: 'Produkty dla marki (z danych)',
    description: 'Kategorie produktów przypisane do tej marki pojazdu.',
    icon: 'package',
    scope: 'brand',
    fields: [eyebrow, { key: 'title', label: 'Nagłówek', type: 'text', hint: 'Możesz użyć {nazwa}.' }, description],
    defaults: { eyebrow: 'Produkty', title: 'Co zrobimy dla {nazwa}', description: 'Kategorie produktów, które wykonujemy dla tej marki pojazdu.' },
  },
  entityProjects: {
    label: 'Realizacje (z danych)',
    description: 'Realizacje z tej kategorii / dla tej marki.',
    icon: 'truck',
    scope: 'entity',
    fields: [
      eyebrow,
      { key: 'title', label: 'Nagłówek', type: 'text', hint: 'Możesz użyć {nazwa}.' },
      { key: 'linkLabel', label: 'Link do wszystkich – tekst', type: 'text', hint: 'Puste = brak linku.' },
    ],
    defaults: { eyebrow: 'Realizacje', title: 'Zrealizowane projekty', linkLabel: '' },
  },
} satisfies Record<string, BlockDef>

export type BlockType = keyof typeof BLOCKS
export const ALL_BLOCK_TYPES = Object.keys(BLOCKS) as BlockType[]
export const isBlockType = (t: unknown): t is BlockType => typeof t === 'string' && t in BLOCKS

export type BlockScope = 'page' | 'category' | 'brand'
const scopeOf = (type: BlockType) => (BLOCKS[type] as BlockDef).scope

// Sekcje dostępne w danym edytorze: zwykłe strony bez sekcji „z danych”, kategorie i marki – z własnymi
export function blockTypesFor(scope: BlockScope): BlockType[] {
  return ALL_BLOCK_TYPES.filter((type) => {
    const s = scopeOf(type)
    if (!s) return true
    if (scope === 'page') return false
    return s === 'entity' || s === scope
  })
}
export const isDataBlock = (type: BlockType) => Boolean(scopeOf(type))

// Typy dostępne na zwykłych stronach (dla zgodności z istniejącym kodem kreatora stron)
export const BLOCK_TYPES = blockTypesFor('page')

export const newBlockId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)

export function createBlock(type: BlockType): Block {
  return { id: newBlockId(), type, data: structuredClone(BLOCKS[type].defaults) as Values }
}

// Uzupełnia brakujące pola wartościami domyślnymi (np. po dodaniu nowego pola do bloku)
export function withDefaults(block: Block): Block {
  const def = BLOCKS[block.type]
  const empty = Object.fromEntries(def.fields.map((f) => [f.key, emptyValue(f)]))
  return { ...block, data: mergeValues({ ...empty, ...def.defaults }, block.data) }
}

export function sanitizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return []
  return input
    .slice(0, 60)
    .filter((b): b is { id?: unknown; type: BlockType; hidden?: unknown; data?: unknown } => !!b && isBlockType(b.type))
    .map((b) => ({
      id: typeof b.id === 'string' && b.id.length <= 64 ? b.id : newBlockId(),
      type: b.type,
      hidden: b.hidden === true ? true : undefined,
      data: sanitizeValues(BLOCKS[b.type].fields, b.data),
    }))
}

export function parseBlocks(json: string | null | undefined, scope: BlockScope = 'page'): Block[] {
  if (!json) return []
  try {
    const allowed = blockTypesFor(scope)
    return sanitizeBlocks(JSON.parse(json))
      .filter((b) => allowed.includes(b.type))
      .map(withDefaults)
  } catch {
    return []
  }
}

// ---------- Strony systemowe i ich domyślny układ (taki jak przed wprowadzeniem bloków) ----------

export const SYSTEM_PAGES = {
  home: { slug: 'strona-glowna', path: '/', title: 'Strona główna' },
  about: { slug: 'o-nas', path: '/o-nas', title: 'O nas' },
} as const

// Adresy zajęte przez stałe podstrony – nowa strona nie może ich użyć
export const RESERVED_SLUGS = [
  'strona-glowna',
  'o-nas',
  'oferta',
  'realizacje',
  'kontakt',
  'polityka-prywatnosci',
  'admin',
  'api',
  'podglad',
  'sitemap.xml',
  'robots.txt',
  'icon.svg',
  'opengraph-image',
]

const b = (id: string, type: BlockType, data: Values): Block => ({ id, type, data })

export const HOME_BLOCK_ORDER = ['home-hero', 'home-offer', 'home-projects', 'home-intro', 'home-process', 'home-brands', 'home-faq', 'home-cta']

export const DEFAULT_PAGE_BLOCKS: Record<string, Block[]> = {
  [SYSTEM_PAGES.home.slug]: [
    b('home-hero', 'hero', {
      eyebrow: 'PSP · OSP · Służby ratownicze',
      title: 'Zabudowy wozów strażackich',
      titleAccent: 'na wymiar',
      lead: 'Półki do kabin, skrytki, boksy na narzędzia i mocowania sprzętu – zaprojektowane pod Twój pojazd i wyposażenie Twojej jednostki.',
      image: IMAGES.heroTruck,
      size: 'full',
      primaryLabel: 'Bezpłatna wycena',
      primaryHref: '/kontakt#formularz',
      secondaryLabel: 'Zobacz realizacje',
      secondaryHref: '/realizacje',
      stats: [],
    }),
    b('home-intro', 'textImage', {
      eyebrow: 'Dlaczego Steel Solution',
      title: 'Sprzęt na swoim miejscu.',
      titleAccent: 'Zawsze.',
      text: 'W akcji liczą się sekundy. Dlatego każdą zabudowę projektujemy pod konkretny pojazd, konkretny sprzęt i sposób pracy załogi – tak, żeby wszystko było pod ręką, bezpiecznie zamocowane i odporne na lata eksploatacji.',
      points: [
        'Aluminium, stal nierdzewna i tworzywa odporne na UV',
        'Projekt pod konkretny pojazd i sprzęt jednostki',
        'Montaż bez ingerencji w strukturę pojazdu',
        'Jeden wykonawca – od pomiaru po odbiór',
      ],
      image: IMAGES.grinding,
      secondaryImage: IMAGES.hoseCompartment,
      badgeValue: '',
      badgeLabel: '',
      imagePosition: 'right',
      linkLabel: 'Poznaj nas bliżej',
      linkHref: '/o-nas',
      background: 'light',
    }),
    b('home-offer', 'categories', {
      eyebrow: 'Oferta',
      title: 'Co dla Ciebie zrobimy',
      description: 'Od pojedynczej półki w kabinie po kompletną zabudowę wozu ratowniczo-gaśniczego.',
      layout: 'bento',
      limit: '6',
      background: 'muted',
    }),
    b('home-process', 'steps', {
      eyebrow: 'Jak pracujemy',
      title: 'Od pomiaru do odbioru',
      titleAccent: 'w 4 krokach',
      description: 'Prowadzimy cały proces sami – nie musisz koordynować kilku firm.',
      items: [
        { title: 'Rozmowa i pomiar', text: 'Poznajemy pojazd, sprzęt i sposób pracy jednostki. Mierzymy kabinę i skrytki.', image: IMAGES.measuring },
        { title: 'Projekt', text: 'Rozplanowujemy rozmieszczenie sprzętu, wymiary i materiały. Akceptujesz projekt przed produkcją.', image: IMAGES.laserCutter },
        { title: 'Produkcja', text: 'Cięcie, gięcie, spawanie i wykończenie powierzchni we własnym warsztacie.', image: IMAGES.weldingSparks },
        { title: 'Montaż i odbiór', text: 'Montujemy zabudowę, sprawdzamy każde mocowanie i oddajemy pojazd gotowy do akcji.', image: IMAGES.fireTruckGarage },
      ],
    }),
    b('home-projects', 'projects', {
      eyebrow: 'Realizacje',
      title: 'Zobacz rozwiązania w praktyce',
      description: 'Zobacz, jak nasze zabudowy pracują w jednostkach w całej Polsce.',
      source: 'featured',
      limit: '3',
      background: 'light',
    }),
    b('home-brands', 'brands', {
      eyebrow: 'Pojazdy',
      title: 'Znamy te podwozia',
      description: 'Wybierz markę, aby zobaczyć produkty dopasowane do kabiny i nadwozia.',
      show: 'all',
      compact: true,
      background: 'muted',
    }),
    b('home-faq', 'faq', {
      eyebrow: 'FAQ',
      title: 'Najczęstsze pytania',
      items: [
        {
          q: 'Do jakich pojazdów wykonujecie zabudowy?',
          a: 'Do podwozi ciężarowych (MAN, Scania, Volvo, Mercedes-Benz, Renault, Iveco, DAF) oraz pickupów i SUV-ów. Jeśli Twojego pojazdu nie ma na liście – zadzwoń, wykonujemy też projekty nietypowe.',
        },
        {
          q: 'Ile trwa realizacja?',
          a: 'Zależy od zakresu. Pojedyncze półki czy mocowania to zwykle krótki termin, kompletna zabudowa wozu trwa dłużej. Dokładny harmonogram podajemy razem z wyceną.',
        },
        {
          q: 'Czy montaż wymaga ingerencji w konstrukcję pojazdu?',
          a: 'Nasze zabudowy projektujemy tak, by montować je bez ingerencji w strukturę pojazdu – wykorzystujemy istniejące punkty mocowań.',
        },
        {
          q: 'Czy pomagacie przy zamówieniach publicznych?',
          a: 'Tak. Pomagamy przygotować opis i specyfikację zabudowy potrzebną jednostce do przetargu lub zapytania ofertowego.',
        },
        {
          q: 'Jak przygotować zapytanie o wycenę?',
          a: 'Podaj markę i model pojazdu, rodzaj zabudowy oraz listę sprzętu do zamocowania. Zdjęcia kabiny lub skrytek bardzo pomagają – możesz dołączyć je do formularza wyceny.',
        },
      ],
      showContact: true,
      asideTitle: 'Nie znalazłeś odpowiedzi?',
      asideText: 'Zadzwoń – doradzimy, co sprawdzi się w Twoim pojeździe.',
      background: 'light',
    }),
    b('home-cta', 'cta', { ...BLOCKS.cta.defaults }),
  ].sort((a, b) => HOME_BLOCK_ORDER.indexOf(a.id) - HOME_BLOCK_ORDER.indexOf(b.id)),
  [SYSTEM_PAGES.about.slug]: [
    b('about-hero', 'hero', {
      eyebrow: 'O nas',
      title: 'Robimy zabudowy,',
      titleAccent: 'które pracują',
      lead: 'Steel Solution to warsztat, który projektuje i wykonuje wyposażenie pojazdów służb – od pojedynczej półki w kabinie po kompletną zabudowę wozu.',
      image: IMAGES.grinding,
      size: 'compact',
      primaryLabel: '',
      primaryHref: '',
      secondaryLabel: '',
      secondaryHref: '',
      stats: [],
    }),
    b('about-intro', 'textImage', {
      eyebrow: 'Kim jesteśmy',
      title: 'Specjaliści od wyposażenia pojazdów służb',
      titleAccent: '',
      text: 'Zajmujemy się zabudowami wozów strażackich, półkami do kabin, podestami, boksami na narzędzia, mocowaniami sprzętu i zabudowami pickupów. Pracujemy z podwoziami MAN, Scania, Volvo, Mercedes-Benz, Renault, Iveco i DAF oraz z popularnymi pickupami.\n\nStosujemy aluminium, stal nierdzewną i tworzywa odporne na UV, a każdą zabudowę projektujemy tak, by montować ją bez ingerencji w strukturę pojazdu.',
      points: ['Państwowa Straż Pożarna', 'Ochotnicze Straże Pożarne', 'Ratownictwo górskie i wodne', 'Leśnictwo i służby techniczne'],
      image: IMAGES.weldingSparks,
      secondaryImage: IMAGES.measuring,
      badgeValue: '',
      badgeLabel: '',
      imagePosition: 'left',
      linkLabel: '',
      linkHref: '',
      background: 'light',
    }),
    b('about-values', 'features', {
      eyebrow: 'Jak myślimy',
      title: 'Nasze zasady',
      description: '',
      items: [
        { icon: 'ruler', title: 'Na wymiar, nie z katalogu', text: 'Każdy pojazd i każda jednostka są inne. Projektujemy pod konkretną kabinę, skrytkę i sprzęt – nie dopasowujemy gotowców.' },
        { icon: 'wrench', title: 'Własna produkcja', text: 'Cięcie, gięcie, spawanie i wykończenie wykonujemy sami. Dzięki temu kontrolujemy jakość i terminy na każdym etapie.' },
        { icon: 'shield', title: 'Bezpieczeństwo w akcji', text: 'Sprzęt musi być pod ręką i pewnie zamocowany także w trakcie dynamicznej jazdy. To podstawowe założenie każdego projektu.' },
        { icon: 'users', title: 'Rozmawiamy z załogą', text: 'Najlepsze rozwiązania powstają po rozmowie z ludźmi, którzy na co dzień korzystają z pojazdu. Słuchamy i doradzamy.' },
      ],
      background: 'dark',
    }),
    b('about-projects', 'cta', {
      title: 'Zobacz, co już zbudowaliśmy',
      description: 'Realizacje dla jednostek PSP, OSP i służb ratowniczych.',
      primaryLabel: 'Przeglądaj realizacje',
      primaryHref: '/realizacje',
      showPhone: false,
      variant: 'light',
    }),
    b('about-cta', 'cta', { ...BLOCKS.cta.defaults }),
  ],
}

// Szablony nowej strony
export const PAGE_TEMPLATES: { key: string; label: string; description: string; blocks: () => Block[] }[] = [
  {
    key: 'service',
    label: 'Usługa / oferta',
    description: 'Hero, tekst ze zdjęciem, atuty, galeria, FAQ i wezwanie do kontaktu.',
    blocks: () => (['hero', 'textImage', 'features', 'gallery', 'faq', 'cta'] as BlockType[]).map(createBlock),
  },
  {
    key: 'info',
    label: 'Strona informacyjna',
    description: 'Hero i sekcja tekstu – np. regulamin, dofinansowania, kariera.',
    blocks: () => (['hero', 'text', 'cta'] as BlockType[]).map(createBlock),
  },
  { key: 'empty', label: 'Pusta strona', description: 'Zaczynasz od zera i dodajesz sekcje sam.', blocks: () => [createBlock('hero')] },
]

// ---------- Domyślny układ stron kategorii i marek (taki jak przed wprowadzeniem kreatora) ----------

export function defaultEntityBlocks(kind: 'category' | 'brand'): Block[] {
  if (kind === 'category') {
    return [
      b('cat-hero', 'entityHero', { eyebrow: 'Kategoria produktów', showAside: true, primaryLabel: 'Zapytaj o wycenę', secondaryLabel: 'Kompatybilne pojazdy' }),
      b('cat-features', 'categoryFeatures', { ...BLOCKS.categoryFeatures.defaults }),
      b('cat-description', 'entityDescription', { eyebrow: 'Więcej o produkcie', title: '{nazwa}', image: '', imagePosition: 'right' }),
      b('cat-specs', 'categorySpecs', { ...BLOCKS.categorySpecs.defaults }),
      b('cat-gallery', 'entityGallery', { eyebrow: 'Galeria', title: 'Zobacz z bliska' }),
      b('cat-vehicles', 'categoryVehicles', { ...BLOCKS.categoryVehicles.defaults }),
      b('cat-projects', 'entityProjects', { eyebrow: 'Realizacje', title: 'Zrealizowane projekty', linkLabel: 'Wszystkie z tej kategorii' }),
      b('cat-cta', 'cta', {
        title: 'Potrzebujesz wyceny?',
        description: 'Przygotujemy indywidualną ofertę – {nazwa_male} dopasowane do Twojego pojazdu.',
        primaryLabel: 'Zamów wycenę',
        primaryHref: '/kontakt?kategoria={slug}#formularz',
        showPhone: true,
        variant: 'red',
      }),
    ]
  }
  return [
    b('brand-hero', 'entityHero', { eyebrow: '', showAside: true, primaryLabel: 'Zapytaj o wycenę', secondaryLabel: 'Produkty dla {nazwa}' }),
    b('brand-categories', 'brandCategories', { ...BLOCKS.brandCategories.defaults }),
    b('brand-description', 'entityDescription', { eyebrow: '', title: 'Znamy te kabiny', image: '', imagePosition: 'right' }),
    b('brand-gallery', 'entityGallery', { eyebrow: 'Galeria', title: 'Zabudowy {nazwa}' }),
    b('brand-projects', 'entityProjects', { eyebrow: 'Realizacje', title: 'Realizacje {nazwa}', linkLabel: '' }),
    b('brand-cta', 'cta', {
      title: 'Masz {nazwa}?',
      description: 'Opisz model i sprzęt, który ma się w nim znaleźć – przygotujemy zabudowę dla Twojego {nazwa}.',
      primaryLabel: 'Zamów wycenę',
      primaryHref: '/kontakt?pojazd={nazwa}#formularz',
      showPhone: true,
      variant: 'red',
    }),
  ]
}

// Układ zapisany w bazie albo domyślny, gdy kategoria / marka nie ma jeszcze własnego
export function entityBlocks(json: string | null | undefined, kind: 'category' | 'brand'): Block[] {
  const saved = parseBlocks(json, kind)
  return saved.length > 0 ? saved : defaultEntityBlocks(kind).map(withDefaults)
}
