export interface InfosSociete {
  nom: string;
  activite: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
  site: string;
  numero_devis: string;
  date: string;
  forme_juridique: string;
  capital: string;
  siret: string;
  rcs: string;
  code_ape: string;
  tva_intracom: string;
  info_bancaire: string;
  rib: string;
  logo?: string;
}

export interface InfosClient {
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  description_projet: string;
}

export interface Produit {
  id: string;
  quantite: number;
  designation: string;
  prix_unitaire: number;
  total_ht: number;
}

export interface Conditions {
  validite: string;
  reglement: string;
  tva_taux: number;
}

export interface PaginationSettings {
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface DevisData {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  isArchived: boolean;
  infos_societe: InfosSociete;
  infos_client: InfosClient;
  produits: Produit[];
  conditions: Conditions;
  isAutoEntrepreneur?: boolean;
  paginationSettings?: PaginationSettings;
}
