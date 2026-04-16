import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { DEFAULT_META, makeNewNode, makeNewChoice, makeNodeId } from '../constants/defaults'

// Construit les arêtes RF depuis les nœuds (source de vérité = choices dans les nodes)
function buildEdgesFromNodes(nodes) {
  const edges = []
  for (const node of nodes) {
    const choices = node.data?.choices ?? []
    choices.forEach((choice, index) => {
      if (choice.targetNodeId) {
        edges.push({
          id: `e-${node.id}-${choice.targetNodeId}-${index}`,
          source: node.id,
          target: choice.targetNodeId,
          type: 'storyEdge',
          data: { choiceIndex: index, label: choice.text || '' },
        })
      }
    })
  }
  return edges
}

const initialNodeId = makeNodeId()
const initialNode = {
  id: initialNodeId,
  type: 'storyNode',
  position: { x: 300, y: 200 },
  data: {
    storyType: 'message',
    speaker: 'character',
    text: 'Il était une fois...',
    delay: null,
    choices: [],
  },
}

export const useStoryStore = create(
  persist(
    (set, get) => ({
      // --- Données histoire ---
      meta: { ...DEFAULT_META },
      startNodeId: initialNodeId,

      // --- React Flow ---
      rfNodes: [initialNode],
      rfEdges: [],

      // --- UI state (non persisté) ---
      selectedNodeId: null,
      isSettingsOpen: false,
      saveStatus: 'saved', // 'saved' | 'unsaved'

      // =====================
      // Actions React Flow
      // =====================

      onNodesChange: (changes) => {
        set((state) => ({
          rfNodes: applyNodeChanges(changes, state.rfNodes),
          saveStatus: 'unsaved',
        }))
      },

      onEdgesChange: (changes) => {
        // Quand une arête est supprimée, on supprime le choix correspondant
        const deletions = changes.filter((c) => c.type === 'remove')
        if (deletions.length > 0) {
          set((state) => {
            let nodes = state.rfNodes
            for (const change of deletions) {
              const edge = state.rfEdges.find((e) => e.id === change.id)
              if (!edge) continue
              nodes = nodes.map((node) => {
                if (node.id !== edge.source) return node
                const choiceIndex = edge.data?.choiceIndex ?? -1
                if (choiceIndex === -1) return node
                const choices = node.data.choices.filter((_, i) => i !== choiceIndex)
                return { ...node, data: { ...node.data, choices } }
              })
            }
            return {
              rfNodes: nodes,
              rfEdges: applyEdgeChanges(changes, state.rfEdges),
              saveStatus: 'unsaved',
            }
          })
        } else {
          set((state) => ({
            rfEdges: applyEdgeChanges(changes, state.rfEdges),
          }))
        }
      },

      onConnect: (connection) => {
        // Créer un nouveau choix dans le nœud source
        set((state) => {
          const sourceNode = state.rfNodes.find((n) => n.id === connection.source)
          if (!sourceNode) return {}

          const newChoice = makeNewChoice()
          newChoice.targetNodeId = connection.target

          const updatedChoices = [...(sourceNode.data.choices ?? []), newChoice]
          const choiceIndex = updatedChoices.length - 1

          const rfNodes = state.rfNodes.map((n) =>
            n.id === connection.source
              ? { ...n, data: { ...n.data, choices: updatedChoices } }
              : n
          )

          const newEdge = {
            id: `e-${connection.source}-${connection.target}-${choiceIndex}`,
            source: connection.source,
            target: connection.target,
            type: 'storyEdge',
            data: { choiceIndex, label: '' },
          }

          return {
            rfNodes,
            rfEdges: addEdge(newEdge, state.rfEdges),
            saveStatus: 'unsaved',
          }
        })
      },

      // =====================
      // Actions nœuds
      // =====================

      addNode: (position) => {
        const node = makeNewNode(position)
        set((state) => ({
          rfNodes: [...state.rfNodes, node],
          saveStatus: 'unsaved',
        }))
        return node.id
      },

      deleteNode: (nodeId) => {
        set((state) => {
          // Supprimer le nœud, ses arêtes, et les choix qui le ciblent
          const rfNodes = state.rfNodes
            .filter((n) => n.id !== nodeId)
            .map((n) => ({
              ...n,
              data: {
                ...n.data,
                choices: n.data.choices.filter((c) => c.targetNodeId !== nodeId),
              },
            }))
          const rfEdges = state.rfEdges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          )
          return {
            rfNodes,
            rfEdges,
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            startNodeId: state.startNodeId === nodeId ? (rfNodes[0]?.id ?? '') : state.startNodeId,
            saveStatus: 'unsaved',
          }
        })
      },

      updateNodeData: (nodeId, dataUpdate) => {
        set((state) => {
          const rfNodes = state.rfNodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdate } } : n
          )
          // Reconstruire les arêtes si les choices ont changé
          const rfEdges = buildEdgesFromNodes(rfNodes)
          return { rfNodes, rfEdges, saveStatus: 'unsaved' }
        })
      },

      duplicateNode: (nodeId) => {
        const state = get()
        const original = state.rfNodes.find((n) => n.id === nodeId)
        if (!original) return
        const newNode = {
          ...original,
          id: makeNodeId(),
          position: { x: original.position.x + 60, y: original.position.y + 60 },
          data: {
            ...original.data,
            choices: original.data.choices.map((c) => ({ ...c })),
          },
          selected: false,
        }
        set((s) => ({
          rfNodes: [...s.rfNodes, newNode],
          saveStatus: 'unsaved',
        }))
      },

      // =====================
      // Actions choix
      // =====================

      addChoice: (nodeId) => {
        set((state) => {
          const rfNodes = state.rfNodes.map((n) => {
            if (n.id !== nodeId) return n
            return {
              ...n,
              data: { ...n.data, choices: [...n.data.choices, makeNewChoice()] },
            }
          })
          return { rfNodes, saveStatus: 'unsaved' }
        })
      },

      updateChoice: (nodeId, choiceIndex, choiceUpdate) => {
        set((state) => {
          const rfNodes = state.rfNodes.map((n) => {
            if (n.id !== nodeId) return n
            const choices = n.data.choices.map((c, i) =>
              i === choiceIndex ? { ...c, ...choiceUpdate } : c
            )
            return { ...n, data: { ...n.data, choices } }
          })
          const rfEdges = buildEdgesFromNodes(rfNodes)
          return { rfNodes, rfEdges, saveStatus: 'unsaved' }
        })
      },

      deleteChoice: (nodeId, choiceIndex) => {
        set((state) => {
          const rfNodes = state.rfNodes.map((n) => {
            if (n.id !== nodeId) return n
            const choices = n.data.choices.filter((_, i) => i !== choiceIndex)
            return { ...n, data: { ...n.data, choices } }
          })
          const rfEdges = buildEdgesFromNodes(rfNodes)
          return { rfNodes, rfEdges, saveStatus: 'unsaved' }
        })
      },

      reorderChoices: (nodeId, fromIndex, toIndex) => {
        set((state) => {
          const rfNodes = state.rfNodes.map((n) => {
            if (n.id !== nodeId) return n
            const choices = [...n.data.choices]
            const [moved] = choices.splice(fromIndex, 1)
            choices.splice(toIndex, 0, moved)
            return { ...n, data: { ...n.data, choices } }
          })
          const rfEdges = buildEdgesFromNodes(rfNodes)
          return { rfNodes, rfEdges, saveStatus: 'unsaved' }
        })
      },

      // =====================
      // Actions meta
      // =====================

      updateMeta: (metaUpdate) => {
        set((state) => ({
          meta: { ...state.meta, ...metaUpdate },
          saveStatus: 'unsaved',
        }))
      },

      setStartNode: (nodeId) => {
        set({ startNodeId: nodeId, saveStatus: 'unsaved' })
      },

      // =====================
      // Actions UI
      // =====================

      setSelectedNode: (nodeId) => {
        set({ selectedNodeId: nodeId })
      },

      setSettingsOpen: (open) => {
        set({ isSettingsOpen: open })
      },

      setSaveStatus: (status) => {
        set({ saveStatus: status })
      },

      // =====================
      // Import
      // =====================

      importStory: (storyData) => {
        // storyData = objet JSON parsé selon le schéma iOS
        const { meta, startNodeId, nodes } = storyData

        // Auto-layout en grille si pas de positions
        const COLS = 4
        const GAP_X = 320
        const GAP_Y = 220
        const rfNodes = nodes.map((n, idx) => ({
          id: n.nodeId,
          type: 'storyNode',
          position: n._position ?? {
            x: (idx % COLS) * GAP_X + 100,
            y: Math.floor(idx / COLS) * GAP_Y + 100,
          },
          data: {
            storyType: n.type,
            speaker: n.speaker ?? 'character',
            text: n.text ?? '',
            delay: n.delay ?? null,
            choices: (n.choices ?? []).map((c) => ({
              text: c.text ?? '',
              targetNodeId: c.targetNodeId ?? '',
              condition: c.condition ?? null,
              effects: c.effects ?? [],
            })),
          },
        }))

        const rfEdges = buildEdgesFromNodes(rfNodes)

        set({
          meta: { ...DEFAULT_META, ...meta },
          startNodeId: startNodeId ?? rfNodes[0]?.id ?? '',
          rfNodes,
          rfEdges,
          selectedNodeId: null,
          saveStatus: 'unsaved',
        })
      },

      // Réinitialiser
      resetStory: () => {
        const id = makeNodeId()
        const node = {
          id,
          type: 'storyNode',
          position: { x: 300, y: 200 },
          data: { storyType: 'message', speaker: 'character', text: '', delay: null, choices: [] },
        }
        set({
          meta: { ...DEFAULT_META },
          startNodeId: id,
          rfNodes: [node],
          rfEdges: [],
          selectedNodeId: null,
          saveStatus: 'unsaved',
        })
      },
    }),
    {
      name: 'homere-story',
      // On persiste seulement les données, pas l'état UI
      partialize: (state) => ({
        meta: state.meta,
        startNodeId: state.startNodeId,
        rfNodes: state.rfNodes,
        rfEdges: state.rfEdges,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.saveStatus = 'saved'
      },
    }
  )
)
