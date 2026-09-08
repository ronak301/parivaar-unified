import {
  Car,
  Megaphone,
  Wheat,
  Shirt,
  HardHat,
  GraduationCap,
  Zap,
  Laptop,
  Landmark,
  Store,
  Sofa,
  Stethoscope,
  UtensilsCrossed,
  Gem,
  Factory,
  Layers,
  Briefcase,
  Building2,
  Wrench,
  Plane,
  PartyPopper,
  Scissors,
  Paintbrush,
  Footprints,
  Truck,
  Trophy,
  MoreHorizontal,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { tone, toneFor } from './theme';

interface CategoryStyle {
  icon: LucideIcon;
  /** CSS colour value (a `var(--m-tone-*)` reference) — safe for inline styles. */
  color: string;
  bg: string;
}

const DEFAULT_TONE = tone('indigo');
const DEFAULT_STYLE: CategoryStyle = { icon: Briefcase, color: DEFAULT_TONE.fg, bg: DEFAULT_TONE.bg };

const ICONS: Record<string, LucideIcon> = {
  Automobile: Car,
  Advertising: Megaphone,
  Agriculture: Wheat,
  ClothMerchant: Shirt,
  ConstructionMaterials: HardHat,
  EducationInstitutions: GraduationCap,
  Electricals: Zap,
  HomeAppliances: Zap,
  Computers: Laptop,
  FinancialAdvisor: Landmark,
  GeneralStore: Store,
  Glass: HardHat,
  HomeDecor: Sofa,
  Hospitals: Stethoscope,
  'Hotels&Restaurants': UtensilsCrossed,
  IronSteel: Factory,
  Jwellery: Gem,
  Manufacturing: Factory,
  Laminates: Layers,
  Marble: Layers,
  Doctor: Stethoscope,
  Engineer: HardHat,
  CA: Landmark,
  Architect: Building2,
  Lawyer: Scale,
  MBA: GraduationCap,
  Professionals: Briefcase,
  RealEstate: Building2,
  Service: Wrench,
  Stationary: Briefcase,
  Machineries: Wrench,
  TourTravels: Plane,
  WeddingEventManagement: PartyPopper,
  Beautician: Scissors,
  Hardware: Wrench,
  Paints: Paintbrush,
  Footwear: Footprints,
  Transport: Truck,
  Utensils: UtensilsCrossed,
  Turf: Trophy,
  Sports: Trophy,
  Others: MoreHorizontal,
};

export function getBusinessCategoryStyle(categoryId?: string): CategoryStyle {
  if (!categoryId) return DEFAULT_STYLE;
  const icon = ICONS[categoryId] ?? DEFAULT_STYLE.icon;
  const { fg, bg } = toneFor(categoryId);
  return { icon, color: fg, bg };
}
