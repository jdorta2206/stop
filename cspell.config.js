// cspell.config.js
module.exports = {
  // ... otras configuraciones existentes ...
  language: "en,es,fr,pt", // Habilita múltiples idiomas
  dictionaries: [
    "en_US",
    "es_ES",  // Español
    "fr_FR",  // Francés
    "pt_BR",  // Portugués
    "companies",
    "softwareTerms",
    "typescript",
    "node",
    "html",
    "css",
    "fonts"
  ],
  dictionaryDefinitions: [
    {
      name: "es_ES",
      path: "node_modules/cspell-dict-es-es/cspell-ext.json",
      description: "Spanish dictionary for cspell."
    },
    {
      name: "fr_FR",
      path: "node_modules/cspell-dict-fr-fr/cspell-ext.json",
      description: "French dictionary for cspell."
    },
    {
      name: "pt_BR",
      path: "node_modules/cspell-dict-pt-br/cspell-ext.json",
      description: "Portuguese (Brazil) dictionary for cspell."
    }
  ]
};
