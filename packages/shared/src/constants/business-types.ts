export interface BusinessTypeOption {
  id: string;
  label: string;
  subTypes?: { id: string; label: string }[];
}

export const BusinessTypes: BusinessTypeOption[] = [
  { id: 'HomeMaker', label: 'Home Maker' },
  { id: 'SelfEmployed', label: 'Self Employed' },
  { id: 'Automobile', label: 'Automobile' },
  { id: 'Advertising', label: 'Advertising' },
  { id: 'Agriculture', label: 'Agriculture' },
  { id: 'ClothMerchant', label: 'Cloth Merchant' },
  { id: 'ConstructionMaterials', label: 'Construction Materials' },
  { id: 'EducationInstitutions', label: 'Education Institutions' },
  { id: 'Electricals', label: 'Electricals' },
  { id: 'HomeAppliances', label: 'Electronics, Home Appliances' },
  { id: 'Computers', label: 'Computers' },
  { id: 'FinancialAdvisor', label: 'Financial Advisor' },
  { id: 'GeneralStore', label: 'General Store' },
  { id: 'Glass', label: 'Glass and Hardware' },
  { id: 'HomeDecor', label: 'House Decor and Furnishing' },
  { id: 'Hospitals', label: 'Hospitals & Pharmacy' },
  { id: 'Hotels&Restaurants', label: 'Hotels and Restaurants' },
  { id: 'IronSteel', label: 'Iron and Steel Traders' },
  { id: 'Jwellery', label: 'Jewellery' },
  { id: 'Manufacturing', label: 'Manufacturing Industries' },
  { id: 'Laminates', label: 'Ply & Laminates' },
  { id: 'Marble', label: 'Marble & Granite' },
  {
    id: 'Professionals',
    label: 'Professionals',
    subTypes: [
      { id: 'Engineer', label: 'Engineer' },
      { id: 'CA', label: 'CA' },
      { id: 'Doctor', label: 'Doctor' },
      { id: 'Architect', label: 'Architect' },
      { id: 'MBA', label: 'MBA' },
    ],
  },
  { id: 'RealEstate', label: 'Real Estate and Construction' },
  { id: 'Service', label: 'Service' },
  { id: 'Stationary', label: 'Stationary and Gift Items, Printing' },
  { id: 'Machineries', label: 'Tools & Machineries' },
  { id: 'TourTravels', label: 'Tour and Travels' },
  { id: 'WeddingEventManagement', label: 'Wedding Event Management' },
  { id: 'Beautician', label: 'Beautician' },
  { id: 'Hardware', label: 'Hardware' },
  { id: 'Paints', label: 'Paints' },
  { id: 'Footwear', label: 'Shoes & Footwear' },
  { id: 'Transport', label: 'Transport, Packers & Movers' },
  { id: 'Utensils', label: 'Utensils Metal Merchant' },
  { id: 'Turf', label: 'Sports Turf' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Others', label: 'Others' },
];

export const BusinessTypeIds = BusinessTypes.map((bt) => bt.id);

export const ExcludeBusinessTypes = [
  'HomeMaker',
  'NA',
  'Retired',
  '-',
  '--',
  'None',
  'N/A',
];
