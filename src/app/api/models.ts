export type DocumentTypeEnum = 'DNI' | 'NIE' | 'Passport';

export type ApplicationStatusEnum = 'interested' | 'saved' | 'applied' | 'approved' | 'rejected' | 'expired';

export type GrantScopeEnum = 'National' | 'Regional' | 'Local';

export type LargeFamilyCategoryEnum = 'General' | 'Especial';

export type HousemateRelationEnum = 'Parent' | 'Child' | 'Sibling' | 'Partner' | 'Grandparent' | 'Other';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;

  // The following fields were in the original User interface from AuthService
  // and are kept here to prevent breaking the frontend components abruptly.
  // Ideally, they should be mapped properly or components updated to use the Profile interface.
  first_name?: string;
  surname?: string;
  second_surname?: string;
  name?: string;
}

export interface Profile {
  user_id: number;
  first_name: string;
  surname_1: string;
  surname_2?: string | null;
  birth_date: string;
  document_type: DocumentTypeEnum;
  document_number: string;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  province?: string | null;
  autonomous_community?: string | null;
  is_gender_violence_victim: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocioEconomicData {
  user_id: number;
  education_level?: string | null;
  employment_status?: string | null;
  gross_annual_income: number;
  is_large_family: boolean;
  large_family_category?: LargeFamilyCategoryEnum | null;
  has_disability: boolean;
  disability_percentage: number;
  dependency_grade: number;
  is_single_parent: boolean;
  exclusion_risk: boolean;
  number_of_children: number;
  created_at: string;
  updated_at: string;
}

export interface Housemate {
  id: number;
  user_id: number;
  full_name: string;
  relation: HousemateRelationEnum;
  document_number?: string | null;
  birth_date?: string | null;
  lives_with: boolean;
  is_dependent: boolean;
  income_annual: number;
  created_at: string;
  updated_at: string;
}

export interface GovernmentGrant {
  id: number;
  external_id?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  scope: GrantScopeEnum;
  region_filter?: string | null;
  min_amount?: number | null;
  max_amount?: number | null;
  opening_date?: string | null;
  closing_date?: string | null;
  eligibility_rules?: any | null;
  link_info?: string | null;
  source: string;
  search_vector?: any | null;
  created_at: string;
  updated_at: string;
}

export interface UserApplication {
  id: number;
  user_id: number;
  grant_id: number;
  status: ApplicationStatusEnum;
  amount_granted: number;
  application_ref_number?: string | null;
  notes?: string | null;
  applied_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrantMatch {
  id: number;
  user_id: number;
  grant_id: number;
  eligibility_score: number;
  is_eligible: boolean;
  reasons?: any | null;
  calculated_at: string;
}
