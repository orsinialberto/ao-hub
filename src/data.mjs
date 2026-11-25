// Testi e indirizzi del sito.
export const SITE_URL = 'https://albertorsini.it';
/** Finché il sito è sull'indirizzo di prova non va indicizzato. */
export const TRIAL = true;
/** Usato solo dalla 404, che deve funzionare a qualunque profondità. */
export const BASE_PATH = '/ao-hub/';
/** Unico punto da cambiare quando il blog si sposta. */
export const BLOG_BASE = 'https://albertorsini.it';
export const SCENES = ['gallery', 'cv', 'blog'];
export const DOOR_ORDER = ['blog', 'cv', 'gallery'];

export const links = (lang) => ({
  gallery: 'https://gallery.albertorsini.it/',
  cv: `https://curriculum.albertorsini.it/${lang === 'en' ? 'en/' : ''}`,
  blog: `${BLOG_BASE}/${lang}/`,
});

export const copy = {
  it: {
    title: 'Alberto Orsini',
    tagline: 'Software, viaggi e fotografia.',
    description: 'Il lavoro di Alberto Orsini in un posto solo: blog di viaggio, curriculum e galleria fotografica.',
    doorsLabel: 'I miei siti',
    languageLabel: 'Lingua',
    doors: { blog: 'Blog', cv: 'Curriculum', gallery: 'Galleria' },
    captions: { gallery: 'Entra nella galleria', cv: 'Guarda il curriculum', blog: 'Leggi il blog' },
    hint: 'Trascina per girare',
    trackLabel: 'Momento mostrato',
    prev: 'Scena precedente',
    next: 'Scena successiva',
    posterAlt: 'Alberto Orsini disegnato mentre fotografa, in un prato',
    sceneLabel: 'Prato che gira: trascina o usa le frecce',
  },
  en: {
    title: 'Alberto Orsini',
    tagline: 'Software, travel and photography.',
    description: "Alberto Orsini's work in one place: travel blog, résumé and photo gallery.",
    doorsLabel: 'My sites',
    languageLabel: 'Language',
    doors: { blog: 'Blog', cv: 'Résumé', gallery: 'Gallery' },
    captions: { gallery: 'Enter the gallery', cv: 'See the résumé', blog: 'Read the blog' },
    hint: 'Drag to turn',
    trackLabel: 'Shown scene',
    prev: 'Previous scene',
    next: 'Next scene',
    posterAlt: 'Drawing of Alberto Orsini taking a photo in a meadow',
    sceneLabel: 'Turning meadow: drag or use the arrows',
  },
};
