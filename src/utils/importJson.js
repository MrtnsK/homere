/**
 * Parse et valide un JSON story iOS.
 * Retourne { ok: true, data } ou { ok: false, error: string }
 */
export function parseImportedJson(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'JSON invalide : impossible de le parser.' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Le fichier ne contient pas un objet JSON valide.' }
  }

  if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    return { ok: false, error: 'Le JSON ne contient pas de tableau "nodes".' }
  }

  if (!parsed.startNodeId) {
    return { ok: false, error: 'Le champ "startNodeId" est manquant.' }
  }

  // Validation légère des nœuds
  for (const node of parsed.nodes) {
    if (!node.nodeId) return { ok: false, error: `Un nœud est sans "nodeId".` }
  }

  return { ok: true, data: parsed }
}
