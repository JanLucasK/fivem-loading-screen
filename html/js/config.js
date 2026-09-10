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
      category: 'COMMUNITY', label: 'Community',
      title: ['Die Community wartet.'],
      description: 'Neu hier? Lerne die Community auf Discord kennen.',
      image: 'media/life-city.jpg', imageAlt: 'Los Santos bei Nacht mit belebter Strandpromenade',
      meta: 'DEIN LEBEN. DEINE ENTSCHEIDUNGEN.', footnote: 'Mehr im Discord',
      icon: '', logo: ''
    },
    {
      category: 'COMMUNITY EVENT', label: 'Nachtleben',
      title: ['Abends in Los Santos.'],
      description: 'Entdecke die Bars und Treffpunkte von Los Santos.',
      image: 'media/life-bar.jpg', imageAlt: 'Stimmungsvolle Bar in Los Santos',
      meta: 'NIGHTLIFE · COMMUNITY', footnote: 'Event-Vorschau · Beispielinhalt',
      icon: '', logo: ''
    },
    {
      category: 'NEUES AUS DER STADT', label: 'Deine Crew',
      title: ['Finde deine Crew.'],
      description: 'Stellt eure Gruppe vor und findet neue Mitspieler.',
      image: 'media/life-crew.jpg', imageAlt: 'Eine Crew unterwegs in Los Santos',
      meta: 'BEGEGNUNGEN · FREUNDSCHAFTEN · ROLEPLAY', footnote: 'Entdecke deine Möglichkeiten',
      icon: '', logo: ''
    },
    {
      category: 'FRAKTIONEN IM FOKUS', label: 'Streifendienst',
      title: ['Einblicke in den Streifendienst.'],
      description: 'Lerne den Polizeialltag auf NEO V kennen.',
      image: 'media/faction-police.jpg', imageAlt: 'Polizeieinsatz auf den Straßen von Los Santos',
      meta: 'PERSPEKTIVEN · FRAKTIONSLEBEN', footnote: 'Fraktions-Vorschau · Beispielinhalt',
      icon: '', logo: ''
    }
  ]
};
