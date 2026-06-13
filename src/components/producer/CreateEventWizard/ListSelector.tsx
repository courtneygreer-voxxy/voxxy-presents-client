import { useState, useEffect } from 'react'
import { Filter, Users, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { contactListsApi, ContactList } from '@/services/api'

interface ListSelectorProps {
  organizationId: number
  selectedListIds: number[]
  onListsChange: (listIds: number[]) => void
}

export default function ListSelector({
  organizationId,
  selectedListIds,
  onListsChange,
}: ListSelectorProps) {
  const [lists, setLists] = useState<ContactList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    fetchLists()
  }, [organizationId])

  const fetchLists = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await contactListsApi.getAll(organizationId)
      setLists(response.contact_lists)
    } catch (err: any) {
      setError(err.message || 'Failed to load lists')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleList = (listId: number) => {
    const updated = selectedListIds.includes(listId)
      ? selectedListIds.filter((id) => id !== listId)
      : [...selectedListIds, listId]
    onListsChange(updated)
  }

  const handleSelectAll = () => {
    if (selectedListIds.length === lists.length) {
      onListsChange([])
    } else {
      onListsChange(lists.map((l) => l.id))
    }
  }

  // Calculate total unique contacts from selected lists
  const totalContactsFromLists = lists
    .filter((list) => selectedListIds.includes(list.id))
    .reduce((sum, list) => sum + list.contacts_count, 0)

  const selectedLists = lists.filter((list) => selectedListIds.includes(list.id))

  if (loading) {
    return (
      <div className="bg-background/5 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (lists.length === 0) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-200/80">
          You don't have any saved lists yet. Use the filters on the Network tab to create reusable
          lists for quickly selecting groups of contacts.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-background/5 rounded-lg border border-border">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Use Saved Lists</h3>
            <p className="text-xs text-foreground/50">
              {selectedListIds.length === 0
                ? 'Select lists to quickly add contacts'
                : `${selectedListIds.length} ${selectedListIds.length === 1 ? 'list' : 'lists'} selected • ~${totalContactsFromLists} contacts`}
            </p>
          </div>
        </div>
        <button className="text-foreground/60 hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Select All */}
          {lists.length > 1 && (
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs text-foreground/60">
                {lists.length} {lists.length === 1 ? 'list' : 'lists'} available
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-primary hover:text-primary/70 font-medium transition-colors"
              >
                {selectedListIds.length === lists.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}

          {/* Lists Grid */}
          <div className="space-y-2">
            {lists.map((list) => {
              const isSelected = selectedListIds.includes(list.id)
              return (
                <button
                  key={list.id}
                  onClick={() => handleToggleList(list.id)}
                  className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${
                      isSelected
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-background/5 border-border hover:bg-background/10 hover:border-border'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-primary/50 border-primary' : 'border-border'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-foreground" strokeWidth={3} />
                      )}
                    </div>

                    {/* List Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Filter className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {list.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-foreground/50">
                          <Users className="w-3 h-3" />
                          <span>
                            {list.contacts_count}{' '}
                            {list.contacts_count === 1 ? 'contact' : 'contacts'}
                          </span>
                        </div>

                        {list.description && (
                          <>
                            <span className="text-foreground/30">•</span>
                            <p className="text-xs text-foreground/50 truncate">
                              {list.description}
                            </p>
                          </>
                        )}
                      </div>

                      {/* List Filters Preview */}
                      {list.filters && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {list.filters.categories && list.filters.categories.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-background/10 text-foreground/60 rounded">
                              {list.filters.categories.length}{' '}
                              {list.filters.categories.length === 1 ? 'category' : 'categories'}
                            </span>
                          )}
                          {list.filters.locations && list.filters.locations.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-background/10 text-foreground/60 rounded">
                              {list.filters.locations.length}{' '}
                              {list.filters.locations.length === 1 ? 'location' : 'locations'}
                            </span>
                          )}
                          {list.filters.tags && list.filters.tags.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-background/10 text-foreground/60 rounded">
                              {list.filters.tags.length}{' '}
                              {list.filters.tags.length === 1 ? 'tag' : 'tags'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Summary */}
          {selectedLists.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-foreground/90">
                    Approximately{' '}
                    <strong className="text-foreground">{totalContactsFromLists}</strong> contacts
                    from {selectedLists.length} {selectedLists.length === 1 ? 'list' : 'lists'}
                  </span>
                </div>
                <p className="text-xs text-foreground/50 mt-1">
                  Note: Duplicates will be automatically removed
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
