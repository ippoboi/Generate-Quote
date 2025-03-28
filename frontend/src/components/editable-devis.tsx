"use client";

import { DevisData, PaginationSettings, Produit } from "@/types/devis";
import { Plus, Settings, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Textarea } from "./ui/textarea";

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
  { value: "0", label: "0% - Auto-entrepreneur" },
];

// Key for localStorage
const DEVIS_STORAGE_KEY = "saved_devis_data";

export function EditableDevis({ data, onUpdate }: EditableDevisProps) {
  // Initialize with prop data only, and move localStorage operations to useEffect
  const [localData, setLocalData] = useState<DevisData>({
    ...data,
    paginationSettings: data.paginationSettings || {
      itemsPerPage: 10,
      currentPage: 1,
      totalPages: Math.ceil(data.produits.length / 10) || 1,
    },
  });

  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Ref for product section to measure height
  const productSectionRef = useRef<HTMLDivElement>(null);
  // State for height warning
  const [heightWarning, setHeightWarning] = useState(false);

  // A4 height in pixels (roughly 1123px at 96dpi)
  const A4_HEIGHT_PX = 1123;
  const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - 500; // Adjust based on header/footer size

  // Load data from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(DEVIS_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Ensure we have pagination settings
          setLocalData({
            ...parsed,
            paginationSettings: parsed.paginationSettings || {
              itemsPerPage: 10,
              currentPage: 1,
              totalPages: Math.ceil(parsed.produits.length / 10) || 1,
            },
          });
        } catch (e) {
          console.error("Error parsing saved devis data", e);
        }
      }
    }
  }, []);

  // Update localData when data prop changes (including isAutoEntrepreneur)
  useEffect(() => {
    // Only update if there's no saved data
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem(DEVIS_STORAGE_KEY)
    ) {
      setLocalData(data);
    }
  }, [data]);

  // Save to localStorage whenever localData changes
  useEffect(() => {
    if (typeof window !== "undefined" && localData) {
      localStorage.setItem(DEVIS_STORAGE_KEY, JSON.stringify(localData));
      setHasUnsavedChanges(true);

      // Auto-save debounce to prevent excessive writes
      const saveTimeout = setTimeout(() => {
        onUpdate(localData);
        setHasUnsavedChanges(false);
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [localData, onUpdate]);

  // Update isAutoEntrepreneur when it changes from props
  useEffect(() => {
    if (data.isAutoEntrepreneur !== localData.isAutoEntrepreneur) {
      setLocalData((prevData) => ({
        ...prevData,
        isAutoEntrepreneur: data.isAutoEntrepreneur,
      }));
    }
  }, [data.isAutoEntrepreneur, localData.isAutoEntrepreneur]);

  // Clear localStorage when user manually saves or when component unmounts
  const clearSavedData = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEVIS_STORAGE_KEY);
      toast.success("Devis sauvegardé");
      setHasUnsavedChanges(false);
      onUpdate(localData);
    }
  }, [localData, onUpdate]);

  // Add beforeunload warning if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  // Pagination functions
  const goToNextPage = () => {
    if (
      localData.paginationSettings?.currentPage !==
      localData.paginationSettings?.totalPages
    ) {
      const updatedSettings = {
        ...(localData.paginationSettings as PaginationSettings),
        currentPage: (localData.paginationSettings?.currentPage || 1) + 1,
      };
      setLocalData({
        ...localData,
        paginationSettings: updatedSettings,
      });
    }
  };

  const goToPreviousPage = () => {
    if ((localData.paginationSettings?.currentPage || 1) > 1) {
      const updatedSettings = {
        ...(localData.paginationSettings as PaginationSettings),
        currentPage: (localData.paginationSettings?.currentPage || 2) - 1,
      };
      setLocalData({
        ...localData,
        paginationSettings: updatedSettings,
      });
    }
  };

  // Calculate pagination
  const itemsPerPage = localData.paginationSettings?.itemsPerPage || 10;
  const currentPage = localData.paginationSettings?.currentPage || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, localData.produits.length);
  const displayedProducts = localData.produits.slice(startIdx, endIdx);

  // Update total pages when products change
  useEffect(() => {
    const totalPages = Math.ceil(localData.produits.length / itemsPerPage) || 1;
    if (totalPages !== (localData.paginationSettings?.totalPages || 1)) {
      setLocalData((prev) => ({
        ...prev,
        paginationSettings: {
          ...(prev.paginationSettings as PaginationSettings),
          totalPages,
        },
      }));
    }
  }, [localData.produits.length, itemsPerPage]);

  // Add a new page (wrapped in useCallback to avoid dependency issues)
  const addPage = useCallback(() => {
    setLocalData((prev) => {
      // Create a page with empty products
      const updatedSettings = {
        ...(prev.paginationSettings as PaginationSettings),
        totalPages: (prev.paginationSettings?.totalPages || 1) + 1,
      };

      // Move to the new page
      updatedSettings.currentPage = updatedSettings.totalPages;

      return {
        ...prev,
        paginationSettings: updatedSettings,
      };
    });
  }, []);

  // Check page height and set warning
  useEffect(() => {
    const checkHeight = () => {
      if (productSectionRef.current) {
        const height = productSectionRef.current.clientHeight;
        const exceeds = height > MAX_CONTENT_HEIGHT;

        // Only show toast when warning is triggered (not when it's cleared)
        if (exceeds && !heightWarning) {
          toast.warning("Limite de la page atteinte", {
            description:
              "Veuillez ajouter une nouvelle page ou réduire le nombre d'éléments.",
            action: {
              label: "Ajouter",
              onClick: addPage,
            },
            duration: 7000, // Show for 7 seconds
          });
        }

        setHeightWarning(exceeds);
      }
    };

    checkHeight();
    // Add resize listener
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [displayedProducts, heightWarning, MAX_CONTENT_HEIGHT, addPage]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Top pagination controls */}
      <div className="p-4  border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={"ghost"}
            onClick={() =>
              setLocalData({
                ...localData,
                paginationSettings: {
                  ...(localData.paginationSettings as PaginationSettings),
                  currentPage: 1,
                },
              })
            }
            className={
              currentPage === 1 ? "bg-[#F4F5F6] text-black" : "text-gray-500"
            }
          >
            1
          </Button>

          {Array.from(
            { length: (localData.paginationSettings?.totalPages || 1) - 1 },
            (_, i) => i + 2
          ).map((pageNum) => (
            <Button
              key={pageNum}
              size="sm"
              variant={"ghost"}
              onClick={() =>
                setLocalData({
                  ...localData,
                  paginationSettings: {
                    ...(localData.paginationSettings as PaginationSettings),
                    currentPage: pageNum,
                  },
                })
              }
              className={
                currentPage === pageNum
                  ? "bg-[#F4F5F6] text-black"
                  : "text-gray-500"
              }
            >
              {pageNum}
            </Button>
          ))}

          <Button
            size="sm"
            variant="ghost"
            onClick={addPage}
            className="text-gray-500"
          >
            +
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* En-tête du devis */}
      <div className="p-6 ">
        <div className="flex justify-between gap-8">
          {/* Informations société */}
          <div className="flex flex-col max-w-sm space-y-4">
            <div className="flex items-center justify-between gap-2 px-3">
              <span className="uppercase font-mono text-muted-foreground text-xs">
                Vos informations
              </span>
              <span className="text-muted-foreground hover:text-black cursor-pointer transition-all duration-300 ease-linear text-xs font-mono uppercase">
                Choisir
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <EditableField
                value={localData.infos_societe.nom}
                onChange={(value) => updateSociete("nom", value)}
                className="font-bold text-lg"
                placeholder="Votre société"
              />

              <EditableField
                value={localData.infos_societe.activite}
                onChange={(value) => updateSociete("activite", value)}
                className="text-sm text-gray-500 mb-4"
                placeholder="Votre activité"
              />
            </div>

            <div className="flex flex-col gap-2">
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
          </div>

          <div className="flex flex-col justify-between">
            {/* Informations devis */}
            <div className="w-full flex flex-col max-w-sm space-y-4">
              <span className="uppercase px-3 font-mono text-muted-foreground text-xs">
                Devis
              </span>

              <div className="w-full space-y-2">
                <EditableField
                  value={localData.infos_societe.numero_devis}
                  onChange={(value) => updateSociete("numero_devis", value)}
                  className="text-sm"
                  placeholder="D00000"
                />

                <EditableField
                  value={localData.infos_societe.date}
                  onChange={(value) => updateSociete("date", value)}
                  className="text-sm"
                  placeholder="JJ/MM/AAAA"
                />
              </div>
            </div>

            {/* Informations client */}
            <div className="w-full flex flex-col max-w-sm space-y-4">
              <div className="flex items-center justify-between gap-2 px-3">
                <span className="uppercase font-mono text-muted-foreground text-xs">
                  Informations client
                </span>
                <span className="text-muted-foreground hover:text-black cursor-pointer transition-all duration-300 ease-linear text-xs font-mono uppercase">
                  Choisir
                </span>
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
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
                  className="w-full"
                />

                <div className="flex gap-2 w-full max-w-sm justify-end">
                  <EditableField
                    value={localData.infos_client.code_postal}
                    onChange={(value) => updateClient("code_postal", value)}
                    placeholder="Code postal"
                  />
                  <EditableField
                    value={localData.infos_client.ville}
                    onChange={(value) => updateClient("ville", value)}
                    placeholder="Ville"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corps du devis */}
      <div className="p-6">
        {/* Description du projet */}
        <div className="space-y-4">
          <div className="max-w-lg space-y-4">
            <div className="uppercase px-3 font-mono text-muted-foreground text-xs">
              Détails
            </div>
            <EditableField
              value={localData.infos_client.description_projet}
              onChange={(value) => updateClient("description_projet", value)}
              placeholder="intitulé : description du projet et/ou Produits"
            />
          </div>

          {/* Tableau des produits */}
          <div ref={productSectionRef} className="space-y-8">
            {heightWarning && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p className="font-bold">
                  Attention : Contenu trop grand pour une page A4
                </p>
                <p>
                  Veuillez ajouter une nouvelle page ou réduire le nombre
                  d&apos;éléments sur cette page.
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50 font-mono ">
                    <TableHead className="w-20 text-center text-muted-foreground">
                      QTÉ
                    </TableHead>
                    <TableHead className="w-[65%] text-muted-foreground">
                      DESIGNATION
                    </TableHead>
                    <TableHead className="w-28 text-center text-muted-foreground">
                      PRIX UNIT.
                    </TableHead>
                    <TableHead className="w-28 text-center text-muted-foreground">
                      TOTAL HT
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProducts.map((produit, index) => {
                    const isLastRow = index === displayedProducts.length - 1;
                    return (
                      <TableRow key={produit.id} className=" items-start">
                        <TableCell
                          className={`text-center align-middle p-2 ${
                            isLastRow ? "rounded-bl-lg" : ""
                          }`}
                        >
                          <Input
                            type="number"
                            value={produit.quantite}
                            onChange={(e) =>
                              updateProduit(
                                startIdx + index,
                                "quantite",
                                e.target.value
                              )
                            }
                            className="min-h-8 w-full text-center bg-gray-50 border-0"
                            placeholder="0"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="p-2 align-middle max-w-sm">
                          <Textarea
                            value={produit.designation}
                            onChange={(e) =>
                              updateProduit(
                                startIdx + index,
                                "designation",
                                e.target.value
                              )
                            }
                            className="min-h-8 w-full text-sm resize-none p-2 bg-gray-50 border-0"
                            placeholder="Exemple d'une désignation d'un produit qui sera pour X"
                            rows={2}
                          />
                        </TableCell>
                        <TableCell className="text-right align-middle p-2">
                          <div className="flex items-center justify-end">
                            <Input
                              type="number"
                              value={produit.prix_unitaire}
                              onChange={(e) =>
                                updateProduit(
                                  startIdx + index,
                                  "prix_unitaire",
                                  e.target.value
                                )
                              }
                              className="min-h-8 w-full text-center bg-gray-50 border-0"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                            <span className="ml-1">€</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium align-middle p-2">
                          {(produit.quantite * produit.prix_unitaire).toFixed(
                            2
                          )}{" "}
                          €
                        </TableCell>
                        <TableCell
                          className={`align-middle p-2 ${
                            isLastRow ? "rounded-br-lg" : ""
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeProduit(startIdx + index)}
                            disabled={localData.produits.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="w-full p-2">
                <Button
                  variant="outline"
                  className="w-full shadow-none border-dashed"
                  onClick={addProduit}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle ligne</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="min-w-96 space-y-4">
                <div className="uppercase px-2 font-mono text-muted-foreground text-xs">
                  RÉCAPITULATIF (EN EUROS)
                </div>
                <div className="rounded-lg border p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-mono">
                      TOTAL HT
                    </span>
                    <span className="">
                      {totalHT.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {!localData.isAutoEntrepreneur && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          TVA
                        </span>
                        <Select
                          value={localData.conditions.tva_taux.toString()}
                          onValueChange={(value) =>
                            updateConditions("tva_taux", parseFloat(value))
                          }
                        >
                          <SelectTrigger className="w-[180px] h-9 text-base">
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
                      </div>
                      <span className="">
                        {totalTVA.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <span className="text-sm text-muted-foreground font-mono">
                      TOTAL {!localData.isAutoEntrepreneur ? "TTC" : ""}
                    </span>
                    <span className="">
                      {(!localData.isAutoEntrepreneur
                        ? totalTTC.toFixed(2)
                        : totalHT.toFixed(2)
                      ).replace(".", ",")}
                    </span>
                  </div>

                  {localData.isAutoEntrepreneur && (
                    <div className="text-xs text-muted-foreground font-mono mt-1 text-right italic">
                      TVA non applicable, article 293 B du CGI
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm">
            {/* Informations supplémentaires */}
            <div className="w-full flex flex-col max-w-sm space-y-4">
              <span className="uppercase px-3 font-mono text-muted-foreground text-xs">
                Informations supplémentaires
              </span>

              <div className="w-full space-y-2">
                <EditableField
                  value={localData.conditions.validite}
                  onChange={(value) => updateConditions("validite", value)}
                  className="w-sm"
                  placeholder="Validité du devis"
                />

                <EditableField
                  value={localData.conditions.reglement}
                  onChange={(value) => updateConditions("reglement", value)}
                  className="w-sm"
                  placeholder="Conditions de réglement"
                />
              </div>
            </div>
            <div className="px-3">
              <div className="mt-6 text-muted-foreground flex flex-col gap-3">
                <p>
                  Nous restons à votre disposition pour toute information
                  complémentaire.
                </p>

                <p>Cordialement,</p>
              </div>

              <div className="mt-6 text-muted-foreground flex flex-col gap-3">
                <p>
                  Si ce devis vous convient, veuillez nous le retourner signé
                  précédé de la mention :
                </p>
                <p className="font-bold">
                  &quot;BON POUR ACCORD ET EXECUTION DES TRAVAUX&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="p-6 bg-[#FAFAFA] border-t text-xs space-y-4">
        <div className="uppercase px-3 font-mono text-muted-foreground text-xs">
          INFORMATIONs DU PIED DE PAGE
        </div>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex flex-col gap-2">
            <EditableField
              value={localData.infos_societe.forme_juridique}
              onChange={(value) => updateSociete("forme_juridique", value)}
              placeholder="SARL, SAS, etc."
              variant="outline"
            />
            <EditableField
              value={localData.infos_societe.capital}
              onChange={(value) => updateSociete("capital", value)}
              placeholder="ex: 7000 Euros"
              variant="outline"
            />

            <EditableField
              value={localData.infos_societe.siret}
              onChange={(value) => updateSociete("siret", value)}
              placeholder="ex: 210.896.764 00015"
              variant="outline"
            />

            <EditableField
              value={localData.infos_societe.rcs}
              onChange={(value) => updateSociete("rcs", value)}
              placeholder="ex: Nantes"
              variant="outline"
            />
          </div>
          <div className="flex flex-col gap-2">
            <EditableField
              value={localData.infos_societe.code_ape}
              onChange={(value) => updateSociete("code_ape", value)}
              placeholder="ex: 947A"
              variant="outline"
            />

            <EditableField
              value={localData.infos_societe.tva_intracom}
              onChange={(value) => updateSociete("tva_intracom", value)}
              placeholder="ex: FR 77825896764000"
              variant="outline"
            />

            <EditableField
              value={localData.infos_societe.info_bancaire}
              onChange={(value) => updateSociete("info_bancaire", value)}
              placeholder="ex: Banque Postale"
              variant="outline"
            />

            <EditableField
              value={localData.infos_societe.rib}
              onChange={(value) => updateSociete("rib", value)}
              placeholder="ex: 20042 00001 5740054W020 44"
              variant="outline"
            />
          </div>
        </div>
      </div>
      {/* Top pagination controls */}
      <div className="p-4  border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={"ghost"}
            onClick={() =>
              setLocalData({
                ...localData,
                paginationSettings: {
                  ...(localData.paginationSettings as PaginationSettings),
                  currentPage: 1,
                },
              })
            }
            className={
              currentPage === 1 ? "bg-[#F4F5F6] text-black" : "text-gray-500"
            }
          >
            1
          </Button>

          {Array.from(
            { length: (localData.paginationSettings?.totalPages || 1) - 1 },
            (_, i) => i + 2
          ).map((pageNum) => (
            <Button
              key={pageNum}
              size="sm"
              variant={"ghost"}
              onClick={() =>
                setLocalData({
                  ...localData,
                  paginationSettings: {
                    ...(localData.paginationSettings as PaginationSettings),
                    currentPage: pageNum,
                  },
                })
              }
              className={
                currentPage === pageNum
                  ? "bg-[#F4F5F6] text-black"
                  : "text-gray-500"
              }
            >
              {pageNum}
            </Button>
          ))}

          <Button
            size="sm"
            variant="ghost"
            onClick={addPage}
            className="text-gray-500"
          >
            +
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour les champs éditables inline
interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "default" | "outline";
}

function EditableField({
  value,
  onChange,
  placeholder,
  variant = "default",
}: EditableFieldProps) {
  return (
    <div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full focus-visible:ring-0 border-none shadow-none text-black placeholder:text-[#818E9C] ${
          variant === "outline" ? "border border-[#EAEBEB]" : "bg-[#F4F5F6]"
        }`}
        placeholder={placeholder}
      />
    </div>
  );
}
