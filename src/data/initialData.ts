import { LoveLetter, MemoryPhoto, LoveReason, CoupleSettings, BucketItem, Milestone } from '../types';

export const initialCoupleSettings: CoupleSettings = {
  partner1: 'Mi Amor',
  partner2: 'Tuyo por siempre',
  startDate: '2026-09-21',
  anniversaryName: '2 Años de Amor Inagotable',
  nextEventDate: '2026-11-20',
  nextEventTitle: 'Escapada a la Costa al Atardecer',
  songTitle: 'Agrega tus canciones MP3',
  songSubtitle: 'Nuestra colección',
};

export const initialLetters: LoveLetter[] = [
  {
    id: 'carta-1',
    title: 'Una Carta Sellada Con Mi Alma',
    subtitle: 'Capítulo Inagotable',
    date: 'Hoy y para siempre',
    category: 'aniversarios',
    sealColor: 'terracotta',
    content: `Amor mío:

Si pudieras verte a través de mis ojos por solo un segundo, comprenderías por qué el mundo se detiene cuando me regalas tu sonrisa. Cada uno de estos 730 días ha sido un privilegio infinito; gracias por ser mi hogar, mi paz y mi poesía predilecta.

No hay día en que no agradezca al universo el cruce fortuito de nuestros caminos. En ti encontré no solo a la compañera perfecta para reír a carcajadas en la cocina a medianoche, sino al refugio sereno donde mi alma descansa sin temor.

Te prometo seguir eligiéndote en cada amanecer, admirar tus sueños como si fueran míos y recordarte siempre lo inmensamente maravillosa que eres.

Por siempre tuyo,
Con amor eterno.`,
    author: 'Tu gran amor',
    isRead: false,
  },
  {
    id: 'carta-2',
    title: 'La primera vez que te vi',
    subtitle: 'El instante en que cambió mi vida',
    date: '17 de Octubre, 2024',
    category: 'primeras',
    sealColor: 'rose',
    content: `Recuerdo con nitidez milimétrica la luz de aquella tarde. Llevabas ese suéter beige y tu cabello caía distraído sobre tus hombros. 

Cuando me miraste y sonreíste por primera vez, sentí algo que jamás había experimentado: una certeza silenciosa, profunda e irrevocable de que mi búsqueda había terminado. 

Desde ese primer café, supe que no quería ningún otro destino que no fuera caminar a tu lado.`,
    author: 'Para la dueña de mi corazón',
    isRead: true,
  },
  {
    id: 'carta-3',
    title: 'Nuestra promesa bajo las estrellas',
    subtitle: 'Un pacto silencioso de ternura',
    date: '12 de Agosto, 2025',
    category: 'promesas',
    sealColor: 'sage',
    content: `Te prometo que en los días soleados celebraremos cada triunfo, y en los días grises seré tu paraguas y tu té caliente.

Te prometo nunca dar por sentada tu mano entrelazada con la mía, escuchar con atención hasta tus pensamientos más pequeños y enamorarme de cada nueva versión tuya que el tiempo descubra.

No busco un cuento de hadas sin imperfecciones, busco esta hermosa realidad contigo: sincera, cómplice y apasionada.`,
    author: 'Siempre tuyo',
    isRead: true,
  },
  {
    id: 'carta-4',
    title: 'Un susurro en la madrugada',
    subtitle: 'Cuando la ciudad duerme y tú respiras en paz',
    date: '4 de Enero, 2026',
    category: 'secretas',
    sealColor: 'gold',
    content: `Son las tres de la mañana. Duermes a mi lado con esa calma infinita que solo tú irradias. La luna se cuela por el borde de las cortinas e ilumina tu perfil.

En momentos como este, sin palabras ni ruido, comprendo el significado de la plenitud. No necesito nada más en este universo que tenerte cerca y saber que mañana abriré los ojos y seguirás aquí.`,
    author: 'Quien vela tus sueños',
    isRead: true,
  },
];

export const initialMemories: MemoryPhoto[] = [
  {
    id: 'foto-1',
    title: 'Caminata entre flores y rosas',
    date: 'Primavera, 2025',
    location: 'Jardín Botánico Colonial',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiyhlhzBFT8xTQ3j_9d6FJd4c0_n8IrNX9kKEeSbCJ7nBxzdGMlEiL9JiwPvOMLZcodlyVtl_b4JzIiLtVCD-uwO6-3tiHlQ0lOcvnxPTL1NBObU8NAdfYjruSt39HHWX0KRSbxtjigmWMzpJgCocSTa9lAQfz5gu-FAu5Eq4zIb51QvQJ4SgaqleoYsoW6jB80u1HW2UKogFhgVTL8yKGIurQOCGX0_vmfsAA_mbrFkth7ecSpCnidQ',
    caption: 'Tú, hoy, mañana y todas las vidas que vengan. El sol del atardecer dorando tu pelo mientras no soltabas mi mano.',
    category: 'citas',
    likes: 42,
  },
  {
    id: 'foto-2',
    title: 'Atardecer en el acantilado costero',
    date: 'Verano, 2025',
    location: 'Faro de la Costa Esmeralda',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-woEUmRVCdxmB9qc_TEJj5niwVM1xJQwqTF158-Tn29XCWQCpFGSrtA9YMuWZmbv0alMmYw6EfY4W926dyvIN7dF47sJfHOOcGHDqXbxyeggXqRCNcQiY5fRmilcfnJyRcABw_54B5Q9wO6Q5HFh1GUqw7Q_wB1Xxwz9lxiSGDeLT7FIkQNKnJ1rjpslnlz-npfz-gC1ev3N06RFEBoymz9LJd_wlrrJaKp5CYx4Yis93TIH2Xls2RQ',
    caption: 'La brisa salina, el eco de las olas y nosotros prometiéndonos que ningún mar sería demasiado ancho para nuestro amor.',
    category: 'viajes',
    likes: 38,
  },
  {
    id: 'foto-3',
    title: 'Tardes de cartas y flores secas',
    date: 'Otoño, 2025',
    location: 'Nuestro Café Favorito',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDusAcEV_vmKmrNQDY7cGxtuTbM7alYz3g0Olv0P1ceSRu7OxU_KLDWqbzK2ex-bV74Jnm1RULL-Yd0XfgBbBvltFrmlnv4VwYdAh6KJVuyg5SZ4np64PTHG3b3KXwBI-JHKNr5Yku4cf1hdXGZ-1LBCvQIwlayK5pntLFMuHE-E19C2IeqH6wMrgNETyQuqpU1FvURu6LHEmJnY_X2-aRT5hX21wABm3mCtK-xUd9MSjytIg3SQdelFQ',
    caption: 'Escribiendo pequeños mensajes en servilletas y leyendo poesía antigua con una taza de café caliente entre las manos.',
    category: 'cotidiano',
    likes: 29,
  },
  {
    id: 'foto-4',
    title: 'Noche de faroles flotantes',
    date: 'Diciembre, 2025',
    location: 'Festival de las Luces en el Valle',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOMl3a2FwkZhUFvHn0iuf7BIiJ62KL2LVKFptykMoOAU5xGPkm7pVaIhILL-ayXiYhHYlQhtTkmx9UBo-Vcj1gpT_Hm1ou_U6P4aMMCkA42ERMxEqgDYQ0k_tWn8TiHFhAKDJ4-ols5bvyztR7qYwTyzF6z9XEznjGpPjGQ27Y8bJp6LDGA0EhAVnP6nGQQxWxSF0uBWtQIKSDBN7e1Lw48_lbA6a7J2C6sXquuPR3BU17ebwuSZJNzw',
    caption: 'Viendo ascender cientos de deseos al cielo estrellado. Cuando me preguntaste qué pedí, te dije que mi deseo ya estaba a mi lado.',
    category: 'celebraciones',
    likes: 56,
  },
  {
    id: 'foto-5',
    title: 'Picnic bajo la sombra de los álamos',
    date: 'Mayo, 2025',
    location: 'Colinas Verdes del Sur',
    imageUrl:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
    caption: 'Fresas silvestres, una manta de lino a cuadros y horas de risas sin preocuparnos por el reloj.',
    category: 'cotidiano',
    likes: 31,
  },
  {
    id: 'foto-6',
    title: 'Nuestro primer aniversario',
    date: '17 de Octubre, 2025',
    location: 'Cena a la luz de las velas',
    imageUrl:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    caption: '365 días amándote y celebrando que el amor verdadero no pesa, sino que eleva.',
    category: 'celebraciones',
    likes: 64,
  },
];

export const initialReasons: LoveReason[] = [
  { id: 'r-1', number: 1, text: 'La manera en que tus ojos se achinan cuando te ríes de verdad.', category: 'sonrisa', isFavorite: true },
  { id: 'r-2', number: 2, text: 'Cómo buscas instintivamente mi mano cuando caminamos por la calle.', category: 'detalles', isFavorite: true },
  { id: 'r-3', number: 3, text: 'La paz infinita que me transmites cuando apoyo mi cabeza en tu pecho.', category: 'paz', isFavorite: true },
  { id: 'r-4', number: 4, text: 'Tu paciencia infinita y la dulzura con la que me escuchas después de un día difícil.', category: 'detalles', isFavorite: false },
  { id: 'r-5', number: 5, text: 'Ese brillo especial en tu mirada cuando hablas de lo que te apasiona.', category: 'sonrisa', isFavorite: true },
  { id: 'r-6', number: 6, text: 'La complicidad con la que nos miramos en una habitación llena de gente sin decir una palabra.', category: 'recuerdos', isFavorite: false },
  { id: 'r-7', number: 7, text: 'Cómo haces de cualquier momento ordinario una memoria inolvidable.', category: 'recuerdos', isFavorite: true },
  { id: 'r-8', number: 8, text: 'Tu bondad genuina con las personas y los animales que encuentras.', category: 'paz', isFavorite: false },
  { id: 'r-9', number: 9, text: 'Bailar descalzos en la cocina mientras preparamos la cena con nuestra música.', category: 'recuerdos', isFavorite: true },
  { id: 'r-10', number: 10, text: 'El olor de tu perfume que se queda impregnado en mi abrigo cuando te vas.', category: 'detalles', isFavorite: false },
  { id: 'r-11', number: 11, text: 'Saber que cualquier plan a futuro es infinitamente mejor porque estás tú en él.', category: 'futuro', isFavorite: true },
  { id: 'r-12', number: 12, text: 'Tu forma de abrazarme cuando tengo frío, como si pudieras cobijar el mundo entero.', category: 'paz', isFavorite: true },
  { id: 'r-13', number: 13, text: 'Que celebres mis pequeños triunfos con más entusiasmo que nadie.', category: 'detalles', isFavorite: false },
  { id: 'r-14', number: 14, text: 'Despertarme a tu lado y ver la suavidad de la luz matutina sobre tu rostro.', category: 'paz', isFavorite: true },
  { id: 'r-15', number: 15, text: 'Tus ocurrencias divertidas en los momentos más inesperados.', category: 'sonrisa', isFavorite: false },
  { id: 'r-16', number: 16, text: 'La valentía con la que enfrentas los desafíos sin perder tu ternura.', category: 'detalles', isFavorite: false },
  { id: 'r-17', number: 17, text: 'Cómo nuestras manos encajan con una precisión que parece predestinada.', category: 'detalles', isFavorite: true },
  { id: 'r-18', number: 18, text: 'Nuestras conversaciones profundas que duran hasta altas horas de la madrugada.', category: 'recuerdos', isFavorite: false },
  { id: 'r-19', number: 19, text: 'Que en ti encontré a mi mejor amiga, mi confidente y el amor de mi vida.', category: 'futuro', isFavorite: true },
  { id: 'r-20', number: 20, text: 'Porque amarte es la decisión más fácil y hermosa que tomo todos los días.', category: 'futuro', isFavorite: true },
];

export const initialMilestones: Milestone[] = [
  {
    id: 'm-1',
    date: '17 Octubre 2024',
    title: 'El Primer Encuentro',
    description: 'Ese café donde una conversación de diez minutos se transformó en cuatro horas mágicas.',
    icon: 'coffee',
    isCompleted: true,
  },
  {
    id: 'm-2',
    date: '02 Noviembre 2024',
    title: 'Nuestro Primer Beso',
    description: 'Bajo la llovizna suave de otoño, el mundo entero guardó silencio.',
    icon: 'favorite',
    isCompleted: true,
  },
  {
    id: 'm-3',
    date: '15 Febrero 2025',
    title: 'Nuestra Primera Escapada',
    description: 'Un fin de semana en las montañas con chimenea encendida y chocolate caliente.',
    icon: 'landscape',
    isCompleted: true,
  },
  {
    id: 'm-4',
    date: '17 Octubre 2025',
    title: 'Primer Aniversario (365 Días)',
    description: 'Celebramos un año completo construyendo el amor más puro y sólido.',
    icon: 'cake',
    isCompleted: true,
  },
  {
    id: 'm-5',
    date: '17 Octubre 2026',
    title: 'Dos Años Juntos (730 Días)',
    description: 'El hito dorado de hoy. 17,520 horas eligiéndonos sin titubear.',
    icon: 'stars',
    isCompleted: true,
  },
  {
    id: 'm-6',
    date: '20 Noviembre 2026',
    title: 'Próxima Gran Aventura',
    description: 'Nuestro viaje soñado a la costa y una cena privada frente al mar.',
    icon: 'flight_takeoff',
    isCompleted: false,
  },
];

export const initialBucketList: BucketItem[] = [
  { id: 'b-1', title: 'Ver el atardecer desde un velero en altamar', category: 'viajes', completed: true },
  { id: 'b-2', title: 'Cena a la luz de las velas sin teléfonos móviles', category: 'experiencias', completed: true },
  { id: 'b-3', title: 'Aprender a cocinar juntos un platillo italiano desde cero', category: 'cotidiano', completed: true },
  { id: 'b-4', title: 'Dormir bajo las estrellas en una cabaña de cristal', category: 'viajes', completed: false },
  { id: 'b-5', title: 'Perdernos en una librería antigua buscando libros para el otro', category: 'experiencias', completed: false },
  { id: 'b-6', title: 'Sembrar un árbol que crezca a la par de nuestro amor', category: 'cotidiano', completed: false },
  { id: 'b-7', title: 'Hacer un viaje por carretera sin destino fijo por un fin de semana', category: 'viajes', completed: false },
];
