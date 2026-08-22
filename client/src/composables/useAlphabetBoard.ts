import { ref } from 'vue'

export type ActiveLetterData = {
  emoji: string
  word: string
  phonetic: string
}

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const LETTER_WORDS: Record<string, { emoji: string; word: string }[]> = {
  A: [
    { emoji: '🍎', word: 'Apple' },
    { emoji: '🐜', word: 'Ant' },
    { emoji: '✈️', word: 'Airplane' },
    { emoji: '🐊', word: 'Alligator' },
  ],
  B: [{ emoji: '🎈', word: 'Balloon' }, { emoji: '🐻', word: 'Bear' }],
  C: [{ emoji: '🐱', word: 'Cat' }, { emoji: '🚗', word: 'Car' }],
  D: [{ emoji: '🐶', word: 'Dog' }, { emoji: '🦆', word: 'Duck' }],
  E: [{ emoji: '🥚', word: 'Egg' }, { emoji: '🐘', word: 'Elephant' }],
  F: [{ emoji: '🐸', word: 'Frog' }, { emoji: '🐟', word: 'Fish' }],
  G: [{ emoji: '🍇', word: 'Grapes' }, { emoji: '🦒', word: 'Giraffe' }],
  H: [{ emoji: '🏠', word: 'House' }, { emoji: '🐴', word: 'Horse' }],
  I: [{ emoji: '🍦', word: 'Ice Cream' }, { emoji: '🦎', word: 'Iguana' }],
  J: [{ emoji: '🧃', word: 'Juice' }, { emoji: '🧩', word: 'Jigsaw' }],
  K: [{ emoji: '🔑', word: 'Key' }, { emoji: '🦘', word: 'Kangaroo' }],
  L: [{ emoji: '🦁', word: 'Lion' }, { emoji: '🍋', word: 'Lemon' }],
  M: [{ emoji: '🌙', word: 'Moon' }, { emoji: '🐵', word: 'Monkey' }],
  N: [{ emoji: '🥜', word: 'Nut' }, { emoji: '👃', word: 'Nose' }],
  O: [{ emoji: '🍊', word: 'Orange' }, { emoji: '🐙', word: 'Octopus' }],
  P: [{ emoji: '🐷', word: 'Pig' }, { emoji: '🍿', word: 'Popcorn' }],
  Q: [{ emoji: '👑', word: 'Queen' }, { emoji: '❓', word: 'Question' }],
  R: [{ emoji: '🌈', word: 'Rainbow' }, { emoji: '🐰', word: 'Rabbit' }],
  S: [{ emoji: '☀️', word: 'Sun' }, { emoji: '⭐', word: 'Star' }],
  T: [{ emoji: '🐯', word: 'Tiger' }, { emoji: '🌳', word: 'Tree' }],
  U: [{ emoji: '☂️', word: 'Umbrella' }, { emoji: '🦄', word: 'Unicorn' }],
  V: [{ emoji: '🎻', word: 'Violin' }, { emoji: '🌋', word: 'Volcano' }],
  W: [{ emoji: '🐋', word: 'Whale' }, { emoji: '👋', word: 'Wave' }],
  X: [{ emoji: '🎋', word: 'Xylophone' }],
  Y: [{ emoji: '🪀', word: 'Yoyo' }, { emoji: '🟡', word: 'Yellow' }],
  Z: [{ emoji: '🦓', word: 'Zebra' }],
}

const LETTER_PHONETICS: Record<string, string> = {
  A: '/ă/', B: '/b/', C: '/k/', D: '/d/', E: '/ĕ/', F: '/f/',
  G: '/g/', H: '/h/', I: '/ĭ/', J: '/j/', K: '/k/', L: '/l/',
  M: '/m/', N: '/n/', O: '/ŏ/', P: '/p/', Q: '/kw/', R: '/r/',
  S: '/s/', T: '/t/', U: '/ŭ/', V: '/v/', W: '/w/', X: '/ks/',
  Y: '/y/', Z: '/z/',
}

export function useAlphabetBoard() {
  const boardOpen = ref(false)
  const boardTab = ref<'alphabet' | 'numbers'>('alphabet')
  const activeLetter = ref<string | null>(null)
  const activeLetterData = ref<ActiveLetterData | null>(null)
  const activeNumber = ref<number | null>(null)

  function openBoard() {
    boardOpen.value = true
  }
  function closeBoard() {
    boardOpen.value = false
    activeLetter.value = null
    activeLetterData.value = null
    activeNumber.value = null
  }
  function switchTab(tab: 'alphabet' | 'numbers') {
    boardTab.value = tab
  }
  function pickLetter(letter: string) {
    const options = LETTER_WORDS[letter] ?? [{ emoji: '❓', word: letter }]
    const choice = options[Math.floor(Math.random() * options.length)]
    activeLetter.value = letter
    activeLetterData.value = choice ? { ...choice, phonetic: LETTER_PHONETICS[letter] ?? '' } : null
  }
  function pickNumber(n: number) {
    activeNumber.value = n
  }

  return {
    ALPHABET,
    activeLetter,
    activeLetterData,
    activeNumber,
    boardOpen,
    boardTab,
    closeBoard,
    openBoard,
    pickLetter,
    pickNumber,
    switchTab,
  }
}
