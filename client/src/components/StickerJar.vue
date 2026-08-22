<template>
  <div class="classroom-stage">
    <!-- ===== Classroom background ===== -->
    <div class="classroom-wall"></div>
    <div class="wall-trim"></div>

    <!-- Alphabet frieze strip, the classic banner of letters along a
         classroom wall -->
    <div class="alphabet-frieze" aria-hidden="true">
      <span v-for="letter in ALPHABET" :key="'frieze-' + letter" class="frieze-letter">{{ letter }}</span>
    </div>

    <!-- A plain framed classroom window (no sun/clouds — just glass) -->
    <div class="window"></div>

    <!-- Classroom wall clock, drawn entirely in CSS -->
    <div class="wall-clock" aria-hidden="true">
      <div class="clock-face">
        <span class="clock-hand hour"></span>
        <span class="clock-hand minute"></span>
        <span class="clock-center"></span>
      </div>
    </div>

    <!-- Classroom corkboard with a few pinned papers, drawn in CSS -->
    <div class="corkboard" aria-hidden="true">
      <span class="cork-paper p1"></span>
      <span class="cork-paper p2"></span>
      <span class="cork-paper p3"></span>
    </div>

    <!-- Top bar: banner + Menu button share one anchor line so they're
         always vertically centered/leveled with each other, regardless of
         screen size or content height. -->
    <div class="top-bar">
      <div class="welcome-banner">
        <span class="ribbon">Welcome to Teacher Sherly's Class</span>
      </div>
      <button type="button" class="drawer-toggle drawer-toggle-fixed" @click="openDrawer" aria-label="Open menu">
        ☰ Menu
      </button>
    </div>

    <div class="floor"></div>

    <!-- ===== Foreground Layout ===== -->
    <div class="content">
      
      <!-- ===== LEFT AREA: Blackboard, Teacher, and Kids ===== -->
      <div class="left-area">
        <div class="left-controls">
          <button type="button" class="roster-toggle" @click="openRoster" aria-label="Open my students list">
            <span class="control-icon">🧑‍🎓</span> My Students<span v-if="store.students.length" class="roster-count">{{ store.students.length }}</span>
          </button>
          <div class="counter-badge"><span class="control-icon">🍬</span> <span class="counter-count">{{ store.count }}</span> stickers</div>
        </div>

        <button type="button" class="chalkboard" @click="openBoard" aria-label="Open the big blackboard: alphabet and numbers">
          <div class="chalk-frame">
            <div class="chalk-title-row">
              <span class="chalk-title">{{ jarLabel }}</span>
            </div>
            <p class="chalk-sub"><span class="chalk-icon">🌟</span><span class="chalk-copy">Great job today!</span><span class="chalk-icon">🌟</span></p>
            <p class="chalk-tap"><span class="chalk-icon">👉</span><span class="chalk-copy">Tap the board for ABCs &amp; counting!</span></p>
          </div>
        </button>

        <div class="class-scene-left">
          <div class="teacher-zone">
            <div class="teacher-chair" aria-hidden="true"></div>
            <div class="teacher-figure" aria-hidden="true">
              <span class="t-hair"></span>
              <span class="t-head">
                <span class="t-eye l"></span>
                <span class="t-eye r"></span>
                <span class="t-cheek l"></span>
                <span class="t-cheek r"></span>
                <span class="t-mouth"></span>
              </span>
              <span class="t-body">
                <span class="t-arm l"></span>
                <span class="t-arm r"></span>
              </span>
            </div>
            <div class="desk-teacher"></div>
          </div>
          <div class="students-zone">
            <div class="student-chairs" aria-hidden="true">
              <span v-for="k in kids" :key="'chair-' + k.id" class="student-chair"></span>
            </div>
            <div class="students">
              <div
                v-for="k in kids"
                :key="k.id"
                class="kid-figure"
                :class="{ 'hand-raised': raisedStudentIds.has(k.id) }"
                aria-hidden="true"
                :style="{ '--kid-color': k.color, '--kid-hair': k.hair }"
              >
                <span class="k-hair"></span>
                <span class="k-head">
                  <span class="k-eye l"></span>
                  <span class="k-eye r"></span>
                  <span class="k-mouth"></span>
                </span>
                <span class="k-body">
                  <span class="k-arm"></span>
                </span>
              </div>
            </div>
            <div class="desk-students"></div>
          </div>
        </div>
      </div>

      <!-- ===== CENTER AREA: Jar and Counter ===== -->
      <div class="center-col">
        <div class="jar-scene">
          <div class="desk"></div>

          <div class="jar-wrap" :class="{ zoomed, celebrate: milestoneConfetti }">
            <div class="jar-ribbon">{{ jarLabel }}</div>
            <div class="jar-lid" @click.stop="onLidClick"></div>

            <div class="jar-body" @click.stop="onBodyClick">
              <div class="jar-bubbles" aria-hidden="true">
                <span class="bubble" v-for="n in 6" :key="'bubble-' + n"></span>
              </div>

              <div class="jar-face" aria-hidden="true">
                <span class="eye eye-l" :class="{ blink: eyesClosed }"></span>
                <span class="eye eye-r" :class="{ blink: eyesClosed }"></span>
                <span class="smile"></span>
                <span class="blush blush-l"></span>
                <span class="blush blush-r"></span>
              </div>

              <div class="stickers-layer">
                <transition-group name="sticker-pop" tag="div">
                  <div
                    v-for="(item, i) in store.items"
                    :key="item.id"
                    class="sticker"
                    :class="{ 'sticker-grid': zoomed }"
                    :style="stickerStyle(item, i)"
                    @click.stop="showJarTooltip(item.id)"
                  >
                    <span class="sticker-pop-inner">
                      <span class="sticker-emoji" :style="{ transform: zoomed ? 'rotate(0deg)' : `rotate(${item.rot}deg)` }">{{ item.emoji }}</span>
                      <span class="count-badge">{{ i + 1 }}</span>
                    </span>
                    <div class="tooltip-bubble jar-tip" :class="{ show: jarTooltip === item.id }">
                      {{ nameFor(item.emoji) }} · #{{ i + 1 }}
                    </div>
                  </div>
                </transition-group>

                <div
                  v-if="falling"
                  class="falling-sticker"
                  :style="{ left: falling.x + '%', top: falling.top + 'px' }"
                >{{ falling.emoji }}</div>
              </div>

              <div class="glass-shine"></div>
              <span class="jar-sparkle sp1">✨</span>
              <span class="jar-sparkle sp2">✨</span>
            </div>

            <div v-if="milestoneConfetti" class="confetti-burst" aria-hidden="true">
              <span class="confetti-piece" v-for="n in 16" :key="'confetti-' + n"></span>
            </div>
          </div>
        </div>

      </div>

      <!-- ===== RIGHT AREA: Shelves, Stickers, and Cleaning Supplies ===== -->
      <div class="right-area">
        <div class="shelf-unit">
          <div class="shelf shelf-1">
            <div class="supply-bin">
              <div class="chooser-heading">
                <div>
                  <span class="chooser-kicker">REWARD SHELF</span>
                  <div class="drawer-label">Choose a sticker</div>
                </div>
                <span v-if="selectedSticker" class="selected-sticker">{{ selectedSticker.emoji }} {{ selectedSticker.name }}</span>
                <span v-else class="selected-sticker empty">Pick one</span>
              </div>
              <div class="drawer">
                <div
                  class="sticker-slot"
                  v-for="(s, i) in STICKERS"
                  :key="s.emoji"
                  @mouseenter="showDrawerTooltip(i)"
                  @mouseleave="drawerTooltip = null"
                >
                  <button
                    type="button"
                    class="sticker-btn"
                    :class="{ selected: selectedIndex === i }"
                    :style="{ background: s.color + '33', color: s.color }"
                    :aria-label="'Choose ' + s.name"
                    @click="selectSticker(i)"
                  >
                    <span class="sticker-emoji">{{ s.emoji }}</span>
                    <span class="sticker-name">{{ s.name }}</span>
                  </button>
                  <div class="tooltip-bubble" :class="{ show: drawerTooltip === i }">{{ s.name }}</div>
                </div>
              </div>
              <button class="reset-btn" @click="onEmpty">Empty the jar 🧺</button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Zoom overlay elements kept inside the stage to fix z-index stacking issues -->
    <div class="zoom-backdrop" :class="{ show: zoomed }" @click="closeZoom"></div>
    <div class="zoom-caption" :class="{ show: zoomed }">{{ caption }}</div>
    <button class="close-zoom" :class="{ show: zoomed }" @click="closeZoom" aria-label="Close zoom">✕</button>

    <!-- ===== Big blackboard: alphabet + counting board ===== -->
    <div class="board-backdrop" :class="{ show: boardOpen }" @click="closeBoard"></div>
    <div class="board-panel" :class="{ show: boardOpen }" role="dialog" aria-modal="true" aria-label="Alphabet and numbers board">
      <button class="board-close" @click="closeBoard" aria-label="Close board">✕</button>

      <div class="board-heading">
        <span class="board-heading-mark">ABC</span>
        <div>
          <span class="board-kicker">TODAY'S LESSON</span>
          <h2>Letters &amp; Numbers</h2>
        </div>
      </div>

      <div class="board-tabs">
        <button class="tab-btn" :class="{ active: boardTab === 'alphabet' }" @click="switchTab('alphabet')">🔤 Alphabet</button>
        <button class="tab-btn" :class="{ active: boardTab === 'numbers' }" @click="switchTab('numbers')">🔢 Numbers</button>
      </div>

      <div v-if="boardTab === 'alphabet'" class="board-content">
        <div class="letter-grid">
          <button
            v-for="letter in ALPHABET"
            :key="letter"
            class="letter-btn"
            :class="{ active: activeLetter === letter }"
            @click="pickLetter(letter)"
          >{{ letter }}</button>
        </div>
        <transition name="pop-ease" mode="out-in">
          <div v-if="activeLetterData" :key="activeLetter + '-' + activeLetterData.word" class="reveal-card">
            <span class="reveal-emoji">{{ activeLetterData.emoji }}</span>
            <span class="reveal-word">{{ activeLetter }} is for {{ activeLetterData.word }}</span>
            <span class="phonetic-label">Sound: {{ activeLetterData.phonetic }}</span>
          </div>
          <div v-else key="placeholder-letter" class="reveal-card placeholder">Tap a letter to see what it's for! 🔠</div>
        </transition>
      </div>

      <div v-else class="board-content">
        <div class="number-grid">
          <button
            v-for="n in 10"
            :key="n"
            class="number-btn"
            :class="{ active: activeNumber === n }"
            @click="pickNumber(n)"
          >{{ n }}</button>
        </div>
        <transition name="pop-ease" mode="out-in">
          <div v-if="activeNumber" :key="'count-' + activeNumber" class="counting-card">
            <p class="counting-caption">Let's count to {{ activeNumber }}! 🍓</p>
            <div class="counting-materials">
              <span
                v-for="i in activeNumber"
                :key="i"
                class="counting-item"
                :style="{ animationDelay: (i * 0.05) + 's' }"
              >🍓</span>
            </div>
          </div>
          <div v-else key="placeholder-number" class="counting-card placeholder">Tap a number to count! 🔢</div>
        </transition>
      </div>
    </div>

    <!-- ===== My Students roster: add students, see + switch their jars ===== -->
    <div class="board-backdrop" :class="{ show: rosterOpen }" @click="closeRoster"></div>
    <div class="board-panel roster-panel" :class="{ show: rosterOpen }" role="dialog" aria-modal="true" aria-label="My students">
      <button class="board-close" @click="closeRoster" aria-label="Close students list">✕</button>

      <div class="roster-heading">
        <span class="roster-title-icon">🧑‍🎓</span>
        <div>
          <h2 class="roster-title">My Students</h2>
          <p class="roster-subtitle">Choose a student jar to open</p>
        </div>
      </div>

      <form class="roster-add-row" @submit.prevent="addStudentFromRoster">
        <input
          v-model="rosterNameDraft"
          class="roster-add-input"
          placeholder="Add a new student..."
          maxlength="18"
          aria-label="New student name"
        />
        <button type="submit" class="roster-add-btn">➕ Add</button>
      </form>

      <p v-if="store.loading" class="roster-empty">Loading your class...</p>
      <p v-else-if="!store.students.length" class="roster-empty">No students yet — add your first one above! 🌟</p>

      <ul v-else class="roster-list">
        <li v-for="s in store.students" :key="s.id" class="roster-item">
          <button
            type="button"
            class="roster-row"
            :class="{ active: s.id === store.currentStudentId }"
            @click="pickStudent(s.id)"
          >
            <span class="student-avatar" aria-hidden="true">{{ s.name.charAt(0).toUpperCase() }}</span>
            <span class="student-info">
              <span class="roster-name">{{ s.name }}</span>
              <span v-if="s.id === store.currentStudentId" class="roster-current">OPEN JAR</span>
            </span>
            <span class="roster-badge">🍬 {{ s.items.length }}</span>
            <span class="roster-stickers">
              <span v-for="it in s.items.slice(0, 8)" :key="it.id">{{ it.emoji }}</span>
              <span v-if="s.items.length > 8" class="roster-more">+{{ s.items.length - 8 }}</span>
              <span v-if="!s.items.length" class="roster-more">empty jar</span>
            </span>
          </button>
          <button
            type="button"
            class="roster-delete-btn"
            :aria-label="'Delete ' + s.name"
            :disabled="deletingId === s.id"
            @click.stop="handleDeleteStudent(s.id, s.name)"
          >{{ deletingId === s.id ? '…' : '✕' }}</button>
        </li>
      </ul>
    </div>

    <!-- ===== Account drawer: email up top, sign out pinned to the bottom ===== -->
    <div class="drawer-backdrop" :class="{ show: drawerOpen }" @click="closeDrawer"></div>
    <aside class="app-drawer" :class="{ show: drawerOpen }" role="dialog" aria-modal="true" aria-label="Account menu">
      <button class="drawer-close" @click="closeDrawer" aria-label="Close menu">✕</button>

      <span class="drawer-kicker">CLASSROOM MENU</span>
      <div class="drawer-header">
        <div class="drawer-avatar" aria-hidden="true">🧑‍🏫</div>
        <div class="drawer-account">
          <p class="drawer-account-label">Teacher account</p>
          <p class="drawer-email">{{ authStore.user?.email ?? 'Signed in' }}</p>
        </div>
      </div>

      <div class="drawer-spacer"></div>

      <button type="button" class="drawer-signout-btn" @click="handleSignOut" aria-label="Sign out">
        <span aria-hidden="true">🚪</span>
        <span>Sign Out</span>
      </button>
    </aside>

    <transition name="toast-fade">
      <div v-if="toastMsg" class="toast show">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStickerJarStore, computeSlotPosition } from '../stores/stickerJar'
import { useAuthStore } from '../stores/auth'
import { useAlphabetBoard } from '../composables/useAlphabetBoard'

const store = useStickerJarStore()
const authStore = useAuthStore()
const router = useRouter()

async function handleSignOut() {
  closeDrawer()
  await authStore.logout()
  router.replace({ name: 'Login' })
}

// ---------- account drawer (email + sign out) ----------
const drawerOpen = ref(false)
function openDrawer() {
  drawerOpen.value = true
}
function closeDrawer() {
  drawerOpen.value = false
}

// Load every student + their saved stickers from Firebase as soon as the
// jar mounts.
onMounted(() => {
  store.fetchStudents()
})

// Jar label follows whichever student is currently selected — this is
// read-only in the UI; it only changes when a student is added or switched
// via the roster.
const jarLabel = computed(() => {
  const name = store.studentName.trim()
  return name ? `${name}'s Jar` : "Student's Jar"
})

// ---------- adding / switching students (saved to Firebase) ----------
const rosterOpen = ref(false)
const rosterNameDraft = ref('')

function openRoster() {
  rosterNameDraft.value = ''
  rosterOpen.value = true
}
function closeRoster() {
  rosterOpen.value = false
}
async function addStudentFromRoster() {
  const name = rosterNameDraft.value.trim()
  if (!name) return
  const { isNew } = await store.addStudent(name)
  showToast(isNew ? `Welcome, ${name}! New jar saved 🎉` : `Switched to ${name}'s jar ✨`)
  rosterNameDraft.value = ''
}
function pickStudent(id: string) {
  const s = store.students.find((st) => st.id === id)
  store.selectStudent(id)
  if (s) showToast(`Now viewing ${s.name}'s jar 👀`)
  rosterOpen.value = false
}

// ---------- deleting a student ----------
const deletingId = ref<string | null>(null)
async function handleDeleteStudent(id: string, name: string) {
  if (deletingId.value) return
  const sure = window.confirm(`Delete ${name}'s jar? This can't be undone.`)
  if (!sure) return

  deletingId.value = id
  try {
    await store.deleteStudent(id)
    showToast(`${name}'s jar was deleted 🗑️`)
  } catch (err) {
    console.error(err)
    showToast("Couldn't delete that jar — try again")
  } finally {
    deletingId.value = null
  }
}

// ---------- friendly blinking jar face ----------
const eyesClosed = ref(false)
let blinkTimer: ReturnType<typeof setTimeout> | undefined
function scheduleBlink() {
  blinkTimer = setTimeout(() => {
    eyesClosed.value = true
    setTimeout(() => {
      eyesClosed.value = false
      scheduleBlink()
    }, 160)
  }, 2400 + Math.random() * 2200)
}
onMounted(scheduleBlink)
onUnmounted(() => {
  if (blinkTimer) clearTimeout(blinkTimer)
})

// ---------- CSS-drawn students + shelf decorations ----------
const kids = [
  { id: 1, color: '#ff9bc5', hair: '#5b3a29' },
  { id: 2, color: '#7fcbff', hair: '#2b2b2b' },
  { id: 3, color: '#ffd34d', hair: '#8a5a2b' },
]
const raisedStudentIds = ref<Set<number>>(new Set())
let handRaiseTimer: ReturnType<typeof setTimeout> | undefined

function chooseRaisedStudents() {
  const shuffled = [...kids].sort(() => Math.random() - 0.5)
  const raisedCount = Math.random() < 0.25 ? 2 : 1
  raisedStudentIds.value = new Set(shuffled.slice(0, raisedCount).map((kid) => kid.id))
  handRaiseTimer = setTimeout(chooseRaisedStudents, 2200 + Math.random() * 2600)
}

onMounted(chooseRaisedStudents)
onUnmounted(() => {
  if (handRaiseTimer) clearTimeout(handRaiseTimer)
})

// ---------- big blackboard: alphabet + numbers ----------
const {
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
} = useAlphabetBoard()

const STICKERS = [
  { emoji: '⭐', color: '#F2A93B', name: 'Star' },
  { emoji: '💖', color: '#FF6F91', name: 'Heart' },
  { emoji: '🌸', color: '#FF9BC5', name: 'Blossom' },
  { emoji: '🌈', color: '#63B6E8', name: 'Rainbow' },
  { emoji: '☀️', color: '#F2C230', name: 'Sunshine' },
  { emoji: '☁️', color: '#8FCBEA', name: 'Cloud' },
  { emoji: '🦄', color: '#C08CF0', name: 'Unicorn' },
  { emoji: '🐱', color: '#F0975E', name: 'Kitty' },
  { emoji: '🐶', color: '#B98352', name: 'Puppy' },
  { emoji: '🍭', color: '#F0699A', name: 'Lollipop' },
  { emoji: '🎈', color: '#5FCB8C', name: 'Balloon' },
  { emoji: '🦋', color: '#7E8FE8', name: 'Butterfly' },
  { emoji: '🍎', color: '#E4534B', name: 'Apple' },
  { emoji: '🚀', color: '#6E7FE0', name: 'Rocket' },
  { emoji: '🎨', color: '#E88CC7', name: 'Art' },
  { emoji: '🐢', color: '#6FBF7D', name: 'Turtle' },
  { emoji: '🍕', color: '#F2A33B', name: 'Pizza' },
  { emoji: '🎵', color: '#9B7FE0', name: 'Music Note' },
  { emoji: '🧩', color: '#4FB6C4', name: 'Puzzle' },
  { emoji: '🐬', color: '#4FA6D9', name: 'Dolphin' },
  { emoji: '🍀', color: '#4CAF6E', name: 'Clover' },
  { emoji: '🌻', color: '#F2C230', name: 'Sunflower' },
  { emoji: '🐳', color: '#5FA8D3', name: 'Whale' },
  { emoji: '🦊', color: '#E8934A', name: 'Fox' },
  { emoji: '🐝', color: '#F2C230', name: 'Bee' },
  { emoji: '🍓', color: '#E4534B', name: 'Strawberry' },
  { emoji: '🍩', color: '#D98A4F', name: 'Donut' },
  { emoji: '🧸', color: '#B98352', name: 'Teddy Bear' },
  { emoji: '🎉', color: '#E4633F', name: 'Party' },
  { emoji: '🏆', color: '#F2A93B', name: 'Trophy' },
  { emoji: '🎁', color: '#E4534B', name: 'Gift' },
  { emoji: '🧁', color: '#F0699A', name: 'Cupcake' },
  { emoji: '🐸', color: '#5CBF62', name: 'Frog' },
  { emoji: '🦉', color: '#B98352', name: 'Owl' },
  { emoji: '🌙', color: '#7E8FE8', name: 'Moon' },
  { emoji: '🍉', color: '#5FCB8C', name: 'Watermelon' },
  { emoji: '🚂', color: '#63B6E8', name: 'Train' },
  { emoji: '🐧', color: '#4A6C8C', name: 'Penguin' },
]

function nameFor(emoji: string): string {
  return STICKERS.find((s) => s.emoji === emoji)?.name ?? 'Sticker'
}

// ---------- selection + tooltips ----------
const selectedIndex = ref<number | null>(null)
const selectedSticker = computed(() => selectedIndex.value === null ? null : STICKERS[selectedIndex.value] ?? null)
const drawerTooltip = ref<number | null>(null)
const jarTooltip = ref<string | null>(null)
let drawerTooltipTimer: ReturnType<typeof setTimeout> | undefined
let jarTooltipTimer: ReturnType<typeof setTimeout> | undefined

function showDrawerTooltip(i: number) {
  drawerTooltip.value = i
  if (drawerTooltipTimer) clearTimeout(drawerTooltipTimer)
  drawerTooltipTimer = setTimeout(() => (drawerTooltip.value = null), 1400)
}

function showJarTooltip(id: string) {
  jarTooltip.value = id
  if (jarTooltipTimer) clearTimeout(jarTooltipTimer)
  jarTooltipTimer = setTimeout(() => (jarTooltip.value = null), 1400)
}

function selectSticker(i: number) {
  selectedIndex.value = i
  showDrawerTooltip(i)
  showToast('Sticker picked! Now tap the lid ✨')
}

// ---------- toast ----------
const toastMsg = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(msg: string) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastMsg.value = ''), 1600)
}

// ---------- jar geometry (must match the CSS below) ----------
// These track the .jar-body dimensions so stickers land inside the glass.
const JAR_BODY_TOP_PX = 60
const JAR_BODY_HEIGHT_PX = 590

// ---------- falling sticker animation ----------
const falling = ref<{ emoji: string; x: number; top: number } | null>(null)

// ---------- milestone celebration (confetti burst) ----------
const milestoneConfetti = ref(false)
let confettiTimer: ReturnType<typeof setTimeout> | undefined
function celebrateIfMilestone() {
  if (store.count > 0 && store.count % 5 === 0) {
    milestoneConfetti.value = true
    if (confettiTimer) clearTimeout(confettiTimer)
    confettiTimer = setTimeout(() => (milestoneConfetti.value = false), 1300)
  }
}

function onLidClick() {
  if (zoomed.value) return
  if (!store.currentStudentId) {
    showToast('Add or pick a student first! 🧑‍🎓')
    openRoster()
    return
  }
  if (selectedIndex.value === null) {
    showToast('Pick a sticker first! 👉')
    return
  }
  const s = STICKERS[selectedIndex.value]
  const slot = computeSlotPosition(store.items.length)
  
  if (!s) return;
  falling.value = { emoji: s.emoji, x: 50, top: 4 }

  requestAnimationFrame(() => {
    if (falling.value) {
      falling.value = {
        emoji: s.emoji,
        x: slot.x,
        top: JAR_BODY_TOP_PX + (slot.y / 100) * JAR_BODY_HEIGHT_PX,
      }
    }
  })

  setTimeout(() => {
    falling.value = null
    store.addSticker(s.emoji, slot)
    showToast(`Plop! 🎉 ${store.count} in the jar`)
    celebrateIfMilestone()
  }, 560)
}

// ---------- zoom / count mode ----------
const zoomed = ref(false)
const caption = ref('')

// When the jar is tapped to zoom in, the stickers' normal "hand placed"
// jitter positions (from computeSlotPosition) would still overlap and be
// hard to count. While zoomed we instead lay every sticker out on a neat,
// evenly-spaced grid in insertion order, left-to-right / top-to-bottom, so
// kids can count 1, 2, 3... without stickers clogging together.
function zoomedSlotPosition(index: number, total: number) {
  const cols = total <= 4 ? 2 : total <= 9 ? 3 : total <= 16 ? 4 : total <= 25 ? 5 : 6
  const rows = Math.max(1, Math.ceil(total / cols))
  const marginX = 15
  const marginY = 15
  const usableW = 100 - marginX * 2
  const usableH = 100 - marginY * 2
  const col = index % cols
  const row = Math.floor(index / cols)
  const colWidth = usableW / cols
  const rowHeight = usableH / rows
  return {
    x: marginX + (col + 0.5) * colWidth,
    y: marginY + (row + 0.5) * rowHeight,
  }
}

// Shrinks stickers a bit once there are a lot of them in the zoomed grid,
// so a full jar still reads clearly instead of feeling cramped.
function zoomedStickerSize(total: number): string {
  if (total <= 9) return '54px'
  if (total <= 16) return '44px'
  if (total <= 25) return '36px'
  return '30px'
}

function stickerStyle(item: { x: number; y: number }, index: number) {
  if (zoomed.value) {
    const pos = zoomedSlotPosition(index, store.items.length)
    return {
      left: pos.x + '%',
      top: pos.y + '%',
      fontSize: zoomedStickerSize(store.items.length),
    }
  }
  return { left: item.x + '%', top: item.y + '%' }
}

function onBodyClick() {
  if (zoomed.value) {
    closeZoom()
  } else {
    openZoom()
  }
}

function openZoom() {
  zoomed.value = true
  caption.value =
    store.count === 0
      ? "The jar is empty — let's fill it up!"
      : `Let's count! There ${store.count === 1 ? 'is 1 sticker' : `are ${store.count} stickers`}`
}

function closeZoom() {
  zoomed.value = false
}

function onEmpty() {
  if (store.count === 0) {
    showToast('Already empty!')
    return
  }
  store.emptyJar()
  showToast('Jar emptied! 🧺')
}
</script>

<style src="../styles/stickerjar.css" scoped></style>

