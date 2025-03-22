from flask import Blueprint, request, jsonify, send_file, current_app
import os
import uuid
from app.devis_generator import GenerateurDevis

bp = Blueprint('main', __name__)

@bp.route('/api/generate-devis', methods=['POST'])
def generate_devis():
    """API endpoint pour générer un devis PDF"""
    try:
        data = request.json
        
        # Récupérer les données
        infos_societe = data.get('infos_societe', {})
        infos_client = data.get('infos_client', {})
        produits = data.get('produits', [])
        conditions = data.get('conditions', {})
        is_auto_entrepreneur = data.get('isAutoEntrepreneur', False)
        
        # Mise à jour des conditions avec le statut auto-entrepreneur
        if conditions:
            conditions['isAutoEntrepreneur'] = is_auto_entrepreneur
        else:
            conditions = {'isAutoEntrepreneur': is_auto_entrepreneur}
            
        signature = data.get('signature', None)
        mention_accord = data.get('mentionAccord', "BON POUR ACCORD ET EXECUTION DES TRAVAUX")
        date_signature = data.get('dateSignature', None)
        
        # Générer un nom de fichier unique
        filename = f"devis_{uuid.uuid4().hex}.pdf"
        temp_folder = current_app.config['TEMP_FOLDER']
        filepath = os.path.join(temp_folder, filename)
        
        # Créer le dossier temp s'il n'existe pas
        os.makedirs(temp_folder, exist_ok=True)
        
        # Générer le PDF
        generator = GenerateurDevis()
        generator.generer_devis(filepath, infos_societe, infos_client, produits, conditions, signature, mention_accord, date_signature)
        
        # Retourner le chemin du fichier
        return jsonify({
            'success': True,
            'file': filename
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """API endpoint pour télécharger un devis généré"""
    try:
        temp_folder = current_app.config['TEMP_FOLDER']
        filepath = os.path.join(temp_folder, filename)
        return send_file(filepath, as_attachment=True, download_name="devis.pdf")
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404

