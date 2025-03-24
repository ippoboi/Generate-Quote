"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { DevisData } from "@/types/devis";
import axios from "axios";
import { EditableDevis } from "@/components/editable-devis";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function DevisGenerator() {
  const [loading, setLoading] = useState(false);
  const [isAutoEntrepreneur, setIsAutoEntrepreneur] = useState(false);

  const [devisData, setDevisData] = useState<DevisData>({
    infos_societe: {
      nom: "Nom de votre société",
      activite: "Votre activité",
      adresse: "Adresse",
      code_postal: "Code postal",
      ville: "Ville",
      telephone: "Téléphone",
      email: "Email",
      site: "Site web (optionnel)",
      numero_devis:
        "D" +
        String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0"),
      date: new Date().toLocaleDateString("fr-FR"),
      forme_juridique: "SARL",
      capital: "7000 Euros",
      siret: "210.896.764 00015",
      rcs: "Nantes",
      code_ape: "947A",
      tva_intracom: "FR 77825896764000",
      info_bancaire: "Banque Postale",
      rib: "20042 00001 5740054W020 44",
      logo: "",
    },
    infos_client: {
      nom: "Société et/ou Nom du client",
      adresse: "Adresse du client",
      code_postal: "Code postal",
      ville: "Ville",
      description_projet: "intitulé : description du projet et/ou Produits",
    },
    produits: [
      {
        id: "1",
        quantite: 12,
        designation: "exemple: m2 de tomette - Réf 'Toscane blanc'",
        tva: 1,
        prix_unitaire: 23.0,
        total_ht: 276.0,
      },
    ],
    conditions: {
      validite: "3 mois",
      reglement: "40% à la commande, le solde à la livraison",
      tva_taux: 20,
    },
    isAutoEntrepreneur: isAutoEntrepreneur,
  });

  const updateDevisData = (newData: DevisData) => {
    setDevisData({
      ...newData,
      isAutoEntrepreneur: isAutoEntrepreneur,
    });
  };

  const handleAutoEntrepreneurChange = (checked: boolean) => {
    setIsAutoEntrepreneur(checked);
    setDevisData({
      ...devisData,
      isAutoEntrepreneur: checked,
    });
  };

  const handleGenerateDevis = async () => {
    try {
      setLoading(true);

      // Calculer les totaux HT pour chaque produit
      const produitsWithTotals = devisData.produits.map((produit) => ({
        ...produit,
        total_ht: produit.quantite * produit.prix_unitaire,
      }));

      // Mettre à jour les produits avec les totaux calculés
      const dataToSend = {
        ...devisData,
        produits: produitsWithTotals,
        isAutoEntrepreneur: isAutoEntrepreneur,
      };

      // Appel API pour générer le PDF
      const response = await axios.post(
        "http://127.0.0.1:5000/api/generate-devis",
        dataToSend
      );

      if (response.data.success) {
        // Télécharger le fichier généré
        window.open(
          `http://127.0.0.1:5000/api/download/${response.data.file}`,
          "_blank"
        );
        toast.success("Devis généré avec succès", {
          description: "Votre devis a été généré et téléchargé",
        });
      } else {
        throw new Error("Erreur lors de la génération du devis");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la génération du devis",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Devis #1</h1>
        <p className="text-sm text-muted-foreground">
          Ceci est une description du devis
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Options</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-entrepreneur"
            checked={isAutoEntrepreneur}
            onCheckedChange={handleAutoEntrepreneurChange}
          />
          <Label htmlFor="auto-entrepreneur" className="font-medium text-sm">
            Je suis Auto-entrepreneur avec chiffre d&apos;affaires &lt; 25 000€
            (pas de TVA applicable)
          </Label>
        </div>
      </div>

      <EditableDevis data={devisData} onUpdate={updateDevisData} />

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleGenerateDevis}
          disabled={loading}
          className="px-8"
        >
          {loading ? "Génération..." : "Générer le PDF"}
        </Button>
      </div>
    </div>
  );
}
