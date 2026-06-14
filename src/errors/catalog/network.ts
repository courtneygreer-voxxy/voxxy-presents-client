import type { MessageParams } from './index'

export const networkCatalog = {
  'network.deleteContactFailed': 'Failed to delete contact.',
  'network.bulkDeleteSuccess': (p: MessageParams) =>
    `Successfully deleted ${p.count} contacts`,
  'network.bulkDeleteFailed': 'Failed to delete contacts.',
  'network.bulkUpdateSuccess': (p: MessageParams) =>
    `Successfully updated ${p.count} contacts`,
  'network.bulkUpdateFailed': 'Failed to update contacts.',
  'network.bulkLocationUpdateFailed': 'Failed to update location.',
  'network.categoryNameRequired': 'Category name is required.',
  'network.saveCategoryFailed': 'Failed to save category.',
  'network.deleteCategoryBlocked': (p: MessageParams) =>
    `Cannot delete this category. It is currently being used by:\n\n${p.usageDetails}\n\nPlease remove these associations first.`,
  'network.deleteCategoryFailed': 'Failed to delete category.',
  'network.saveListFailed': 'Failed to save list.',
  'network.createListFailed': 'Failed to create list.',
} as const satisfies Record<string, string | ((params: MessageParams) => string)>
