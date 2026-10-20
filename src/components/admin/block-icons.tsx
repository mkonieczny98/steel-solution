import {
  Car,
  Columns2,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  ListOrdered,
  Megaphone,
  Package,
  Phone,
  Quote,
  Truck,
  Type,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { BLOCKS, type BlockType } from '@/lib/blocks'

const ICONS: Record<string, LucideIcon> = {
  image: ImageIcon,
  columns: Columns2,
  grid: LayoutGrid,
  'list-ordered': ListOrdered,
  hash: Hash,
  package: Package,
  truck: Truck,
  car: Car,
  help: HelpCircle,
  type: Type,
  images: Images,
  quote: Quote,
  video: Youtube,
  phone: Phone,
  megaphone: Megaphone,
}

export function BlockIcon({ type, className }: { type: BlockType; className?: string }) {
  const Icon = ICONS[BLOCKS[type].icon] ?? LayoutGrid
  return <Icon className={className} />
}
