// Compare public IDs before replacing the current snapshot. Never log private rows.
export function checkRemovedProducts(previous, next, approvedRemovedIds = []) {
  if (!Array.isArray(approvedRemovedIds) || approvedRemovedIds.some(id => typeof id !== 'string') || new Set(approvedRemovedIds).size !== approvedRemovedIds.length) {
    throw new Error('Removal approval must be an array of unique public IDs');
  }
  const nextIds = new Set(next.products.map(p => p.id));
  const removed = previous.products.map(p => p.id).filter(id => !nextIds.has(id));
  const approved = new Set(approvedRemovedIds);
  if (removed.some(id => !approved.has(id)) || approvedRemovedIds.some(id => !removed.includes(id))) {
    throw new Error(`Catalogue removals require exact reviewed IDs; removed: ${removed.join(', ') || '(none)'}`);
  }
  return removed;
}
