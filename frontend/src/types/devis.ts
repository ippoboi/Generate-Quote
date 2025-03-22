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
  pied_de_page: string;
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
  tva: number;
  prix_unitaire: number;
  total_ht: number;
}

export interface Conditions {
  validite: string;
  reglement: string;
  tva_taux: number;
}

export interface DevisData {
  infos_societe: InfosSociete;
  infos_client: InfosClient;
  produits: Produit[];
  conditions: Conditions;
  isAutoEntrepreneur?: boolean;
}
