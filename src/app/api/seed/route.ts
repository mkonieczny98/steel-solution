import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  try {
    // ===== ADMIN USER =====
    const adminEmail = 'admin@steelsolution.pl'
    const adminPassword = await hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: adminPassword, name: 'Admin', role: 'ADMIN' },
      create: {
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    })

    // ===== VEHICLE BRANDS =====
    const vehicleBrandsData = [
      { name: 'MAN', slug: 'man', country: 'Niemcy', logo: '', published: true },
      { name: 'Scania', slug: 'scania', country: 'Szwecja', logo: '', published: true },
      { name: 'Volvo', slug: 'volvo', country: 'Szwecja', logo: '', published: true },
      { name: 'Mercedes', slug: 'mercedes', country: 'Niemcy', logo: '', published: true },
      { name: 'Renault', slug: 'renault', country: 'Francja', logo: '', published: true },
      { name: 'Iveco', slug: 'iveco', country: 'Włochy', logo: '', published: true },
      { name: 'DAF', slug: 'daf', country: 'Holandia', logo: '', published: true },
      { name: 'Toyota Hilux', slug: 'toyota-hilux', country: 'Japonia', logo: '', published: true },
      { name: 'Ford Ranger', slug: 'ford-ranger', country: 'USA', logo: '', published: true },
      { name: 'Nissan Navara', slug: 'nissan-navara', country: 'Japonia', logo: '', published: true },
      { name: 'Mitsubishi L200', slug: 'mitsubishi-l200', country: 'Japonia', logo: '', published: true },
      { name: 'Volkswagen Amarok', slug: 'volkswagen-amarok', country: 'Niemcy', logo: '', published: true },
      { name: 'Isuzu D-Max', slug: 'isuzu-dmax', country: 'Japonia', logo: '', published: true },
      { name: 'SsangYong Musso', slug: 'ssangyong-musso', country: 'Korea', logo: '', published: true },
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

    // ===== CATEGORIES =====
    const categoriesData = [
      // ...tu wklej całą tablicę categoriesData z seed.ts (z vehicleSlugs)...
      { name: 'Zabudowy wozów strażackich', slug: 'wozy-strazackie', icon: 'Truck', color: '#dc2626', description: 'Kompletne zabudowy wozów strażackich. Skrytki, półki wysuwane, systemy mocowań i oświetlenie.', longDescription: 'Realizujemy kompleksowe zabudowy wozów strażackich od projektu po montaż. Specjalizujemy się w pojazdach dla PSP i OSP - gaśniczych, ratowniczo-gaśniczych i specjalnych.', contentDescription: 'Zabudowy wozów strażackich to nasza główna specjalizacja. Wykonujemy skrytki aluminiowe z półkami wysuwnymi, systemy mocowań sprzętu zgodne z CNBOP, instalacje elektryczne i oświetlenie LED. Każdy projekt jest indywidualny - dostosowujemy rozwiązania do potrzeb jednostki i wymogów przetargowych. Współpracujemy z głównymi producentami podwozi i nadwozi strażackich.', features: JSON.stringify(['Skrytki aluminiowe anodowane','Półki wysuwne pod sprzęt ratowniczy','Systemy mocowań zgodne z DIN EN 1846','Oświetlenie LED robocze i sceniczne','Instalacje elektryczne 12V/24V']), benefits: JSON.stringify(['Kompleksowa realizacja od projektu po montaż','Certyfikaty CNBOP-PIB','Gwarancja 36 miesięcy','Wsparcie w przetargach publicznych']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium 3-5mm anodowane' },{ label: 'Certyfikaty', value: 'CNBOP-PIB, KDR' },{ label: 'Realizacja', value: '4-12 tygodni' },{ label: 'Gwarancja', value: '36 miesięcy' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Zabudowy wozów strażackich | PSP i OSP', metaDescription: 'Kompleksowe zabudowy wozów strażackich z certyfikatami CNBOP.', sortOrder: 0, published: true, vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'renault', 'iveco', 'daf'] },
      { name: 'Półki do kabin', slug: 'polki-do-kabin', icon: 'LayoutGrid', color: '#3b82f6', description: 'Dedykowane półki górne, boczne i pod siedzenia. Idealne dopasowanie do każdej marki pojazdu.', longDescription: 'Półki projektowane indywidualnie dla każdego modelu kabiny. Wykonane z aluminium lub stali, malowane proszkowo w kolorze wnętrza. Montaż bez wiercenia.', contentDescription: 'Nasze półki to bestseller wśród jednostek ratowniczych. Precyzyjnie dopasowane do każdej generacji kabin MAN, Scania, Volvo, Mercedes, DAF, Renault i Iveco. Wykonane z aluminium 2mm lub stali nierdzewnej, malowane proszkowo w dowolnym kolorze RAL. Montaż bezinwazyjny - nie naruszamy struktury kabiny. Obciążenie do 30 kg.', features: JSON.stringify(['Półki górne na całą szerokość kabiny','Półki boczne z przegródkami','Półki pod siedzenia pasażera','Organizery na latarki i rękawice','Opcjonalne oświetlenie LED']), benefits: JSON.stringify(['Idealne dopasowanie do modelu kabiny','Montaż bez wiercenia','Szybki dostęp do sprzętu','Malowanie w kolorze wnętrza']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium 2mm / Stal nierdzewna' },{ label: 'Wykończenie', value: 'Malowanie proszkowe RAL' },{ label: 'Obciążenie', value: 'Do 30 kg' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Półki do kabin | MAN, Scania, Volvo, Mercedes', metaDescription: 'Dedykowane półki do kabin pojazdów ciężarowych.', sortOrder: 1, published: true, vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'renault', 'iveco', 'daf'] },
      // ...pozostałe kategorie z vehicleSlugs...
      { name: 'Podesty i stopnie', slug: 'podesty-i-stopnie', icon: 'Footprints', color: '#22c55e', description: 'Aluminiowe podesty robocze i stopnie wejściowe. Bezpieczna praca na wysokości.', longDescription: 'Podesty i stopnie ze stopu aluminium 6061-T6. Antypoślizgowa powierzchnia, obciążenie do 300 kg. Zgodność z normami BHP.', contentDescription: 'Bezpieczeństwo pracy przy pojazdach to priorytet. Nasze podesty robocze i stopnie wejściowe są wykonane z aluminium lotniczego 6061-T6 spawanego metodą TIG. Powierzchnia antypoślizgowa z blachy ryflowanej zapewnia pewne oparcie w każdych warunkach. Obciążenie do 300 kg, pełna zgodność z przepisami BHP.', features: JSON.stringify(['Podesty robocze składane i stałe','Stopnie wejściowe antypoślizgowe','Drabinki boczne i tylne','Platformy na dach']), benefits: JSON.stringify(['Bezpieczeństwo pracy na wysokości','Lekka konstrukcja aluminiowa','Antypoślizgowa powierzchnia','Zgodność z BHP']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium 6061-T6' },{ label: 'Obciążenie', value: 'Do 300 kg' },{ label: 'Spawanie', value: 'TIG certyfikowane' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Podesty i stopnie aluminiowe', metaDescription: 'Podesty robocze i stopnie wejściowe dla pojazdów.', sortOrder: 2, published: true, vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco', 'daf'] },
      // ...pozostałe kategorie analogicznie...
      { name: 'Boksy na narzędzia', slug: 'boksy-na-narzedzia', icon: 'Box', color: '#f97316', description: 'Aluminiowe boksy narzędziowe pod zabudowę i na skrzynię. Organizacja sprzętu ratowniczego.', longDescription: 'Boksy aluminiowe do montażu na ramie pojazdu lub w skrzyni pickupa. Systemy szuflad, półki i organizery na narzędzia ratownicze.', contentDescription: 'Boksy narzędziowe to podstawa organizacji sprzętu w pojazdach ratunkowych. Oferujemy boksy podskrzyniowe montowane na ramie, boksy do skrzyni pickupów oraz kompleksowe systemy szuflad. Wszystko z aluminium anodowanego, z zamkami na klucz lub klamkami obrotowymi. Możliwość wykonania w dowolnym wymiarze.', features: JSON.stringify(['Boksy podskrzyniowe na ramę','Boksy do skrzyni pickupa','Systemy szuflad wysuwanych','Organizery na drobny sprzęt']), benefits: JSON.stringify(['Profesjonalna organizacja sprzętu','Zamykane na klucz','Dowolne wymiary na zamówienie','Odporne na warunki atmosferyczne']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium 2-3mm anodowane' },{ label: 'Zamki', value: 'Cylindryczne lub klamki obrotowe' },{ label: 'Uszczelnienie', value: 'Guma EPDM' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Boksy narzędziowe aluminiowe', metaDescription: 'Aluminiowe boksy na narzędzia do pojazdów.', sortOrder: 3, published: true, vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'nissan-navara', 'mitsubishi-l200', 'volkswagen-amarok', 'isuzu-dmax'] },
      // ...i kolejne kategorie z seed.ts...
      { name: 'Mocowania sprzętu', slug: 'mocowania-sprzetu', icon: 'Shield', color: '#8b5cf6', description: 'Systemy mocowań na gaśnice, sprzęt hydrauliczny i ratowniczy. Zgodność z CNBOP.', longDescription: 'Certyfikowane mocowania na sprzęt ratowniczy - gaśnice, narzędzia hydrauliczne, nosze i deski ortopedyczne. Zgodne z normami CNBOP i DIN.', contentDescription: 'Bezpieczne mocowanie sprzętu to kluczowy element każdego pojazdu ratowniczego. Nasze uchwyty są certyfikowane zgodnie z wymogami CNBOP i normą DIN EN 1846. Oferujemy mocowania na gaśnice wszystkich typów, narzędzia hydrauliczne Holmatro, Lukas i Weber, nosze i deski ortopedyczne oraz drobny sprzęt ratowniczy.', features: JSON.stringify(['Mocowania na gaśnice 2-12 kg','Uchwyty na sprzęt hydrauliczny','Mocowania noszy i desek','Systemy na drobny sprzęt']), benefits: JSON.stringify(['Certyfikacja CNBOP','Zgodność z DIN EN 1846','Szybkie zwalnianie sprzętu','Pewne mocowanie podczas jazdy']), specifications: JSON.stringify([{ label: 'Certyfikaty', value: 'CNBOP-PIB, DIN EN 1846' },{ label: 'Materiał', value: 'Stal ocynkowana / Aluminium' },{ label: 'Obciążenie', value: 'Zależne od typu' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Mocowania sprzętu ratowniczego | CNBOP', metaDescription: 'Certyfikowane mocowania na sprzęt ratowniczy.', sortOrder: 4, published: true, vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco'] },
      // ...i kolejne kategorie analogicznie...
      { name: 'Zabudowy pickupów', slug: 'zabudowy-pickup', icon: 'Truck', color: '#eab308', description: 'Hardtopy, canopy i zabudowy serwisowe do pickupów. Hilux, Ranger, Navara, L200 i inne.', longDescription: 'Kompletne zabudowy skrzyni ładunkowej pickupów - hardtopy aluminiowe i kompozytowe, zabudowy serwisowe z boksami, platformy dachowe.', contentDescription: 'Pickupy są coraz częściej wykorzystywane przez służby ratunkowe. Oferujemy hardtopy zachowujące linię nadwozia, zabudowy serwisowe typu service body z profesjonalną organizacją przestrzeni oraz platformy dachowe pod sprzęt. Wszystkie produkty są projektowane tak, by nie ograniczać możliwości terenowych pojazdu.', features: JSON.stringify(['Hardtopy aluminiowe i kompozytowe','Zabudowy serwisowe z boksami','Platformy dachowe','Rolety aluminiowe']), benefits: JSON.stringify(['Zachowanie możliwości terenowych','Ochrona sprzętu przed warunkami','Profesjonalna organizacja przestrzeni','Dopasowanie do linii nadwozia']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium / Kompozyt' },{ label: 'Zamknięcie', value: 'Centralne lub na klucz' },{ label: 'Okna', value: 'Opcjonalne, otwierane' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Zabudowy pickupów | Hardtopy', metaDescription: 'Hardtopy i zabudowy do pickupów.', sortOrder: 5, published: true, vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'nissan-navara', 'mitsubishi-l200', 'volkswagen-amarok', 'isuzu-dmax', 'ssangyong-musso'] },
      // ...i kolejne kategorie...
      { name: 'Skrzynie dachowe', slug: 'skrzynie-dachowe', icon: 'Package', color: '#06b6d4', description: 'Aluminiowe skrzynie i boksy dachowe. Dodatkowa przestrzeń na sprzęt lekki.', longDescription: 'Skrzynie dachowe wykonane z aluminium anodowanego. Montaż na relingach lub belkach poprzecznych. Idealne na sprzęt lekki i rzadziej używany.', contentDescription: 'Skrzynie dachowe pozwalają wykorzystać przestrzeń na dachu pojazdu. Wykonujemy je z aluminium anodowanego o grubości 2mm, z uszczelnieniem EPDM zapewniającym wodoszczelność. Montaż na fabrycznych relingach lub dedykowanych belkach poprzecznych. Zamknięcie na klucz, opcjonalne siłowniki wspomagające otwieranie.', features: JSON.stringify(['Skrzynie różnych rozmiarów','Montaż na relingach lub belkach','Uszczelnienie wodoszczelne','Zamknięcie na klucz']), benefits: JSON.stringify(['Dodatkowa przestrzeń ładunkowa','Wodoszczelna konstrukcja','Łatwy dostęp do zawartości','Nie ogranicza widoczności']), specifications: JSON.stringify([{ label: 'Materiał', value: 'Aluminium 2mm anodowane' },{ label: 'Uszczelnienie', value: 'EPDM wodoszczelne' },{ label: 'Obciążenie', value: 'Zależne od relingów' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Skrzynie dachowe aluminiowe', metaDescription: 'Aluminiowe skrzynie i boksy dachowe.', sortOrder: 6, published: true, vehicleSlugs: ['toyota-hilux', 'ford-ranger', 'mitsubishi-l200', 'volkswagen-amarok'] },
      // ...i kolejne kategorie...
      { name: 'Oświetlenie LED', slug: 'oswietlenie-led', icon: 'Lightbulb', color: '#f59e0b', description: 'Lampy robocze LED, listwy sceniczne i oświetlenie skrytek. Wysoka jasność, niskie zużycie.', longDescription: 'Profesjonalne oświetlenie LED do pojazdów ratunkowych - lampy robocze, listwy sceniczne, oświetlenie skrytek i przestrzeni ładunkowej.', contentDescription: 'Dobre oświetlenie to podstawa bezpiecznej pracy podczas nocnych akcji. Oferujemy lampy robocze LED o jasności do 15000 lumenów, listwy sceniczne do oświetlenia terenu wokół pojazdu oraz oświetlenie skrytek z automatycznym włączaniem. Wszystkie produkty w klasie szczelności IP67 lub wyższej.', features: JSON.stringify(['Lampy robocze LED','Listwy sceniczne','Oświetlenie skrytek','Lampy ostrzegawcze']), benefits: JSON.stringify(['Wysoka jasność do 15000 lm','Niskie zużycie energii','Klasa szczelności IP67+','Długa żywotność LED']), specifications: JSON.stringify([{ label: 'Technologia', value: 'LED CREE / OSRAM' },{ label: 'Jasność', value: 'Do 15000 lumenów' },{ label: 'Szczelność', value: 'IP67 - IP69K' },{ label: 'Gwarancja', value: '24 miesiące' }]), heroImage: '', gallery: JSON.stringify([]), metaTitle: 'Oświetlenie LED do pojazdów', metaDescription: 'Profesjonalne oświetlenie LED dla służb ratunkowych.', sortOrder: 7, published: true, vehicleSlugs: ['man', 'scania', 'volvo', 'mercedes', 'iveco', 'toyota-hilux', 'ford-ranger'] },
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

    // ===== RELACJE CATEGORY <-> VEHICLE BRAND =====
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

    // ===== PROJEKTY =====
    const projectsData = [
      { title: 'MAN TGM 18.290 dla OSP Wieliczka', slug: 'man-tgm-osp-wieliczka', description: 'Kompleksowa zabudowa średniego wozu ratowniczo-gaśniczego na podwoziu MAN TGM.', content: 'Realizacja obejmowała kompletne wyposażenie kabiny załogi i przedziału sprzętowego.', thumbnail: '', images: JSON.stringify([]), vehicleBrand: 'MAN', vehicleModel: 'TGM 18.290', year: '2024', featured: true, published: true, categoryId: categories['wozy-strazackie']?.id, authorId: admin.id },
      { title: 'Półki do Scania P280 PSP Kraków', slug: 'polki-scania-psp-krakow', description: 'Zestaw dedykowanych półek do kabiny Scania P-Series dla JRG nr 5 w Krakowie.', content: 'Wykonaliśmy komplet półek górnych i bocznych z oświetleniem LED.', thumbnail: '', images: JSON.stringify([]), vehicleBrand: 'Scania', vehicleModel: 'P280', year: '2024', featured: true, published: true, categoryId: categories['polki-do-kabin']?.id, authorId: admin.id },
      { title: 'Zabudowa Toyota Hilux dla GOPR', slug: 'toyota-hilux-gopr', description: 'Hardtop i wyposażenie dodatkowe Toyota Hilux dla Grupy Beskidzkiej GOPR.', content: 'Zabudowa obejmowała hardtop z dostępem bocznym, platformę dachową i wyciągarkę.', thumbnail: '', images: JSON.stringify([]), vehicleBrand: 'Toyota', vehicleModel: 'Hilux', year: '2023', featured: true, published: true, categoryId: categories['zabudowy-pickup']?.id, authorId: admin.id },
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

    // ===== USTAWIENIA =====
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

    return NextResponse.json({ success: true, message: 'Seed completed!' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  } finally {
    await prisma.$disconnect()
  }
}
