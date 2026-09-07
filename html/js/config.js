/** All media paths are relative to html/index.html. No external services required.
 * Example event copy is intentionally marked; replace it with your own news.
 * icon / logo accept PNG, WebP, JPG or SVG paths. video accepts local MP4/WebM.
 */
window.NEOV_CONFIG = {
  slideDuration: 10000,
  homepage: 'https://neov.makeitclever.de',
  // Replace # with your real HTTPS channel URLs. Placeholder clicks do not navigate.
  // Empty entries are hidden in FiveM; an empty list hides the social footer.
  socials: [
    { label: 'Discord', description: 'Deine Community', url: '#' },
    { label: 'TikTok', description: 'Momente aus der Stadt', url: '#' },
    { label: 'YouTube', description: 'Geschichten in Bewegtbild', url: '#' },
    { label: 'Instagram', description: 'Ein anderer Blickwinkel', url: '#' }
  ],
  portal: { image: 'media/life-city.jpg', video: '' },
  stories: [
    {
      category: 'WILLKOMMEN IN LOS SANTOS', label: 'Dein neues Kapitel',
      title: ['Das hier wird', 'deine Stadt.'],
      description: 'Fremde werden Freunde. Aus Momenten werden Geschichten. Und mittendrin: du.',
      image: 'media/life-city.jpg', imageAlt: 'Los Santos bei Nacht mit belebter Strandpromenade',
      meta: 'DEIN LEBEN. DEINE ENTSCHEIDUNGEN.', footnote: 'Willkommen auf NEO V',
      icon: '', logo: ''
    },
    {
      category: 'COMMUNITY EVENT', label: 'Die Nacht gehört uns',
      title: ['Nach Sonnenuntergang', 'geht’s erst los.'],
      description: 'Ein Drink. Neue Gesichter. Eine Nacht, die du nicht geplant hast. Wir sehen uns an der Bar.',
      image: 'media/life-bar.jpg', imageAlt: 'Stimmungsvolle Bar in Los Santos',
      meta: 'NIGHTLIFE · COMMUNITY', footnote: 'Event-Vorschau · Beispielinhalt',
      icon: '', logo: ''
    },
    {
      category: 'NEUES AUS DER STADT', label: 'Finde deine Leute',
      title: ['Allein kommst du an.', 'Zusammen weiter.'],
      description: 'Die besten Geschichten schreibt man gemeinsam. Finde die Menschen, die deine Stadt zu deinem Zuhause machen.',
      image: 'media/life-crew.jpg', imageAlt: 'Eine Crew unterwegs in Los Santos',
      meta: 'BEGEGNUNGEN · FREUNDSCHAFTEN · ROLEPLAY', footnote: 'Entdecke deine Möglichkeiten',
      icon: '', logo: ''
    },
    {
      category: 'FRAKTIONEN IM FOKUS', label: 'Mehr als ein Abzeichen',
      title: ['Deine Entscheidung.', 'Deine Verantwortung.'],
      description: 'Jede Schicht erzählt eine andere Geschichte. Entdecke das Leben auf der anderen Seite des Funkgeräts.',
      image: 'media/faction-police.jpg', imageAlt: 'Polizeieinsatz auf den Straßen von Los Santos',
      meta: 'PERSPEKTIVEN · FRAKTIONSLEBEN', footnote: 'Fraktions-Vorschau · Beispielinhalt',
      icon: '', logo: ''
    }
  ]
};
