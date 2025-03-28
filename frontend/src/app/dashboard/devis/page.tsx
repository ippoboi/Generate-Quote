"use client";

import { EditableDevis } from "@/components/editable-devis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DevisData } from "@/types/devis";
import axios from "axios";
import { Download, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DevisPage() {
  const [loading, setLoading] = useState(false);
  const [isAutoEntrepreneur, setIsAutoEntrepreneur] = useState(false);
  const [devisData, setDevisData] = useState<DevisData>({
    id: "new-devis",
    title: "Nouveau Devis",
    created_at: new Date(),
    updated_at: new Date(),
    isArchived: false,
    infos_societe: {
      nom: "",
      activite: "",
      adresse: "",
      code_postal: "",
      ville: "",
      telephone: "",
      email: "",
      site: "",
      numero_devis: "",
      date: "",
      forme_juridique: "",
      capital: "",
      siret: "",
      rcs: "",
      code_ape: "",
      tva_intracom: "",
      info_bancaire: "",
      rib: "",
      logo: "",
    },
    infos_client: {
      nom: "",
      adresse: "",
      code_postal: "",
      ville: "",
      description_projet: "",
    },
    produits: [
      {
        id: "1",
        quantite: 1,
        designation: "",
        tva: 20,
        prix_unitaire: 0,
        total_ht: 0,
      },
    ],
    conditions: {
      validite: "",
      reglement: "",
      tva_taux: 20,
    },
    isAutoEntrepreneur: isAutoEntrepreneur,
  });

  // Initialize client-side data after component mounts to avoid hydration mismatches
  useEffect(() => {
    // Generate random ID and date only on the client
    setDevisData((prevData) => ({
      ...prevData,
      id: String(Math.random()).substring(2, 10),
      infos_societe: {
        ...prevData.infos_societe,
        numero_devis:
          "D" +
          String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0"),
        date: new Date().toLocaleDateString("fr-FR"),
      },
    }));
  }, []);

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
    <div className="container my-12 mx-auto max-w-screen-lg p-2 space-y-2 bg-[#F4F5F6] border border-[#EAEBEB] rounded-2xl">
      <div className="flex justify-between items-center gap-2 px-5 py-7 ">
        <div className="flex flex-col">
          <Input
            type="text"
            placeholder="Donnez moi un titre"
            className="text-lg md:text-2xl pl-0 font-medium placeholder:text-2xl placeholder:font-medium focus-visible:ring-0 border-none shadow-none"
          />
          <Input
            type="text"
            placeholder="Ainsi qu'une description pour retrouver de quoi je parle"
            className="text-muted-foreground pl-0 placeholder:text-muted-foreground placeholder:font-medium focus-visible:ring-0 border-none shadow-none"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="w-4 h-4" />
            Sauvegarder
          </Button>
          <Button>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* <div className="flex flex-col gap-2">
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
      </div> */}

      <EditableDevis data={devisData} onUpdate={updateDevisData} />
    </div>
  );
}
