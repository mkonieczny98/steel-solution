// Zdjęcia poglądowe z Unsplash (licencja Unsplash – darmowe użycie komercyjne).
// Podmień je na zdjęcia własnych realizacji w panelu admina, gdy będą gotowe.
const BASE = 'https://images.unsplash.com/photo-'

export const unsplash = (id: string) => `${BASE}${id}?auto=format&fit=crop&q=80`

export const isUnsplash = (src: string) => src.startsWith('https://images.unsplash.com/')

// Dokleja szerokość do adresu Unsplash – do miejsc, które nie korzystają z next/image (OG, JSON-LD).
export const sized = (src: string, width: number) =>
  isUnsplash(src) ? `${src}&w=${width}` : src.startsWith('/uploads/') ? `/api/media/${encodeURIComponent(src.slice('/uploads/'.length))}?w=${[320, 640, 960, 1280, 1920, 2400].find(size => size >= width) || 2400}` : src

export const IMAGES = {
  heroTruck: unsplash('1636184671123-bfb315fb8cf3'),
  fireTruckForest: unsplash('1555969377-79e2db8d1722'),
  fireTruckGarage: unsplash('1642541400994-5bf3c9c0a8d9'),
  ladderBuilding: unsplash('1640950834575-4ca254fb575c'),
  ladderTruck: unsplash('1622783089891-ddf18baab338'),
  fireTruckSide: unsplash('1552244935-439697eea0bd'),
  fireTruckRed: unsplash('1622546457267-4c94cf343cb5'),
  fireTruckNight: unsplash('1610586618549-a05378824c91'),
  hoseCompartment: unsplash('1756112277157-77aa2f0376f9'),
  firefighterStation: unsplash('1656512934324-b8a30832f4f8'),
  firefighterGear: unsplash('1705503831905-02aa99bfcd50'),
  weldingSparks: unsplash('1714504904786-b6732390b206'),
  weldingHand: unsplash('1563229708-55d0a600b01d'),
  grinding: unsplash('1598302936625-6075fbd98dd7'),
  welding: unsplash('1455165814004-1126a7199f9b'),
  measuring: unsplash('1564182842834-681b7be6de4b'),
  laserCutter: unsplash('1764114235896-034c8772de01'),
  metalCutting: unsplash('1735494033576-9c882e80504c'),
  hiluxWhite: unsplash('1759213281196-6c5e463b3021'),
  hiluxBlack: unsplash('1758393605683-e28bb39d8917'),
  hiluxSilver: unsplash('1631377875413-b1e3e660bfa2'),
  pickupForest: unsplash('1641431616381-3f0613d82ca7'),
  toolWall: unsplash('1671040690726-b78261eff126'),
  toolBox: unsplash('1637640125496-31852f042a60'),
  toolRack: unsplash('1426927308491-6380b6a9936f'),
}

// Zdjęcie zastępcze, gdy w bazie nie ma zdjęcia
export function fallbackImage(kind: 'truck' | 'pickup' | 'product' = 'truck') {
  if (kind === 'pickup') return IMAGES.hiluxWhite
  if (kind === 'product') return IMAGES.weldingSparks
  return IMAGES.fireTruckForest
}
