import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Czyścimy połączenia
  await prisma.categoryVehicleBrand.deleteMany()
  
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@zabudowy.pl" },
    update: {},
    create: {
      email: "admin@zabudowy.pl",
      password: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  })
  console.log("Created admin user:", admin.email)

  // ========== VEHICLE BRANDS ==========
  const vehicleBrandsData = [
    {
      name: 'MAN',
      slug: 'man',
      fullName: 'MAN Truck & Bus',
      description: 'Zabudowy do pojazdów MAN TGM, TGL, TGS i TGX. Kompleksowe wyposażenie kabin dla straży pożarnej.',
      longDescription: 'Specjalizujemy się w zabudowach do pojazdów MAN wykorzystywanych przez jednostki ratownicze. Oferujemy półki, podesty, mocowania sprzętu i kompletne wyposażenie kabin dla wszystkich generacji pojazdów MAN od 2005 roku.',
      contentDescription: 'Pojazdy MAN to jedne z najczęściej wybieranych pojazdów przez polskie jednostki straży pożarnej. Doskonale znamy specyfikę każdego modelu kabiny - od kompaktowego TGL po przestronne TGX. Nasze zabudowy są projektowane z myślą o ergonomii pracy strażaka i maksymalnym wykorzystaniu przestrzeni. Stosujemy materiały najwyższej jakości: aluminium lotnicze, stal nierdzewną i tworzywa odporne na UV. Wszystkie produkty montujemy bez ingerencji w strukturę pojazdu.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'TGM', years: '2007-2024' },
        { name: 'TGL', years: '2005-2024' },
        { name: 'TGS', years: '2007-2024' },
        { name: 'TGX', years: '2007-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy MAN | TGM, TGL, TGS - Pojazdy strażackie',
      metaDescription: 'Profesjonalne zabudowy do pojazdów MAN dla straży pożarnej. Półki, podesty, boksy.',
      sortOrder: 1,
      published: true,
    },
    {
      name: 'Scania',
      slug: 'scania',
      fullName: 'Scania AB',
      description: 'Wyposażenie kabin Scania P, G, R i S-Series. Szwedzka jakość dla polskich służb ratunkowych.',
      longDescription: 'Oferujemy pełen zakres zabudów do pojazdów Scania wszystkich serii. Od kompaktowych kabin P-Series po przestronne S-Series - każdy produkt jest dedykowany konkretnemu modelowi.',
      contentDescription: 'Scania to marka kojarzona z niezawodnością i komfortem. Nasze zabudowy powstają z myślą o tych wartościach. Dedykowane półki idealnie wpasowują się w krzywiznę kabin Scania, a systemy mocowań wykorzystują fabryczne punkty montażowe. Szczególną uwagę przykładamy do wykończenia - kolory i faktury są dopasowane do wnętrza kabiny.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'P-Series', years: '2004-2024' },
        { name: 'G-Series', years: '2007-2024' },
        { name: 'R-Series', years: '2004-2024' },
        { name: 'S-Series', years: '2016-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Scania | P, G, R, S Series',
      metaDescription: 'Zabudowy do kabin Scania dla straży pożarnej.',
      sortOrder: 2,
      published: true,
    },
    {
      name: 'Volvo',
      slug: 'volvo',
      fullName: 'Volvo Trucks',
      description: 'Półki i zabudowy do Volvo FH, FM, FMX, FE i FL. Skandynawskie standardy bezpieczeństwa.',
      longDescription: 'Zabudowy dla pojazdów Volvo projektujemy z uwzględnieniem filozofii marki - bezpieczeństwo i ergonomia na pierwszym miejscu. Obsługujemy wszystkie serie od kompaktowych FL po flagowe FH.',
      contentDescription: 'Volvo słynie z bezpieczeństwa i to podejście przenosimy na nasze produkty. Każda półka jest testowana pod kątem zachowania podczas kolizji, a mocowania sprzętu spełniają najsurowsze normy. Szczególnie polecamy nasze rozwiązania do serii FMX - wzmocnione zabudowy dla pojazdów pracujących w trudnych warunkach terenowych.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'FH', years: '1993-2024' },
        { name: 'FM', years: '1998-2024' },
        { name: 'FMX', years: '2010-2024' },
        { name: 'FE', years: '2006-2024' },
        { name: 'FL', years: '2006-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Volvo | FH, FM, FMX - Straż pożarna',
      metaDescription: 'Półki i zabudowy do pojazdów Volvo dla służb ratunkowych.',
      sortOrder: 3,
      published: true,
    },
    {
      name: 'Mercedes-Benz',
      slug: 'mercedes',
      fullName: 'Mercedes-Benz Trucks',
      description: 'Zabudowy do Mercedes Atego, Actros, Arocs i Econic. Niemiecka precyzja dla profesjonalistów.',
      longDescription: 'Mercedes-Benz Atego to najpopularniejszy pojazd strażacki w Polsce. Nasze zabudowy są dedykowane wszystkim generacjom tego modelu oraz pozostałym pojazdom z rodziny Mercedes Trucks.',
      contentDescription: 'Mercedes-Benz to synonim precyzji i jakości. Nasze produkty powstają z dokładnością ±0.5mm, co gwarantuje idealne dopasowanie. Szczególnie bogata jest oferta dla Atego - posiadamy rozwiązania dla wszystkich generacji od 1998 roku. Oferujemy też specjalistyczne zabudowy do Econic dla jednostek miejskich.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'Atego', years: '1998-2024' },
        { name: 'Actros', years: '1996-2024' },
        { name: 'Arocs', years: '2013-2024' },
        { name: 'Econic', years: '1998-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Mercedes-Benz | Atego, Actros',
      metaDescription: 'Zabudowy do pojazdów Mercedes-Benz dla straży.',
      sortOrder: 4,
      published: true,
    },
    {
      name: 'Renault Trucks',
      slug: 'renault',
      fullName: 'Renault Trucks',
      description: 'Wyposażenie do Renault D, C, K i T-Series. Funkcjonalne rozwiązania w rozsądnej cenie.',
      longDescription: 'Renault Trucks oferuje pojazdy o świetnym stosunku jakości do ceny. Nasze zabudowy kontynuują tę filozofię - funkcjonalność i trwałość bez przepłacania.',
      contentDescription: 'Pojazdy Renault Trucks zyskują coraz większą popularność w polskich jednostkach. Oferujemy kompletne wyposażenie dla wszystkich serii - od miejskich D-Series po terenowe K-Series. Nasze produkty charakteryzują się prostotą montażu i uniwersalnością zastosowań.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'D-Series', years: '2013-2024' },
        { name: 'C-Series', years: '2013-2024' },
        { name: 'K-Series', years: '2013-2024' },
        { name: 'T-Series', years: '2013-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Renault Trucks | D, C, K, T',
      metaDescription: 'Wyposażenie do pojazdów Renault Trucks.',
      sortOrder: 5,
      published: true,
    },
    {
      name: 'Iveco',
      slug: 'iveco',
      fullName: 'Iveco S.p.A.',
      description: 'Zabudowy do Iveco Daily, Eurocargo, Stralis i S-Way. Rozwiązania od lekkich po ciężkie pojazdy.',
      longDescription: 'Iveco Daily to jeden z najpopularniejszych pojazdów w polskich OSP. Specjalizujemy się w zabudowach do wszystkich generacji Daily oraz większych pojazdów Iveco.',
      contentDescription: 'Iveco Daily 4x4 to ulubiony pojazd jednostek OSP działających w trudnym terenie. Mamy bogate doświadczenie w zabudowach tego modelu - od półek w kabinie po kompletne systemy organizacji przestrzeni ładunkowej. Dla większych jednostek oferujemy rozwiązania do Eurocargo i najnowszego S-Way.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'Daily', years: '1999-2024' },
        { name: 'Eurocargo', years: '1991-2024' },
        { name: 'Stralis', years: '2002-2024' },
        { name: 'S-Way', years: '2019-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Iveco | Daily, Eurocargo',
      metaDescription: 'Zabudowy do pojazdów Iveco.',
      sortOrder: 6,
      published: true,
    },
    {
      name: 'DAF',
      slug: 'daf',
      fullName: 'DAF Trucks N.V.',
      description: 'Wyposażenie do DAF LF, CF, XF i XG. Holenderska solidność w polskich pojazdach.',
      longDescription: 'DAF to marka ceniona za komfort kabin i niezawodność. Nasze zabudowy są projektowane z myślą o maksymalnym wykorzystaniu ergonomicznej przestrzeni kabin DAF.',
      contentDescription: 'Kabiny DAF słyną z przestronności i przemyślanej ergonomii. Nasze półki i organizery pozwalają wykorzystać każdy centymetr tej przestrzeni. Oferujemy rozwiązania dla wszystkich serii - od kompaktowego LF idealnego dla miejskich jednostek, po nową generację XG.',
      type: 'truck',
      models: JSON.stringify([
        { name: 'LF', years: '2001-2024' },
        { name: 'CF', years: '2001-2024' },
        { name: 'XF', years: '1997-2024' },
        { name: 'XG', years: '2021-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy DAF | LF, CF, XF, XG',
      metaDescription: 'Wyposażenie do pojazdów DAF.',
      sortOrder: 7,
      published: true,
    },
    // ========== PICKUPS ==========
    {
      name: 'Toyota Hilux',
      slug: 'toyota-hilux',
      fullName: 'Toyota Hilux',
      description: 'Zabudowy skrzyni ładunkowej Toyota Hilux. Hardtopy, platformy i boksy dla służb ratunkowych.',
      longDescription: 'Toyota Hilux to legendarny pickup wybierany przez jednostki do zadań terenowych. Oferujemy kompletne zabudowy zachowujące pełne możliwości off-road.',
      contentDescription: 'Hilux to najczęściej wybierany pickup przez polskie służby ratunkowe. Oferujemy hardtopy aluminiowe i kompozytowe, zabudowy typu service body z boksami narzędziowymi oraz platformy dachowe. Wszystkie nasze rozwiązania są projektowane tak, by nie ograniczać zdolności terenowych pojazdu.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'Hilux AN120', years: '2015-2020' },
        { name: 'Hilux AN130', years: '2020-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Toyota Hilux | Hardtopy',
      metaDescription: 'Zabudowy do Toyota Hilux dla straży.',
      sortOrder: 10,
      published: true,
    },
    {
      name: 'Ford Ranger',
      slug: 'ford-ranger',
      fullName: 'Ford Ranger',
      description: 'Zabudowy Ford Ranger T6, T7 i Raptor. Amerykańska moc z europejskim wykończeniem.',
      longDescription: 'Ford Ranger to popularny pickup o dużych możliwościach. Nasze zabudowy są dostępne dla wszystkich wersji, włącznie ze sportowym Raptorem.',
      contentDescription: 'Ranger to wszechstronny pickup z mocnym silnikiem i dobrymi właściwościami terenowymi. Oferujemy hardtopy premium z podgrzewanymi szybami, zabudowy aluminiowe i systemy szuflad. Dla wersji Raptor mamy specjalne rozwiązania zachowujące sportowy charakter pojazdu.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'Ranger T6', years: '2011-2019' },
        { name: 'Ranger T7', years: '2019-2024' },
        { name: 'Ranger Raptor', years: '2019-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Ford Ranger',
      metaDescription: 'Zabudowy do Ford Ranger.',
      sortOrder: 11,
      published: true,
    },
    {
      name: 'Nissan Navara',
      slug: 'nissan-navara',
      fullName: 'Nissan Navara NP300',
      description: 'Hardtopy i zabudowy Nissan Navara NP300. Japońska niezawodność w służbie ratunkowej.',
      longDescription: 'Nissan Navara to solidny pickup z komfortowym wnętrzem. Oferujemy zabudowy typu canopy, rolety i platformy dachowe.',
      contentDescription: 'Navara NP300 wyróżnia się komfortowym zawieszeniem i przestronną kabiną. Nasze hardtopy są dopasowane do linii nadwozia, a systemy boksów pozwalają na profesjonalną organizację sprzętu. Idealne rozwiązanie dla jednostek patrolowych i grup specjalistycznych.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'NP300', years: '2015-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Nissan Navara',
      metaDescription: 'Zabudowy do Nissan Navara.',
      sortOrder: 12,
      published: true,
    },
    {
      name: 'Mitsubishi L200',
      slug: 'mitsubishi-l200',
      fullName: 'Mitsubishi L200 Triton',
      description: 'Zabudowy Mitsubishi L200. Sprawdzony w najtrudniejszych warunkach terenowych.',
      longDescription: 'Mitsubishi L200 to legenda rajdów i jeden z najwytrzymalszych pickupów. Nasze zabudowy dorównują tej reputacji.',
      contentDescription: 'L200 to pickup przetestowany w rajdach Dakar i górskich akcjach ratunkowych. Oferujemy wzmocnione zabudowy dla jednostek GOPR i TOPR, hardtopy z systemem Super Select 4WD oraz platformy pod ciężki sprzęt. Wszystko projektowane z myślą o ekstremalnych warunkach.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'L200 KL', years: '2019-2024' },
        { name: 'L200 KK', years: '2015-2019' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Mitsubishi L200',
      metaDescription: 'Zabudowy do Mitsubishi L200.',
      sortOrder: 13,
      published: true,
    },
    {
      name: 'Volkswagen Amarok',
      slug: 'volkswagen-amarok',
      fullName: 'Volkswagen Amarok',
      description: 'Premium zabudowy Volkswagen Amarok. Niemiecka jakość dla wymagających jednostek.',
      longDescription: 'Amarok to pickup klasy premium łączący komfort z możliwościami terenowymi. Nasze zabudowy odpowiadają temu poziomowi.',
      contentDescription: 'Amarok to wybór jednostek stawiających na jakość i prestiż. Oferujemy zabudowy z materiałów kompozytowych, hardtopy z elektrycznym otwieraniem i zaawansowane systemy organizacji. Nowa generacja obsługuje pełną integrację z systemami elektronicznymi pojazdu.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'Amarok 2H', years: '2010-2023' },
        { name: 'Amarok H1', years: '2023-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Volkswagen Amarok',
      metaDescription: 'Zabudowy do Volkswagen Amarok.',
      sortOrder: 14,
      published: true,
    },
    {
      name: 'Isuzu D-Max',
      slug: 'isuzu-dmax',
      fullName: 'Isuzu D-Max',
      description: 'Zabudowy Isuzu D-Max. Legendarna trwałość silników diesla w służbie ratunkowej.',
      longDescription: 'Isuzu D-Max słynie z niezawodnych silników diesla i prostoty konstrukcji. Nasze zabudowy są równie solidne i funkcjonalne.',
      contentDescription: 'D-Max to pickup dla tych, którzy cenią prostotę i niezawodność. Oferujemy praktyczne zabudowy serwisowe, hardtopy z bocznym dostępem i platformy dachowe. Idealne dla jednostek technicznych i logistycznych.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'D-Max RG', years: '2019-2024' },
        { name: 'D-Max RT', years: '2012-2019' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy Isuzu D-Max',
      metaDescription: 'Zabudowy do Isuzu D-Max.',
      sortOrder: 15,
      published: true,
    },
    {
      name: 'SsangYong Musso',
      slug: 'ssangyong-musso',
      fullName: 'SsangYong Musso',
      description: 'Zabudowy SsangYong Musso. Ekonomiczne rozwiązanie dla jednostek z ograniczonym budżetem.',
      longDescription: 'SsangYong Musso oferuje bogate wyposażenie w atrakcyjnej cenie. Nasze zabudowy kontynuują tę filozofię.',
      contentDescription: 'Musso to świetna alternatywa dla jednostek szukających nowego pickupa w rozsądnej cenie. Oferujemy hardtopy, platformy i boksy w cenach konkurencyjnych wobec używanych pojazdów innych marek. Pełna funkcjonalność bez przepłacania.',
      type: 'pickup',
      models: JSON.stringify([
        { name: 'Musso', years: '2018-2024' },
        { name: 'Musso Grand', years: '2019-2024' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy SsangYong Musso',
      metaDescription: 'Zabudowy do SsangYong Musso.',
      sortOrder: 16,
      published: true,
    },
  ]

  const vehicleBrands: Record<string, any> = {}
  for (const brand of vehicleBrandsData) {
    const created = await prisma.vehicleBrand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    })
    vehicleBrands[brand.slug] = created
  }
  console.log("Created vehicle brands:", Object.keys(vehicleBrands).length)

  // ========== CATEGORIES (PRODUKTY) ==========
  const categoriesData = [
    {
      name: 'Zabudowy wozów strażackich',
      slug: 'wozy-strazackie',
      icon: 'Truck',
      color: '#dc2626',
      description: 'Kompletne zabudowy wozów strażackich. Skrytki, półki wysuwane, systemy mocowań i oświetlenie.',
      longDescription: 'Realizujemy kompleksowe zabudowy wozów strażackich od projektu po montaż. Specjalizujemy się w pojazdach dla PSP i OSP - gaśniczych, ratowniczo-gaśniczych i specjalnych.',
      contentDescription: 'Zabudowy wozów strażackich to nasza główna specjalizacja. Wykonujemy skrytki aluminiowe z półkami wysuwnymi, systemy mocowań sprzętu zgodne z CNBOP, instalacje elektryczne i oświetlenie LED. Każdy projekt jest indywidualny - dostosowujemy rozwiązania do potrzeb jednostki i wymogów przetargowych. Współpracujemy z głównymi producentami podwozi i nadwozi strażackich.',
      features: JSON.stringify([
        'Skrytki aluminiowe anodowane',
        'Półki wysuwne pod sprzęt ratowniczy',
        'Systemy mocowań zgodne z DIN EN 1846',
        'Oświetlenie LED robocze i sceniczne',
        'Instalacje elektryczne 12V/24V',
      ]),
      benefits: JSON.stringify([
        'Kompleksowa realizacja od projektu po montaż',
        'Certyfikaty CNBOP-PIB',
        'Gwarancja 36 miesięcy',
        'Wsparcie w przetargach publicznych',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium 3-5mm anodowane' },
        { label: 'Certyfikaty', value: 'CNBOP-PIB, KDR' },
        { label: 'Realizacja', value: '4-12 tygodni' },
        { label: 'Gwarancja', value: '36 miesięcy' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy wozów strażackich | PSP i OSP',
      metaDescription: 'Kompleksowe zabudowy wozów strażackich z certyfikatami CNBOP.',
      sortOrder: 0,
      published: true,
      vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'renault', 'iveco', 'daf'],
    },
    {
      name: 'Półki do kabin',
      slug: 'polki-do-kabin',
      icon: 'LayoutGrid',
      color: '#3b82f6',
      description: 'Dedykowane półki górne, boczne i pod siedzenia. Idealne dopasowanie do każdej marki pojazdu.',
      longDescription: 'Półki projektowane indywidualnie dla każdego modelu kabiny. Wykonane z aluminium lub stali, malowane proszkowo w kolorze wnętrza. Montaż bez wiercenia.',
      contentDescription: 'Nasze półki to bestseller wśród jednostek ratowniczych. Precyzyjnie dopasowane do każdej generacji kabin MAN, Scania, Volvo, Mercedes, DAF, Renault i Iveco. Wykonane z aluminium 2mm lub stali nierdzewnej, malowane proszkowo w dowolnym kolorze RAL. Montaż bezinwazyjny - nie naruszamy struktury kabiny. Obciążenie do 30 kg.',
      features: JSON.stringify([
        'Półki górne na całą szerokość kabiny',
        'Półki boczne z przegródkami',
        'Półki pod siedzenia pasażera',
        'Organizery na latarki i rękawice',
        'Opcjonalne oświetlenie LED',
      ]),
      benefits: JSON.stringify([
        'Idealne dopasowanie do modelu kabiny',
        'Montaż bez wiercenia',
        'Szybki dostęp do sprzętu',
        'Malowanie w kolorze wnętrza',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium 2mm / Stal nierdzewna' },
        { label: 'Wykończenie', value: 'Malowanie proszkowe RAL' },
        { label: 'Obciążenie', value: 'Do 30 kg' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Półki do kabin | MAN, Scania, Volvo, Mercedes',
      metaDescription: 'Dedykowane półki do kabin pojazdów ciężarowych.',
      sortOrder: 1,
      published: true,
      vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'renault', 'iveco', 'daf'],
    },
    {
      name: 'Podesty i stopnie',
      slug: 'podesty-i-stopnie',
      icon: 'Footprints',
      color: '#22c55e',
      description: 'Aluminiowe podesty robocze i stopnie wejściowe. Bezpieczna praca na wysokości.',
      longDescription: 'Podesty i stopnie ze stopu aluminium 6061-T6. Antypoślizgowa powierzchnia, obciążenie do 300 kg. Zgodność z normami BHP.',
      contentDescription: 'Bezpieczeństwo pracy przy pojazdach to priorytet. Nasze podesty robocze i stopnie wejściowe są wykonane z aluminium lotniczego 6061-T6 spawanego metodą TIG. Powierzchnia antypoślizgowa z blachy ryflowanej zapewnia pewne oparcie w każdych warunkach. Obciążenie do 300 kg, pełna zgodność z przepisami BHP.',
      features: JSON.stringify([
        'Podesty robocze składane i stałe',
        'Stopnie wejściowe antypoślizgowe',
        'Drabinki boczne i tylne',
        'Platformy na dach',
      ]),
      benefits: JSON.stringify([
        'Bezpieczeństwo pracy na wysokości',
        'Lekka konstrukcja aluminiowa',
        'Antypoślizgowa powierzchnia',
        'Zgodność z BHP',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium 6061-T6' },
        { label: 'Obciążenie', value: 'Do 300 kg' },
        { label: 'Spawanie', value: 'TIG certyfikowane' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Podesty i stopnie aluminiowe',
      metaDescription: 'Podesty robocze i stopnie wejściowe dla pojazdów.',
      sortOrder: 2,
      published: true,
      vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco', 'daf'],
    },
    {
      name: 'Boksy na narzędzia',
      slug: 'boksy-na-narzedzia',
      icon: 'Box',
      color: '#f97316',
      description: 'Aluminiowe boksy narzędziowe pod zabudowę i na skrzynię. Organizacja sprzętu ratowniczego.',
      longDescription: 'Boksy aluminiowe do montażu na ramie pojazdu lub w skrzyni pickupa. Systemy szuflad, półki i organizery na narzędzia ratownicze.',
      contentDescription: 'Boksy narzędziowe to podstawa organizacji sprzętu w pojazdach ratunkowych. Oferujemy boksy podskrzyniowe montowane na ramie, boksy do skrzyni pickupów oraz kompleksowe systemy szuflad. Wszystko z aluminium anodowanego, z zamkami na klucz lub klamkami obrotowymi. Możliwość wykonania w dowolnym wymiarze.',
      features: JSON.stringify([
        'Boksy podskrzyniowe na ramę',
        'Boksy do skrzyni pickupa',
        'Systemy szuflad wysuwanych',
        'Organizery na drobny sprzęt',
      ]),
      benefits: JSON.stringify([
        'Profesjonalna organizacja sprzętu',
        'Zamykane na klucz',
        'Dowolne wymiary na zamówienie',
        'Odporne na warunki atmosferyczne',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium 2-3mm anodowane' },
        { label: 'Zamki', value: 'Cylindryczne lub klamki obrotowe' },
        { label: 'Uszczelnienie', value: 'Guma EPDM' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Boksy narzędziowe aluminiowe',
      metaDescription: 'Aluminiowe boksy na narzędzia do pojazdów.',
      sortOrder: 3,
      published: true,
      vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'nissan-navara', 'mitsubishi-l200', 'volkswagen-amarok', 'isuzu-dmax'],
    },
    {
      name: 'Mocowania sprzętu',
      slug: 'mocowania-sprzetu',
      icon: 'Shield',
      color: '#8b5cf6',
      description: 'Systemy mocowań na gaśnice, sprzęt hydrauliczny i ratowniczy. Zgodność z CNBOP.',
      longDescription: 'Certyfikowane mocowania na sprzęt ratowniczy - gaśnice, narzędzia hydrauliczne, nosze i deski ortopedyczne. Zgodne z normami CNBOP i DIN.',
      contentDescription: 'Bezpieczne mocowanie sprzętu to kluczowy element każdego pojazdu ratowniczego. Nasze uchwyty są certyfikowane zgodnie z wymogami CNBOP i normą DIN EN 1846. Oferujemy mocowania na gaśnice wszystkich typów, narzędzia hydrauliczne Holmatro, Lukas i Weber, nosze i deski ortopedyczne oraz drobny sprzęt ratowniczy.',
      features: JSON.stringify([
        'Mocowania na gaśnice 2-12 kg',
        'Uchwyty na sprzęt hydrauliczny',
        'Mocowania noszy i desek',
        'Systemy na drobny sprzęt',
      ]),
      benefits: JSON.stringify([
        'Certyfikacja CNBOP',
        'Zgodność z DIN EN 1846',
        'Szybkie zwalnianie sprzętu',
        'Pewne mocowanie podczas jazdy',
      ]),
      specifications: JSON.stringify([
        { label: 'Certyfikaty', value: 'CNBOP-PIB, DIN EN 1846' },
        { label: 'Materiał', value: 'Stal ocynkowana / Aluminium' },
        { label: 'Obciążenie', value: 'Zależne od typu' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Mocowania sprzętu ratowniczego | CNBOP',
      metaDescription: 'Certyfikowane mocowania na sprzęt ratowniczy.',
      sortOrder: 4,
      published: true,
      vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco'],
    },
    {
      name: 'Zabudowy pickupów',
      slug: 'zabudowy-pickup',
      icon: 'Truck',
      color: '#eab308',
      description: 'Hardtopy, canopy i zabudowy serwisowe do pickupów. Hilux, Ranger, Navara, L200 i inne.',
      longDescription: 'Kompletne zabudowy skrzyni ładunkowej pickupów - hardtopy aluminiowe i kompozytowe, zabudowy serwisowe z boksami, platformy dachowe.',
      contentDescription: 'Pickupy są coraz częściej wykorzystywane przez służby ratunkowe. Oferujemy hardtopy zachowujące linię nadwozia, zabudowy serwisowe typu service body z profesjonalną organizacją przestrzeni oraz platformy dachowe pod sprzęt. Wszystkie produkty są projektowane tak, by nie ograniczać możliwości terenowych pojazdu.',
      features: JSON.stringify([
        'Hardtopy aluminiowe i kompozytowe',
        'Zabudowy serwisowe z boksami',
        'Platformy dachowe',
        'Rolety aluminiowe',
      ]),
      benefits: JSON.stringify([
        'Zachowanie możliwości terenowych',
        'Ochrona sprzętu przed warunkami',
        'Profesjonalna organizacja przestrzeni',
        'Dopasowanie do linii nadwozia',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium / Kompozyt' },
        { label: 'Zamknięcie', value: 'Centralne lub na klucz' },
        { label: 'Okna', value: 'Opcjonalne, otwierane' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Zabudowy pickupów | Hardtopy',
      metaDescription: 'Hardtopy i zabudowy do pickupów.',
      sortOrder: 5,
      published: true,
      vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'nissan-navara', 'mitsubishi-l200', 'volkswagen-amarok', 'isuzu-dmax', 'ssangyong-musso'],
    },
    {
      name: 'Skrzynie dachowe',
      slug: 'skrzynie-dachowe',
      icon: 'Package',
      color: '#06b6d4',
      description: 'Aluminiowe skrzynie i boksy dachowe. Dodatkowa przestrzeń na sprzęt lekki.',
      longDescription: 'Skrzynie dachowe wykonane z aluminium anodowanego. Montaż na relingach lub belkach poprzecznych. Idealne na sprzęt lekki i rzadziej używany.',
      contentDescription: 'Skrzynie dachowe pozwalają wykorzystać przestrzeń na dachu pojazdu. Wykonujemy je z aluminium anodowanego o grubości 2mm, z uszczelnieniem EPDM zapewniającym wodoszczelność. Montaż na fabrycznych relingach lub dedykowanych belkach poprzecznych. Zamknięcie na klucz, opcjonalne siłowniki wspomagające otwieranie.',
      features: JSON.stringify([
        'Skrzynie różnych rozmiarów',
        'Montaż na relingach lub belkach',
        'Uszczelnienie wodoszczelne',
        'Zamknięcie na klucz',
      ]),
      benefits: JSON.stringify([
        'Dodatkowa przestrzeń ładunkowa',
        'Wodoszczelna konstrukcja',
        'Łatwy dostęp do zawartości',
        'Nie ogranicza widoczności',
      ]),
      specifications: JSON.stringify([
        { label: 'Materiał', value: 'Aluminium 2mm anodowane' },
        { label: 'Uszczelnienie', value: 'EPDM wodoszczelne' },
        { label: 'Obciążenie', value: 'Zależne od relingów' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Skrzynie dachowe aluminiowe',
      metaDescription: 'Aluminiowe skrzynie i boksy dachowe.',
      sortOrder: 6,
      published: true,
      vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'mitsubishi-l200', 'volkswagen-amarok'],
    },
    {
      name: 'Oświetlenie LED',
      slug: 'oswietlenie-led',
      icon: 'Lightbulb',
      color: '#f59e0b',
      description: 'Lampy robocze LED, listwy sceniczne i oświetlenie skrytek. Wysoka jasność, niskie zużycie.',
      longDescription: 'Profesjonalne oświetlenie LED do pojazdów ratunkowych - lampy robocze, listwy sceniczne, oświetlenie skrytek i przestrzeni ładunkowej.',
      contentDescription: 'Dobre oświetlenie to podstawa bezpiecznej pracy podczas nocnych akcji. Oferujemy lampy robocze LED o jasności do 15000 lumenów, listwy sceniczne do oświetlenia terenu wokół pojazdu oraz oświetlenie skrytek z automatycznym włączaniem. Wszystkie produkty w klasie szczelności IP67 lub wyższej.',
      features: JSON.stringify([
        'Lampy robocze LED',
        'Listwy sceniczne',
        'Oświetlenie skrytek',
        'Lampy ostrzegawcze',
      ]),
      benefits: JSON.stringify([
        'Wysoka jasność do 15000 lm',
        'Niskie zużycie energii',
        'Klasa szczelności IP67+',
        'Długa żywotność LED',
      ]),
      specifications: JSON.stringify([
        { label: 'Technologia', value: 'LED CREE / OSRAM' },
        { label: 'Jasność', value: 'Do 15000 lumenów' },
        { label: 'Szczelność', value: 'IP67 - IP69K' },
        { label: 'Gwarancja', value: '24 miesiące' },
      ]),
      heroImage: '',
      gallery: JSON.stringify([]),
      metaTitle: 'Oświetlenie LED do pojazdów',
      metaDescription: 'Profesjonalne oświetlenie LED dla służb ratunkowych.',
      sortOrder: 7,
      published: true,
      vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco', 'toyota-hilux', 'ford-ranger'],
    },
  ]

  const categories: Record<string, any> = {}
  for (const cat of categoriesData) {
    const { vehicleSlugs, ...categoryData } = cat
    const created = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    })
    categories[cat.slug] = { ...created, vehicleSlugs }
  }
  console.log("Created categories:", Object.keys(categories).length)

  // ========== RELACJE CATEGORY <-> VEHICLE BRAND ==========
  console.log("Creating category-vehicle relations...")
  for (const [slug, cat] of Object.entries(categories)) {
    if (cat.vehicleSlugs && Array.isArray(cat.vehicleSlugs)) {
      for (const vehicleSlug of cat.vehicleSlugs) {
        const vehicle = vehicleBrands[vehicleSlug]
        if (vehicle) {
          await prisma.categoryVehicleBrand.upsert({
            where: {
              categoryId_vehicleBrandId: {
                categoryId: cat.id,
                vehicleBrandId: vehicle.id,
              },
            },
            update: {},
            create: {
              categoryId: cat.id,
              vehicleBrandId: vehicle.id,
            },
          })
        }
      }
    }
  }
  console.log("Created category-vehicle relations")

  // ========== PROJEKTY ==========
  const projectsData = [
    {
      title: 'MAN TGM 18.290 dla OSP Wieliczka',
      slug: 'man-tgm-osp-wieliczka',
      description: 'Kompleksowa zabudowa średniego wozu ratowniczo-gaśniczego na podwoziu MAN TGM.',
      content: 'Realizacja obejmowała kompletne wyposażenie kabiny załogi i przedziału sprzętowego.',
      thumbnail: '',
      images: JSON.stringify([]),
      vehicleBrand: 'MAN',
      vehicleModel: 'TGM 18.290',
      year: '2024',
      featured: true,
      published: true,
      categoryId: categories['wozy-strazackie']?.id,
      authorId: admin.id,
    },
    {
      title: 'Półki do Scania P280 PSP Kraków',
      slug: 'polki-scania-psp-krakow',
      description: 'Zestaw dedykowanych półek do kabiny Scania P-Series dla JRG nr 5 w Krakowie.',
      content: 'Wykonaliśmy komplet półek górnych i bocznych z oświetleniem LED.',
      thumbnail: '',
      images: JSON.stringify([]),
      vehicleBrand: 'Scania',
      vehicleModel: 'P280',
      year: '2024',
      featured: true,
      published: true,
      categoryId: categories['polki-do-kabin']?.id,
      authorId: admin.id,
    },
    {
      title: 'Zabudowa Toyota Hilux dla GOPR',
      slug: 'toyota-hilux-gopr',
      description: 'Hardtop i wyposażenie dodatkowe Toyota Hilux dla Grupy Beskidzkiej GOPR.',
      content: 'Zabudowa obejmowała hardtop z dostępem bocznym, platformę dachową i wyciągarkę.',
      thumbnail: '',
      images: JSON.stringify([]),
      vehicleBrand: 'Toyota',
      vehicleModel: 'Hilux',
      year: '2023',
      featured: true,
      published: true,
      categoryId: categories['zabudowy-pickup']?.id,
      authorId: admin.id,
    },
  ]

  for (const project of projectsData) {
    if (project.categoryId) {
      await prisma.project.upsert({
        where: { slug: project.slug },
        update: project,
        create: project,
      })
    }
  }
  console.log("Created projects:", projectsData.length)

  // ========== USTAWIENIA ==========
  const settings = [
    { key: 'site_name', value: 'Steel Solution' },
    { key: 'site_description', value: 'Profesjonalne zabudowy pojazdów dla straży pożarnej' },
    { key: 'contact_email', value: 'kontakt@steelsolution.pl' },
    { key: 'contact_phone', value: '+48 690 418 119' },
    { key: 'address', value: 'Leśna 12, 64-020 Betkowo' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    })
  }
  console.log("Created settings")

  console.log("✅ Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
