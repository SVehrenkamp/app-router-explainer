// The Boundary Explorer's engine: a pure simulation of what 'use client'
// placement does to a component tree. No compilation — the model captures the
// three things that matter: where async server work happens, where hooks are
// used, and which props cross the boundary. kb figures approximate shipped
// client JS per component (anchored to the journey's measured bundles).
export type BoundaryNode = {
  id: string
  name: string
  nature: 'async-server' | 'hooks' | 'neutral'
  kb: number
  props?: { name: string; serializable: boolean }[]
  children?: BoundaryNode[]
}

export type Violation = {
  nodeId: string
  kind: 'async-under-client' | 'hooks-outside-client' | 'non-serializable-prop'
  message: string
}

export type SimResult = { clientIds: Set<string>; clientKB: number; violations: Violation[] }

export function simulateBoundary(root: BoundaryNode, clientRoots: Set<string>): SimResult {
  const clientIds = new Set<string>()
  const violations: Violation[] = []
  let clientKB = 0

  const walk = (node: BoundaryNode, parentIsClient: boolean) => {
    const isClient = parentIsClient || clientRoots.has(node.id)
    if (isClient) {
      clientIds.add(node.id)
      clientKB += node.kb
      if (node.nature === 'async-server') {
        violations.push({
          nodeId: node.id,
          kind: 'async-under-client',
          message: `${node.name} is an async server component — it cannot render under a client boundary. Fetch above the boundary and pass data down, or keep it server-side as a child.`,
        })
      }
      if (!parentIsClient) {
        for (const prop of node.props ?? []) {
          if (!prop.serializable) {
            violations.push({
              nodeId: node.id,
              kind: 'non-serializable-prop',
              message: `${node.name} receives '${prop.name}' across the server→client boundary, but it is not serializable. Only JSON-safe values (and Server Actions) may cross.`,
            })
          }
        }
      }
    } else if (node.nature === 'hooks') {
      violations.push({
        nodeId: node.id,
        kind: 'hooks-outside-client',
        message: `${node.name} uses client hooks — it needs 'use client' on itself or an ancestor.`,
      })
    }
    for (const child of node.children ?? []) walk(child, isClient)
  }

  walk(root, false)
  return { clientIds, clientKB: Math.round(clientKB * 10) / 10, violations }
}
