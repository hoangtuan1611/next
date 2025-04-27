import { create } from 'zustand'

type SelectionState = {
  selectedIds: number[]
  isDeletable: boolean
  setSelectedIds: (ids: number[]) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  isDeletable: false,
  setSelectedIds: (ids) =>
    set({
      selectedIds: ids,
      isDeletable: ids.length > 0,
    }),
}))
