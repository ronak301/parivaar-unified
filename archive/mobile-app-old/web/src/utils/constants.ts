export type KeyValuePair = {
  id: string;
  label: string;
};

export const Gender = [
  {
    id: "Male",
    label: "Male",
  },
  {
    id: "Female",
    label: "Female",
  },
];

export const communityFamilyMembersShowType = {};

export const BusinessTypes = [
  {
    id: "HomeMaker",
    label: "Home Maker (गृहस्वामिनी)",
  },
  {
    id: "SelfEmployed",
    label: "Self Employed",
  },
  {
    id: "Automobile",
    label: "Automobile",
  },
  {
    id: "Advertising",
    label: "Advertising",
  },
  {
    id: "Agriculture",
    label: "Agriculture",
  },
  {
    id: "ClothMerchant",
    label: "Cloth Merchant",
  },
  {
    id: "ConstructionMaterials",
    label: "Construction Materials",
  },
  {
    id: "EducationInstitutions",
    label: "Education Institutions",
  },
  {
    id: "Electricals",
    label: "Electricals",
  },
  {
    id: "HomeAppliances",
    label: "Electronics, Home Appliances",
  },
  {
    id: "Computers",
    label: "Computers",
  },
  {
    id: "FinancialAdvisor",
    label: "Financial Advisor",
  },
  {
    id: "GeneralStore",
    label: "General Store",
  },
  {
    id: "Glass",
    label: "Glass and Hardware",
  },
  {
    id: "HomeDecor",
    label: "House Decor and Furnishing",
  },
  {
    id: "Hospitals",
    label: "Hospitals & Pharmacy",
  },
  {
    id: "Hotels&Restaurants",
    label: "Hotels and Restaurants",
  },
  {
    id: "IronSteel",
    label: "Iron and Steel Traders",
  },
  {
    id: "Jwellery",
    label: "Jewellery",
  },
  {
    id: "Manufacturing",
    label: "Manufacturing Industries",
  },
  {
    id: "Laminates",
    label: "Ply & laminates",
  },
  {
    id: "Marble",
    label: "Marble & Granite",
  },
  {
    id: "Professionals",
    label: "Professionals",
    subTypes: [
      {
        id: "Engineer",
        label: "Engineer",
      },
      {
        id: "CA",
        label: "CA",
      },
      {
        id: "Doctor",
        label: "Doctor",
      },
      {
        id: "Architect",
        label: "Architect",
      },
      {
        id: "MBA",
        label: "MBA",
      },
    ],
  },
  {
    id: "RealEstate",
    label: "Real Estate and Construction (Property Dealer)",
  },
  {
    id: "Service",
    label: "Service",
  },
  {
    id: "Staionary",
    label: "Stationary and Gift Items, Printing",
  },
  {
    id: "Machinaries",
    label: "Tools & Machineries",
  },
  {
    id: "TourTravels",
    label: "Tour and Travels",
  },
  {
    id: "WeddingEventManagement",
    label: "Wedding Event Management",
  },
  {
    id: "Beautician",
    label: "Beautician",
  },
  {
    id: "Hardware",
    label: "Hardware",
  },
  {
    id: "Paints",
    label: "Paints",
  },
  {
    id: "Footwear",
    label: "Shoes & Footwear",
  },
  {
    id: "Transport",
    label: "Transport, Packers & Movers",
  },
  {
    id: "Utensils",
    label: "Utensils Metal Merchant",
  },
  {
    id: "Turf",
    label: "Sports Turf",
  },
  {
    id: "Sports",
    label: "Sports",
  },
  {
    id: "Others",
    label: "Others",
  },
];

export const CommunityTypes = [
  {
    id: "Jain",
    label: "Jain",
    subTypes: [
      {
        id: "Terapanth",
        label: "Terapanth",
      },
      {
        id: "All",
        label: "All",
      },
    ],
  },
  {
    id: "All",
    label: "All",
  },
];

export const CommunityStatus = [
  {
    id: "Pending",
    label: "Pending",
  },
  {
    id: "Active",
    label: "Active",
  },
];

export const Cities = [
  {
    id: "Udaipur",
    label: "Udaipur",
  },
];

export const State = [
  {
    id: "Rajasthan",
    label: "Rajasthan",
  },
];

export const FamilyMemberRelationshipTypes = [
  {
    id: "Father",
    label: "Father",
    reverse: {
      id: "Son",
      label: "Son",
    },
  },
  {
    id: "Mother",
    label: "Mother",
    reverse: {
      id: "Son",
      label: "Son",
    },
  },
  {
    id: "Husband",
    label: "Husband",
    reverse: {
      id: "Wife",
      label: "Wife",
    },
  },
  {
    id: "Wife",
    label: "Wife",
    reverse: {
      id: "Husband",
      label: "Husband",
    },
  },
  {
    id: "Son",
    label: "Son",
    reverse: {
      id: "Parent",
      label: "Parent",
    },
  },
  {
    id: "Daughter",
    label: "Daughter",
    reverse: {
      id: "Parent",
      label: "Parent",
    },
  },
  {
    id: "Sister",
    label: "Sister",
    reverse: {
      id: "Brother",
      label: "Brother",
    },
  },
  {
    id: "Brother",
    label: "Brother",
    reverse: {
      id: "Brother",
      label: "Brother",
    },
  },
];

export const BloodGroups = [
  {
    id: "A_POSITIVE",
    label: "A+",
  },
  {
    id: "A_NEGETIVE",
    label: "A-",
  },
  {
    id: "B_POSITIVE",
    label: "B+",
  },
  {
    id: "B_NEGETIVE",
    label: "B-",
  },
  {
    id: "O_POSITIVE",
    label: "O+",
  },
  {
    id: "O_NEGETIVE",
    label: "O-",
  },
  {
    id: "AB_POSITIVE",
    label: "AB+",
  },
  {
    id: "AB_NEGETIVE",
    label: "AB-",
  },
];

export const Localities = [
  {
    id: "oldcity",
    label: "Old City",
  },
  {
    id: "Sarvrituvillas",
    label: "Sarvritu Villas ",
  },
  {
    id: "Gariyawas",
    label: "Gariyawas",
  },
  {
    id: "HiranMagrisector11",
    label: "Hiran magri Sector 11",
  },
  {
    id: "HiranMagrisector13",
    label: "Hiran magri Sector 13",
  },
  {
    id: "HiranMagrisector14",
    label: "Hiran magri Sector 14",
  },
  {
    id: "Durganursery",
    label: "Durga Nursery",
  },
  {
    id: "Subhashnagar",
    label: "Subhash Nagar",
  },
  {
    id: "HiranMagrisector3",
    label: "Hiran magri Sector 3",
  },
  {
    id: "HiranMagrisector4",
    label: "Hiran magri Sector 4",
  },
  {
    id: "HiranMagrisector5",
    label: "Hiran magri Sector 5",
  },
  {
    id: "HiranMagrisector6789",
    label: "Hiran magri Sector 6,7,8,9",
  },
  {
    id: "Bhupalpura",
    label: "Bhupalpura",
  },
  {
    id: "Newbhupalpura",
    label: "New Bhupalpura",
  },
  {
    id: "Ashoknagar",
    label: "Ashok Nagar",
  },
  {
    id: "Anandnagar",
    label: "Anand Nagar",
  },
  {
    id: "Keshavnagar",
    label: "Keshav Nagar",
  },
  {
    id: "Kalkamataroad",
    label: "Kalka Mata Road",
  },
  {
    id: "Bohraganeshmarg",
    label: "Bohra Ganesh Marg",
  },
  {
    id: "sunderwas",
    label: "Sunderwas",
  },
  {
    id: "Madhuban",
    label: "Madhuban",
  },
  {
    id: "Panchwati",
    label: "Panchwati",
  },
  {
    id: "Pologround",
    label: "Polo Ground",
  },
  {
    id: "Ahinsapuri",
    label: "Ahinsapuri",
  },
  {
    id: "Adinathnagar",
    label: "Adinath Nagar",
  },
  {
    id: "Panchratnacomplex",
    label: "Panchratna Complex",
  },
  {
    id: "NavratnaComplex",
    label: "Navratna Complex",
  },
  {
    id: "Bedlaroad",
    label: "Bedlaroad",
  },
  {
    id: "Bedla",
    label: "Bedla",
  },
  {
    id: "Samtanagar",
    label: "Samta Nagar",
  },
  {
    id: "Bhuvana",
    label: "Bhuvana",
  },
  {
    id: "Ambamata",
    label: "Ambamata",
  },
  {
    id: "Shobhagpura",
    label: "Shobhagpura",
  },
  {
    id: "Benadebathedahouse",
    label: "Baneda Bathera House",
  },
  {
    id: "Pula",
    label: "Pula",
  },
  {
    id: "Others",
    label: "Others",
  },
];
