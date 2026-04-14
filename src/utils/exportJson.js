/**
 * Convertit l'état du store en JSON iOS.
 * Retourne { ok: true, json } ou { ok: false, errors: string[] }
 */
export function exportStory(meta, startNodeId, rfNodes) {
  const errors = []

  if (!startNodeId) errors.push('Aucun nœud de départ défini.')
  if (rfNodes.length === 0) errors.push("L'histoire ne contient aucun nœud.")

  // Vérifier les choix sans cible
  for (const node of rfNodes) {
    for (let i = 0; i < node.data.choices.length; i++) {
      const c = node.data.choices[i]
      if (!c.targetNodeId) {
        errors.push(`Nœud ${node.id} — Choix ${i + 1} : cible manquante.`)
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  const nodes = rfNodes.map((n) => ({
    nodeId: n.id,
    type: n.data.storyType,
    text: n.data.text ?? '',
    delay: n.data.delay ?? null,
    choices: (n.data.choices ?? []).map((c) => ({
      text: c.text ?? '',
      targetNodeId: c.targetNodeId,
      condition: c.condition ?? null,
      effects: c.effects ?? [],
    })),
  }))

  const output = {
    meta: {
      title: meta.title,
      author: meta.author,
      version: meta.version,
      language: meta.language,
      defaultDelay: meta.defaultDelay,
      timeoutThreshold: meta.timeoutThreshold,
    },
    startNodeId,
    nodes,
  }

  return { ok: true, json: JSON.stringify(output, null, 2) }
}

export function downloadJson(json, filename = 'story.json') {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
