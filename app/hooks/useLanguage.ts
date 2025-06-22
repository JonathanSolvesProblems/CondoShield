import { useState, createContext, useContext } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    'app.title': 'CondoShield',
    'app.tagline': 'Protect Your Property Rights',
    'nav.dashboard': 'Dashboard',
    'nav.analyzer': 'Analyzer',
    'nav.legal': 'Legal Assistant',
    'nav.community': 'Community',
    'nav.generator': 'Letter Generator',
    'dashboard.title': 'Your Property Protection Dashboard',
    'dashboard.subtitle': 'Track assessments, disputes, and protect your rights',
    'dashboard.totalAssessments': 'Total Assessments',
    'dashboard.activeDisputes': 'Active Disputes',
    'dashboard.savedAmount': 'Amount Saved',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.viewAll': 'View All',
    'dashboard.noActivity': 'No recent activity',
    'analyzer.title': 'Assessment Analyzer',
    'analyzer.subtitle': 'Upload and analyze your property assessments',
    'analyzer.upload': 'Upload Assessment',
    'analyzer.manual': 'Manual Entry',
    'analyzer.dragDrop': 'Drag and drop your PDF or image here',
    'analyzer.fileTypes': 'Supports PDF, JPG, PNG files',
    'analyzer.processing': 'Processing assessment...',
    'analyzer.results': 'Analysis Results',
    'analyzer.breakdown': 'Cost Breakdown',
    'analyzer.questionable': 'Potentially Questionable',
    'analyzer.normal': 'Normal',
    'legal.title': 'Legal Assistant',
    'legal.subtitle': 'Get personalized legal guidance for your region',
    'legal.askQuestion': 'Ask a Legal Question',
    'legal.placeholder': 'e.g., Can I refuse to pay a special assessment with no breakdown?',
    'legal.submit': 'Get Legal Guidance',
    'legal.processing': 'Analyzing your question...',
    'legal.commonQuestions': 'Common Questions',
    'community.title': 'Owner Community',
    'community.subtitle': 'Connect with verified property owners worldwide',
    'community.search': 'Search by location, issue, etc.',
    'community.filter': 'Filter by Category',
    'community.all': 'All Posts',
    'community.warnings': 'Warnings',
    'community.success': 'Success Stories',
    'community.questions': 'Questions',
    'community.advice': 'Advice',
    'community.newPost': 'New Post',
    'community.upvotes': 'upvotes',
    'community.replies': 'replies',
    'generator.title': 'Dispute Letter Generator',
    'generator.subtitle': 'Generate professional dispute letters',
    'generator.selectAssessment': 'Select Assessment to Dispute',
    'generator.recipientName': 'Recipient Name',
    'generator.recipientTitle': 'Recipient Title',
    'generator.yourConcerns': 'Your Concerns',
    'generator.concernsPlaceholder': 'Describe your specific concerns about this assessment...',
    'generator.generateLetter': 'Generate Letter',
    'generator.downloadPdf': 'Download PDF',
    'generator.copyText': 'Copy Text',
    'settings.language': 'Language',
    'settings.region': 'Your Region',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close'
  },
  fr: {
    'app.title': 'CondoShield',
    'app.tagline': 'Protégez Vos Droits Immobiliers',
    'nav.dashboard': 'Tableau de Bord',
    'nav.analyzer': 'Analyseur',
    'nav.legal': 'Assistant Juridique',
    'nav.community': 'Communauté',
    'nav.generator': 'Générateur de Lettres',
    'dashboard.title': 'Votre Tableau de Bord de Protection Immobilière',
    'dashboard.subtitle': 'Suivez les évaluations, les litiges et protégez vos droits',
    'dashboard.totalAssessments': 'Évaluations Totales',
    'dashboard.activeDisputes': 'Litiges Actifs',
    'dashboard.savedAmount': 'Montant Économisé',
    'dashboard.recentActivity': 'Activité Récente',
    'dashboard.viewAll': 'Voir Tout',
    'dashboard.noActivity': 'Aucune activité récente',
    'analyzer.title': 'Analyseur d\'Évaluation',
    'analyzer.subtitle': 'Téléchargez et analysez vos évaluations immobilières',
    'analyzer.upload': 'Télécharger Évaluation',
    'analyzer.manual': 'Saisie Manuelle',
    'analyzer.dragDrop': 'Glissez et déposez votre PDF ou image ici',
    'analyzer.fileTypes': 'Supporte les fichiers PDF, JPG, PNG',
    'analyzer.processing': 'Traitement de l\'évaluation...',
    'analyzer.results': 'Résultats d\'Analyse',
    'analyzer.breakdown': 'Répartition des Coûts',
    'analyzer.questionable': 'Potentiellement Questionnable',
    'analyzer.normal': 'Normal',
    'legal.title': 'Assistant Juridique',
    'legal.subtitle': 'Obtenez des conseils juridiques personnalisés pour votre région',
    'legal.askQuestion': 'Poser une Question Juridique',
    'legal.placeholder': 'ex: Puis-je refuser de payer une évaluation spéciale sans détail?',
    'legal.submit': 'Obtenir des Conseils Juridiques',
    'legal.processing': 'Analyse de votre question...',
    'legal.commonQuestions': 'Questions Fréquentes',
    'community.title': 'Communauté des Propriétaires',
    'community.subtitle': 'Connectez-vous avec des propriétaires vérifiés du monde entier',
    'community.search': 'Recherche par lieu, par problème, etc.',
    'community.filter': 'Filtrer par Catégorie',
    'community.all': 'Tous les Posts',
    'community.warnings': 'Avertissements',
    'community.success': 'Histoires de Succès',
    'community.questions': 'Questions',
    'community.advice': 'Conseils',
    'community.newPost': 'Nouveau Post',
    'community.upvotes': 'votes positifs',
    'community.replies': 'réponses',
    'generator.title': 'Générateur de Lettres de Contestation',
    'generator.subtitle': 'Générez des lettres de contestation professionnelles',
    'generator.selectAssessment': 'Sélectionner l\'Évaluation à Contester',
    'generator.recipientName': 'Nom du Destinataire',
    'generator.recipientTitle': 'Titre du Destinataire',
    'generator.yourConcerns': 'Vos Préoccupations',
    'generator.concernsPlaceholder': 'Décrivez vos préoccupations spécifiques concernant cette évaluation...',
    'generator.generateLetter': 'Générer la Lettre',
    'generator.downloadPdf': 'Télécharger PDF',
    'generator.copyText': 'Copier le Texte',
    'settings.language': 'Langue',
    'settings.region': 'Votre Région',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.success': 'Succès!',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer'
  }
};

export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return { t };
};