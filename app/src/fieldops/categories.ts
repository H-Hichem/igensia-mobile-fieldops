import { ObservationCategory } from './types';

// Seules quelques categories "historiques" ont une couleur dediee pour l'instant
// (voir palette dans theme/variables.scss) ; avec l'ajout d'une trentaine de
// categories, un Record strict (toutes les cles obligatoires) ne compile plus -
// passe en Partial, avec un fallback neutre pour les categories non mappees
// (voir DEFAULT_CATEGORY_CSS_VAR). A revisiter avec l'UX des categories.
export const CATEGORY_CSS_VAR: Partial<Record<ObservationCategory, string>> = {
  'Déchet métallique': '--fo-category-metal',
  'Déchet verre': '--fo-category-verre',
  'Mégot de cigarette': '--fo-category-megot',
  'Arbre remarquable': '--fo-category-arbre',
  'Espèce invasive': '--fo-category-invasive',
};

export const DEFAULT_CATEGORY_CSS_VAR = '--ion-color-medium';
