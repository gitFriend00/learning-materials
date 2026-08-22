// src/stores/stickerJar.ts
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'

export interface StickerItem {
  id: string
  emoji: string
  x: number   // % left, relative to the jar's glass area
  y: number   // % top, relative to the jar's glass area
  rot: number // small tilt in degrees, for a hand-placed feel
}

export interface StudentRecord {
  id: string
  name: string
  items: StickerItem[]
}

export const GRID_COLUMNS = 5
export const GRID_ROWS = 7
const USABLE_LEFT = 12
const USABLE_RIGHT = 88
const USABLE_TOP = 30 // Adjusted to prevent stickers from hitting the face
const USABLE_BOTTOM = 88 // Adjusted to prevent stickers hiding behind the desk

export interface SlotPosition {
  x: number
  y: number
  rot: number
}

export function computeSlotPosition(index: number): SlotPosition {
  const col = index % GRID_COLUMNS
  const row = Math.floor(index / GRID_COLUMNS) % GRID_ROWS
  const colWidth = (USABLE_RIGHT - USABLE_LEFT) / GRID_COLUMNS
  const rowHeight = (USABLE_BOTTOM - USABLE_TOP) / GRID_ROWS

  const jitterX = (Math.random() - 0.5) * colWidth * 0.3
  const jitterY = (Math.random() - 0.5) * rowHeight * 0.3

  return {
    x: USABLE_LEFT + (col + 0.5) * colWidth + jitterX,
    y: USABLE_BOTTOM - (row + 0.5) * rowHeight + jitterY,
    rot: -8 + Math.random() * 16,
  }
}

const STUDENTS_COLLECTION = 'students'

export const useStickerJarStore = defineStore('stickerJar', {
  state: () => ({
    students: [] as StudentRecord[],
    currentStudentId: '' as string,
    loading: false,
    saving: false,
    loaded: false,
  }),
  getters: {
    currentStudent(state): StudentRecord | undefined {
      return state.students.find((s) => s.id === state.currentStudentId)
    },

    items(): StickerItem[] {
      return this.currentStudent?.items ?? []
    },
    count(): number {
      return this.items.length
    },
    studentName(): string {
      return this.currentStudent?.name ?? ''
    },
  },
  actions: {
    // Pulls every student + their saved stickers from Firestore.
    async fetchStudents() {
      this.loading = true
      try {
        const q = query(collection(db, STUDENTS_COLLECTION), orderBy('name'))
        const snap = await getDocs(q)
        this.students = snap.docs.map((d) => {
          const data = d.data() as { name?: string; items?: StickerItem[] }
          return {
            id: d.id,
            name: data.name ?? 'Student',
            items: Array.isArray(data.items) ? data.items : [],
          }
        })

        if (!this.students.find((s) => s.id === this.currentStudentId)) {
          this.currentStudentId = this.students[0]?.id ?? ''
        }
      } finally {
        this.loading = false
        this.loaded = true
      }
    },


    async addStudent(name: string): Promise<{ id: string; isNew: boolean }> {
      const trimmed = name.trim()
      if (!trimmed) return { id: '', isNew: false }

      const existing = this.students.find(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
      )
      if (existing) {
        this.currentStudentId = existing.id
        return { id: existing.id, isNew: false }
      }

      const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
        name: trimmed,
        items: [] as StickerItem[],
      })
      this.students.push({ id: docRef.id, name: trimmed, items: [] })
      this.students.sort((a, b) => a.name.localeCompare(b.name))
      this.currentStudentId = docRef.id
      return { id: docRef.id, isNew: true }
    },

    selectStudent(id: string) {
      if (this.students.find((s) => s.id === id)) {
        this.currentStudentId = id
      }
    },

    // Pushes the current student's sticker list up to Firestore.
    async persistCurrentItems() {
      const student = this.currentStudent
      if (!student) return
      this.saving = true
      try {
        await updateDoc(doc(db, STUDENTS_COLLECTION, student.id), {
          items: student.items,
        })
      } finally {
        this.saving = false
      }
    },

    addSticker(emoji: string, pos?: SlotPosition) {
      const student = this.currentStudent
      if (!student) return
      const slot = pos ?? computeSlotPosition(student.items.length)
      student.items.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        ...slot,
      })
      void this.persistCurrentItems()
    },

    emptyJar() {
      const student = this.currentStudent
      if (!student) return
      student.items = []
      void this.persistCurrentItems()
    },


    async deleteStudent(id: string) {
      const idx = this.students.findIndex((s) => s.id === id)
      if (idx === -1) return

      const [removed] = this.students.splice(idx, 1)
      if (this.currentStudentId === id) {
        this.currentStudentId = this.students[0]?.id ?? ''
      }

      try {
        await deleteDoc(doc(db, STUDENTS_COLLECTION, id))
      } catch (err) {
        // Roll back local state if the delete didn't actually persist.
        if (removed) {
          this.students.splice(idx, 0, removed)
        }
        throw err
      }
    },
  },

  persist: true,
})