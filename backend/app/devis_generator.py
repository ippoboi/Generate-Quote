# app/devis_generator.py
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import cm
import datetime
import base64
import io
import re
import math

class GenerateurDevis:
    def __init__(self):
        # Configuration des styles
        self.styles = getSampleStyleSheet()
        self.styles.add(ParagraphStyle(name='Center', alignment=1))
        self.styles.add(ParagraphStyle(name='Right', alignment=2))
        
    def generer_devis(self, nom_fichier, infos_societe, infos_client, produits, conditions=None, signature=None, mention_accord=None, date_signature=None):
        """
        Génère un devis au format PDF
        
        Args:
            nom_fichier (str): Nom du fichier PDF à générer
            infos_societe (dict): Informations sur la société
            infos_client (dict): Informations sur le client
            produits (list): Liste de dictionnaires contenant les produits/services
            conditions (dict, optional): Conditions du devis
            signature (str, optional): Image de signature en base64
            mention_accord (str, optional): Mention d'accord
            date_signature (str, optional): Date de signature
        """
        doc = SimpleDocTemplate(nom_fichier, pagesize=A4, 
                               leftMargin=1.5*cm, rightMargin=1.5*cm,
                               topMargin=1.5*cm, bottomMargin=1.5*cm)
        
        elements = []
        
        # Gestion de la pagination
        pagination_settings = conditions.get('paginationSettings', {})
        items_per_page = pagination_settings.get('itemsPerPage', 10)
        total_pages = pagination_settings.get('totalPages', math.ceil(len(produits) / items_per_page)) if items_per_page > 0 else 1
        
        # Diviser les produits en pages
        for page_num in range(1, total_pages + 1):
            if page_num > 1:
                elements.append(PageBreak())
                
            # En-tête du document (société et numéro de devis)
            data_entete = [
                [self._creer_bloc_societe(infos_societe), self._creer_bloc_devis(infos_societe.get('numero_devis', ''), infos_societe.get('date', datetime.datetime.now().strftime('%d/%m/%Y')))]
            ]
            
            t_entete = Table(data_entete, colWidths=[doc.width/2.0]*2)
            t_entete.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(t_entete)
            elements.append(Spacer(1, 1*cm))
            
            # Bloc client
            elements.append(self._creer_bloc_client(infos_client))
            elements.append(Spacer(1, 1.5*cm))
            
            # Titre du projet
            elements.append(Paragraph(f"<b>intitulé : {infos_client.get('description_projet', 'description du projet et/ou Produits')}</b>", self.styles['Normal']))
            elements.append(Spacer(1, 0.5*cm))
            
            # Calculer les indices des produits pour cette page
            start_idx = (page_num - 1) * items_per_page
            end_idx = min(start_idx + items_per_page, len(produits))
            page_products = produits[start_idx:end_idx]
            
            # Tableau des produits pour cette page
            elements.append(self._creer_tableau_produits(page_products, doc.width))
            elements.append(Spacer(1, 0.5*cm))
            
            # Auto-entrepreneur flag
            is_auto_entrepreneur = conditions.get('isAutoEntrepreneur', False)
            
            # Totaux (affichés uniquement sur la dernière page)
            if page_num == total_pages:
                total_ht = sum(float(p.get('total_ht', 0)) for p in produits)
                tva_taux = 0 if is_auto_entrepreneur else float(conditions.get('tva_taux', 20))
                tva_montant = total_ht * tva_taux / 100
                total_ttc = total_ht + tva_montant
                
                elements.append(self._creer_tableau_totaux(total_ht, tva_taux, tva_montant, total_ttc, is_auto_entrepreneur))
                elements.append(Spacer(1, 1*cm))
                
                # Conditions de règlement (affichées uniquement sur la dernière page)
                if conditions:
                    validite = conditions.get('validite', '3 mois')
                    reglement = conditions.get('reglement', '40% à la commande, le solde à la livraison')
                    elements.append(Paragraph(f"<b>Validité du devis : </b>{validite}", self.styles['Normal']))
                    elements.append(Paragraph(f"<b>Conditions de règlement : </b>{reglement}", self.styles['Normal']))
                    elements.append(Paragraph("Nous restons à votre disposition pour toute information complémentaire.", self.styles['Normal']))
                    elements.append(Paragraph("Cordialement,", self.styles['Normal']))
                    elements.append(Spacer(1, 1*cm))
                    
                    # Signature (uniquement sur la dernière page)
                    elements.append(Paragraph("Si ce devis vous convient, veuillez nous le retourner signé précédé de la mention :", self.styles['Normal']))
                    
                    if mention_accord:
                        elements.append(Paragraph(f"<b>\"{mention_accord}\"</b>", self.styles['Center']))
                    else:
                        elements.append(Paragraph("<b>\"BON POUR ACCORD ET EXECUTION DES TRAVAUX\"</b>", self.styles['Center']))
                        
                    elements.append(Spacer(1, 0.5*cm))
                    
                    if signature:
                        try:
                            # Extract the base64 data from the data URI
                            base64_data = re.sub('^data:image/.+;base64,', '', signature)
                            signature_data = io.BytesIO(base64.b64decode(base64_data))
                            signature_img = Image(signature_data, width=5*cm, height=2.5*cm)
                            
                            # Ajout de la date si disponible
                            date_value = date_signature if date_signature else ""
                            
                            data_signature = [["DATE:", "SIGNATURE:"], [date_value, signature_img]]
                            
                            # Ajout de la mention en petit sous la signature
                            if mention_accord:
                                signature_mention = Paragraph(f"<font size='7'>{mention_accord}</font>", self.styles['Center'])
                                data_signature.append(["", signature_mention])
                            
                            t_signature = Table(data_signature, colWidths=[doc.width/2.0]*2)
                            t_signature.setStyle(TableStyle([
                                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                ('LINEBELOW', (0, 0), (0, 0), 1, colors.black),
                                ('LINEBELOW', (1, 0), (1, 0), 1, colors.black),
                                ('ALIGN', (1, 1), (1, 1), 'CENTER'),
                                ('ALIGN', (1, 2), (1, 2), 'CENTER') if mention_accord else None,
                            ]))
                            elements.append(t_signature)
                        except Exception as e:
                            print(f"Erreur lors du traitement de la signature: {e}")
                            # En cas d'erreur, on revient au format sans signature
                            data_signature = [["DATE:", "SIGNATURE:"], [date_signature if date_signature else "", ""]]
                            t_signature = Table(data_signature, colWidths=[doc.width/2.0]*2)
                            t_signature.setStyle(TableStyle([
                                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                ('LINEBELOW', (0, 0), (0, 0), 1, colors.black),
                                ('LINEBELOW', (1, 0), (1, 0), 1, colors.black),
                            ]))
                            elements.append(t_signature)
                    else:
                        data_signature = [["DATE:", "SIGNATURE:"], [date_signature if date_signature else "", ""]]
                        t_signature = Table(data_signature, colWidths=[doc.width/2.0]*2)
                        t_signature.setStyle(TableStyle([
                            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                            ('LINEBELOW', (0, 0), (0, 0), 1, colors.black),
                            ('LINEBELOW', (1, 0), (1, 0), 1, colors.black),
                        ]))
                        elements.append(t_signature)
                    
                    elements.append(Spacer(1, 2*cm))
            
            # Pied de page pour chaque page
            elements.append(self._creer_pied_de_page(infos_societe, page_num, total_pages))
        
        # Génération du document
        doc.build(elements)
        
    def _creer_bloc_societe(self, infos_societe):
        """Crée le bloc avec les informations de la société"""
        nom = infos_societe.get('nom', 'le nom de votre société')
        activite = infos_societe.get('activite', 'votre activité')
        adresse = infos_societe.get('adresse', 'Adresse')
        code_postal = infos_societe.get('code_postal', 'Code postal')
        ville = infos_societe.get('ville', 'Ville')
        telephone = infos_societe.get('telephone', 'Téléphone')
        email = infos_societe.get('email', 'Email')
        site = infos_societe.get('site', 'Site web')
        logo = infos_societe.get('logo', '')
        
        # Format de l'adresse
        adresse_complete = f"{adresse}<br/>{code_postal} {ville}"
        # Format des contacts
        contacts = f"{telephone}<br/>{email}"
        if site:
            contacts += f"<br/>{site}"
        
        # Si un logo est fourni, on le dessine
        if logo:
            try:
                # Extract the base64 data from the data URI
                base64_data = re.sub('^data:image/.+;base64,', '', logo)
                logo_data = io.BytesIO(base64.b64decode(base64_data))
                logo_img = Image(logo_data, width=4*cm, height=3*cm, kind='proportional')
                
                # Create a table to hold both the logo and text
                text_paragraph = Paragraph(f"<b>{nom}</b><br/>{activite}<br/><br/>{adresse_complete}<br/>{contacts}", self.styles['Normal'])
                
                logo_table = Table([
                    [logo_img],
                    [text_paragraph]
                ], colWidths=[8*cm])
                
                logo_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('VALIGN', (0, 0), (0, 1), 'TOP'),
                ]))
                
                return logo_table
            except Exception as e:
                print(f"Erreur lors du traitement du logo: {e}")
                # En cas d'erreur, on revient au format sans logo
                pass
        
        # Format standard sans logo
        return Paragraph(f"<b>{nom}</b><br/>{activite}<br/><br/>{adresse_complete}<br/>{contacts}", self.styles['Normal'])
    
    def _creer_bloc_devis(self, numero, date):
        """Crée le bloc avec les informations du devis"""
        bloc = Table([
            [Paragraph("<b>D E V I S</b>", self.styles['Center']), Paragraph(f"n°: {numero}", self.styles['Normal'])],
            [Paragraph(f"Date: {date}", self.styles['Normal']), ""]
        ], colWidths=[5*cm, 3*cm])
        
        bloc.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.lavender),
            ('BACKGROUND', (0, 0), (-1, -1), colors.lavender),
            ('SPAN', (0, 1), (1, 1)),
        ]))
        
        return bloc
    
    def _creer_bloc_client(self, infos_client):
        """Crée le bloc avec les informations du client"""
        nom = infos_client.get('nom', 'Société et/ou Nom du client')
        adresse = infos_client.get('adresse', 'Adresse du client')
        code_postal = infos_client.get('code_postal', 'Code postal')
        ville = infos_client.get('ville', 'Ville')
        
        # Utiliser le style Right pour aligner à droite
        return Paragraph(f"<b>{nom}</b><br/><br/>{adresse}<br/>{code_postal} {ville}", self.styles['Right'])
    
    def _creer_tableau_produits(self, produits, doc_width):
        """Crée le tableau des produits/services"""
        # En-tête du tableau
        data = [["Qté", "Désignation", "Prix Unit.", "Total HT"]]
        
        # Ajout des produits
        for produit in produits:
            qte = produit.get('quantite', '')
            designation = produit.get('designation', '')
            prix_unit = float(produit.get('prix_unitaire', 0))
            total_ht = float(produit.get('total_ht', 0))
            
            data.append([qte, designation, f"{prix_unit:.2f}", f"{total_ht:.2f}"])
        
        # Calcul des largeurs de colonnes proportionnelles à la largeur du document
        col_widths = [
            doc_width * 0.10,  # Qté - 10% de la largeur
            doc_width * 0.60,  # Désignation - 60% de la largeur
            doc_width * 0.15,  # Prix Unit. - 15% de la largeur
            doc_width * 0.15,  # Total HT - 15% de la largeur
        ]
        
        # Création du tableau
        tableau = Table(data, colWidths=col_widths)
        tableau.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.lavender),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lavender),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),  # Alignement centre pour la quantité
            ('ALIGN', (2, 0), (3, -1), 'RIGHT'),   # Alignement droite pour les prix
        ]))
        
        return tableau
    
    def _creer_tableau_totaux(self, total_ht, tva_taux, tva_montant, total_ttc, is_auto_entrepreneur=False):
        """Crée le tableau des totaux"""
        
        if is_auto_entrepreneur:
            # Pour auto-entrepreneur, pas de TVA
            data = [
                ["Total HT", f"{total_ht:.2f} €"],
                ["TVA non applicable, article 293B du CGI", ""],
                ["Total TTC", f"{total_ht:.2f} €"]
            ]
        else:
            # Cas standard avec TVA
            data = [
                ["Total HT", f"{total_ht:.2f} €"],
                [f"TVA ({tva_taux}%)", f"{tva_montant:.2f} €"],
                ["Total TTC", f"{total_ttc:.2f} €"]
            ]
        
        # Création du tableau avec colonne de montant de largeur fixe minimum
        amount_col_width = 4*cm  # Largeur fixe minimum pour les montants
        label_col_width = 8*cm   # Largeur pour les labels
        total_width = label_col_width + amount_col_width
        
        tableau = Table(data, colWidths=[label_col_width, amount_col_width])
        tableau.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.lavender),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lavender),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),  # Alignement droite pour les montants
            ('BACKGROUND', (0, -1), (-1, -1), colors.lavender),  # Fond coloré pour le total TTC
        ]))
        
        # Créer un tableau externe pour positionner le tableau des totaux à droite
        # Le tableau externe a deux colonnes: une vide à gauche et une avec le tableau à droite
        empty_cell = ""
        wrapper_table = Table(
            [[empty_cell, tableau]], 
            colWidths=[None, total_width],  # None permet à la première colonne de prendre l'espace restant
            hAlign='RIGHT'  # Aligne tout le tableau à droite de la page
        )
        
        return wrapper_table
    
    def _creer_pied_de_page(self, infos_societe, page_num, total_pages):
        """Crée le pied de page avec les informations légales de la société"""
        forme_juridique = infos_societe.get('forme_juridique', '')
        capital = infos_societe.get('capital', '')
        siret = infos_societe.get('siret', '')
        rcs = infos_societe.get('rcs', '')
        code_ape = infos_societe.get('code_ape', '')
        tva_intracom = infos_societe.get('tva_intracom', '')
        info_bancaire = infos_societe.get('info_bancaire', '')
        rib = infos_societe.get('rib', '')
        
        # Construire le texte du pied de page
        footer_text = ""
        if forme_juridique and capital:
            footer_text += f"{forme_juridique} au capital de {capital}"
        
        if siret:
            footer_text += f" - N° Siret {siret}"
        
        if rcs:
            footer_text += f" RCS {rcs}"
        
        if code_ape:
            footer_text += f" - Code APE {code_ape}"
        
        if tva_intracom:
            footer_text += f" - N° TVA Intracom. {tva_intracom}"
        
        if info_bancaire and rib:
            footer_text += f"\n{info_bancaire} RIB: {rib}"
        
        footer_table = Table([
            [Paragraph(footer_text, self.styles['Center'])],
            [Paragraph(f"Page {page_num} / {total_pages}", self.styles['Center'])]
        ], colWidths=[100*cm])  # Largeur excessive pour forcer l'utilisation de toute la largeur
        
        return footer_table