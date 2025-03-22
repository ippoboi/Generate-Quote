"use client";

import { DevisData, Produit } from "@/types/devis";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface EditableDevisProps {
  data: DevisData;
  onUpdate: (data: DevisData) => void;
}

// Constantes pour les taux de TVA
const TVA_RATES = [
  { value: "20", label: "20% - Taux normal" },
  { value: "10", label: "10% - Taux intermédiaire" },
  { value: "5.5", label: "5.5% - Taux réduit" },
  { value: "2.1", label: "2.1% - Taux particulier" },
];

export function EditableDevis({ data, onUpdate }: EditableDevisProps) {
  const [localData, setLocalData] = useState<DevisData>(data);

  // Update localData when data prop changes (including isAutoEntrepreneur)
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Create a dependency key for product changes
  const productsDepsKey = localData.produits
    .map((p) => `${p.id}-${p.quantite}-${p.prix_unitaire}`)
    .join("|");

  // Only recalculate totals on render, don't update state in effects
  useEffect(() => {
    // Update parent with current data including calculated totals
    const produitsWithTotals = localData.produits.map((produit) => ({
      ...produit,
      total_ht: produit.quantite * produit.prix_unitaire,
    }));

    if (
      JSON.stringify(produitsWithTotals) !== JSON.stringify(localData.produits)
    ) {
      onUpdate({
        ...localData,
        produits: produitsWithTotals,
      });
    }
  }, [productsDepsKey, onUpdate, localData]);

  // Mettre à jour les champs de la société
  const updateSociete = (field: string, value: string) => {
    setLocalData({
      ...localData,
      infos_societe: {
        ...localData.infos_societe,
        [field]: value,
      },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux", {
        description: "La taille maximale est de 2MB",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Format de fichier invalide", {
        description: "Veuillez choisir une image (JPG, PNG, etc.)",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setLocalData((prev) => ({
        ...prev,
        infos_societe: {
          ...prev.infos_societe,
          logo: base64String,
        },
      }));
      toast.success("Logo téléchargé avec succès");
    };
    reader.readAsDataURL(file);
  };

  // Mettre à jour les champs du client
  const updateClient = (field: string, value: string) => {
    setLocalData({
      ...localData,
      infos_client: {
        ...localData.infos_client,
        [field]: value,
      },
    });
  };

  // Mettre à jour un produit
  const updateProduit = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedProduits = [...localData.produits];

    // Convertir en nombre si nécessaire
    const numericValue =
      field === "quantite" || field === "prix_unitaire" ? Number(value) : value;

    // Mettre à jour le champ modifié
    updatedProduits[index] = {
      ...updatedProduits[index],
      [field]: numericValue,
    };

    // Recalculer immédiatement le total_ht si la quantité ou le prix unitaire change
    if (field === "quantite" || field === "prix_unitaire") {
      const produit = updatedProduits[index];
      const quantite = field === "quantite" ? Number(value) : produit.quantite;
      const prixUnitaire =
        field === "prix_unitaire" ? Number(value) : produit.prix_unitaire;

      updatedProduits[index].total_ht = quantite * prixUnitaire;
    }

    setLocalData({
      ...localData,
      produits: updatedProduits,
    });
  };

  // Ajouter un nouveau produit
  const addProduit = () => {
    const newProduit: Produit = {
      id: Date.now().toString(),
      quantite: 0,
      designation: "",
      tva: 1,
      prix_unitaire: 0,
      total_ht: 0,
    };

    setLocalData({
      ...localData,
      produits: [...localData.produits, newProduit],
    });
  };

  // Supprimer un produit
  const removeProduit = (index: number) => {
    if (localData.produits.length <= 1) return;

    const updatedProduits = [...localData.produits];
    updatedProduits.splice(index, 1);

    setLocalData({
      ...localData,
      produits: updatedProduits,
    });
  };

  // Mettre à jour les conditions
  const updateConditions = (field: string, value: string | number) => {
    setLocalData({
      ...localData,
      conditions: {
        ...localData.conditions,
        [field]: field === "tva_taux" ? Number(value) : value,
      },
    });
  };

  // Calculer les totaux
  const totalHT = localData.produits.reduce(
    (sum, item) => sum + item.total_ht,
    0
  );
  const totalTVA = totalHT * (localData.conditions.tva_taux / 100);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* En-tête du devis */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-8">
          {/* Informations société */}
          <div className="flex flex-col">
            <div className="mb-4 relative">
              {localData.infos_societe.logo ? (
                <div className="rounded-lg overflow-hidden h-[100px] w-[100px] group">
                  <div className="relative h-full w-full">
                    <Image
                      src={localData.infos_societe.logo}
                      alt="Logo entreprise"
                      className="object-contain"
                      fill
                      sizes="150px"
                      priority
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        setLocalData({
                          ...localData,
                          infos_societe: {
                            ...localData.infos_societe,
                            logo: "",
                          },
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <Upload className="h-4 w-4" />
                    <span>Ajouter un logo</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              )}
            </div>

            <EditableField
              value={localData.infos_societe.nom}
              onChange={(value) => updateSociete("nom", value)}
              className="font-bold text-lg"
              placeholder="Nom de votre société"
            />

            <EditableField
              value={localData.infos_societe.activite}
              onChange={(value) => updateSociete("activite", value)}
              className="text-sm text-gray-500 mb-4"
              placeholder="Votre activité"
            />

            <EditableField
              value={localData.infos_societe.adresse}
              onChange={(value) => updateSociete("adresse", value)}
              className="text-sm"
              placeholder="Adresse"
            />

            <div className="flex gap-2">
              <EditableField
                value={localData.infos_societe.code_postal}
                onChange={(value) => updateSociete("code_postal", value)}
                className="text-sm w-1/3"
                placeholder="Code postal"
              />
              <EditableField
                value={localData.infos_societe.ville}
                onChange={(value) => updateSociete("ville", value)}
                className="text-sm flex-1"
                placeholder="Ville"
              />
            </div>

            <EditableField
              value={localData.infos_societe.telephone}
              onChange={(value) => updateSociete("telephone", value)}
              className="text-sm"
              placeholder="Téléphone"
            />

            <EditableField
              value={localData.infos_societe.email}
              onChange={(value) => updateSociete("email", value)}
              className="text-sm"
              placeholder="Email"
            />

            <EditableField
              value={localData.infos_societe.site}
              onChange={(value) => updateSociete("site", value)}
              className="text-sm"
              placeholder="Site web (optionnel)"
            />
          </div>

          {/* Informations devis */}
          <div className="bg-white p-4 rounded border shadow-sm flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center mb-4">DEVIS</h2>
            <div className="w-full">
              <div className="flex items-center mb-2">
                <span className="w-14 text-sm font-medium">n°:</span>
                <EditableField
                  value={localData.infos_societe.numero_devis}
                  onChange={(value) => updateSociete("numero_devis", value)}
                  className="text-sm"
                  placeholder="D00000"
                />
              </div>
              <div className="flex items-center">
                <span className="w-14 text-sm font-medium">Date:</span>
                <EditableField
                  value={localData.infos_societe.date}
                  onChange={(value) => updateSociete("date", value)}
                  className="text-sm"
                  placeholder="JJ/MM/AAAA"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corps du devis */}
      <div className="p-6">
        {/* Informations client */}
        <div className="mb-8 w-full flex flex-col items-end text-right">
          <EditableField
            value={localData.infos_client.nom}
            onChange={(value) => updateClient("nom", value)}
            className="font-bold"
            placeholder="Société et/ou Nom du client"
          />

          <EditableField
            value={localData.infos_client.adresse}
            onChange={(value) => updateClient("adresse", value)}
            placeholder="Adresse du client"
          />

          <div className="flex gap-2 w-full justify-end">
            <EditableField
              value={localData.infos_client.code_postal}
              onChange={(value) => updateClient("code_postal", value)}
              className="w-1/3"
              placeholder="Code postal"
            />
            <EditableField
              value={localData.infos_client.ville}
              onChange={(value) => updateClient("ville", value)}
              placeholder="Ville"
            />
          </div>
        </div>

        {/* Description du projet */}
        <div className="mb-6">
          <EditableField
            value={localData.infos_client.description_projet}
            onChange={(value) => updateClient("description_projet", value)}
            className="font-bold mb-4"
            placeholder="intitulé : description du projet et/ou Produits"
          />

          {/* Tableau des produits */}
          <Table className="border">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-20 text-center">Qté</TableHead>
                <TableHead className="w-[65%]">Désignation</TableHead>
                <TableHead className="w-28 text-right">Prix Unit.</TableHead>
                <TableHead className="w-28 text-right">Total HT</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localData.produits.map((produit, index) => (
                <TableRow key={produit.id} className="align-top h-20 border-b">
                  <TableCell className="text-center align-middle p-2">
                    <Input
                      type="number"
                      value={produit.quantite}
                      onChange={(e) =>
                        updateProduit(index, "quantite", e.target.value)
                      }
                      className="h-10 w-full text-center"
                      placeholder="0"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="p-2 align-middle">
                    <Textarea
                      value={produit.designation}
                      onChange={(e) =>
                        updateProduit(index, "designation", e.target.value)
                      }
                      className="min-h-10 w-full text-sm resize-none p-2"
                      placeholder="Désignation du produit ou service"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell className="text-right align-middle p-2">
                    <Input
                      type="number"
                      value={produit.prix_unitaire}
                      onChange={(e) =>
                        updateProduit(index, "prix_unitaire", e.target.value)
                      }
                      className="h-10 w-full text-right"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium align-middle p-2">
                    {(produit.quantite * produit.prix_unitaire).toFixed(2)} €
                  </TableCell>
                  <TableCell className="align-middle p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeProduit(index)}
                      disabled={localData.produits.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-10"
              onClick={addProduit}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Ajouter une ligne</span>
            </Button>

            <div className="w-80">
              <div className="flex justify-between border-t pt-2 px-2">
                <span className="font-medium">Total HT:</span>
                <span className="font-medium">{totalHT.toFixed(2)} €</span>
              </div>
              {!localData.isAutoEntrepreneur && (
                <div className="flex items-center justify-between border-t pt-2 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">TVA</span>
                    <Select
                      value={localData.conditions.tva_taux.toString()}
                      onValueChange={(value) =>
                        updateConditions("tva_taux", parseFloat(value))
                      }
                    >
                      <SelectTrigger className="w-[130px] h-7">
                        <SelectValue placeholder="Sélectionner un taux" />
                      </SelectTrigger>
                      <SelectContent>
                        {TVA_RATES.map((rate) => (
                          <SelectItem key={rate.value} value={rate.value}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="font-medium">:</span>
                  </div>
                  <span className="font-medium">{totalTVA.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between border-t border-b py-2 font-bold px-2">
                <span>Total{!localData.isAutoEntrepreneur ? " TTC" : ""}:</span>
                <span>
                  {!localData.isAutoEntrepreneur
                    ? totalTTC.toFixed(2)
                    : totalHT.toFixed(2)}{" "}
                  €
                </span>
              </div>
              {localData.isAutoEntrepreneur && (
                <div className="text-xs text-gray-500 mt-1 text-right italic">
                  TVA non applicable, article 293 B du CGI
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm">
          <div className="flex items-center mb-2">
            <span className="w-40 font-medium">Validité du devis :</span>
            <EditableField
              value={localData.conditions.validite}
              onChange={(value) => updateConditions("validite", value)}
            />
          </div>
          <div className="flex items-center mb-2">
            <span className="w-40 font-medium">Conditions de règlement :</span>
            <EditableField
              value={localData.conditions.reglement}
              onChange={(value) => updateConditions("reglement", value)}
            />
          </div>
          <p className="mt-4">
            Nous restons à votre disposition pour toute information
            complémentaire.
          </p>
          <p>Cordialement,</p>

          <div className="mt-6">
            <p>
              Si ce devis vous convient, veuillez nous le retourner signé
              précédé de la mention :
            </p>
            <p className="font-bold text-center my-2">
              &quot;BON POUR ACCORD ET EXECUTION DES TRAVAUX&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="p-4 bg-gray-50 border-t text-xs text-center text-gray-500">
        <EditableField
          value={localData.infos_societe.pied_de_page}
          onChange={(value) => updateSociete("pied_de_page", value)}
          placeholder="Informations légales de votre société (SARL, N° Siret, etc.)"
          className="text-center"
        />
      </div>
    </div>
  );
}

// Composant pour les champs éditables inline
interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function EditableField({
  value,
  onChange,
  placeholder,
  className = "",
}: EditableFieldProps) {
  return (
    <div
      className={`border border-transparent hover:border-gray-200 rounded px-1 py-0.5 focus-within:border-blue-400 focus-within:bg-blue-50 ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full focus:outline-none bg-transparent"
        placeholder={placeholder}
      />
    </div>
  );
}
