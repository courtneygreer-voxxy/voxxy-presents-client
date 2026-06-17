import type { MessageParams } from './index'

export const networkCatalog = {
  'network.deleteContactFailed': 'Failed to delete contact.',
  'network.bulkDeleteSuccess': (p: MessageParams) => {
    const count = Number(p.count ?? 0)
    return `Successfully deleted ${count} contact${count === 1 ? '' : 's'}`
  },
  'network.bulkDeleteFailed': 'Failed to delete contacts.',
  'network.bulkUpdateSuccess': (p: MessageParams) => {
    const count = Number(p.count ?? 0)
    return `Successfully updated ${count} contact${count === 1 ? '' : 's'}`
  },
  'network.bulkUpdateFailed': 'Failed to update contacts.',
  'network.bulkLocationUpdateFailed': 'Failed to update location.',
  'network.categoryNameRequired': 'Category name is required.',
  'network.saveCategoryFailed': 'Failed to save category.',
  'network.deleteCategoryBlocked': (p: MessageParams) =>
    `Cannot delete this category. It is currently being used by:\n\n${p.usageDetails}\n\nPlease remove these associations first.`,
  'network.deleteCategoryFailed': 'Failed to delete category.',
  'network.saveListFailed': 'Failed to save list.',
  'network.createListFailed': 'Failed to create list.',
  'network.bulkAddToListSuccess': (p: MessageParams) => {
    const count = Number(p.count ?? 0)
    return `Added ${count} contact${count === 1 ? '' : 's'} to "${p.listName}"`
  },
  'network.bulkApplyListSuccess': (p: MessageParams) => {
    const count = Number(p.count ?? 0)
    return `Applied ${p.applied} from "${p.listName}" to ${count} contact${count === 1 ? '' : 's'}`
  },
  'network.bulkApplyListNoFilters': (p: MessageParams) =>
    `"${p.listName}" has no filters to apply. Edit the list on the Lists tab first.`,
  'network.bulkAddToListFailed': 'Failed to add contacts to list.',
} as const satisfies Record<string, string | ((params: MessageParams) => string)>
