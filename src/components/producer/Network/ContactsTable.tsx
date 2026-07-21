import { VendorContact } from '@/services/api'
import ContactRow from './ContactRow'
import Pagination from './Pagination'
import { TableSortHeader, type SortOrder } from '@/components/shared/TableSortHeader'
import { TABLE_HEADER_CLASSES } from '@/components/shared/tableStyles'

type SortField = 'last_name' | 'first_name' | 'email' | null

interface ContactsTableProps {
  contacts: VendorContact[]
  selectedContacts: number[]
  onSelectContact: (contactId: number) => void
  onSelectAll: () => void
  onDeleteContact: (contactId: number) => void
  onEditContact: (contact: VendorContact) => void
  onViewContact: (contact: VendorContact) => void
  paginationMeta: {
    current_page: number
    per_page: number
    total_count: number
    total_pages: number
  }
  onPageChange: (page: number) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSort?: (field: SortField) => void
}

export default function ContactsTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onDeleteContact,
  onEditContact,
  onViewContact,
  paginationMeta,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length

  return (
    <div className="voxxy-table-shell">
      {/* Table Header */}
      <div className="voxxy-table-header">
        <div className={`voxxy-table-header-row grid grid-cols-[28px,minmax(80px,0.8fr),minmax(90px,1fr),minmax(110px,1.2fr),minmax(90px,1fr),90px,90px,80px,60px,minmax(70px,0.8fr),50px] px-2 py-1 ${TABLE_HEADER_CLASSES}`}>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
              title={allSelected ? 'Deselect all' : 'Select all'}
            />
          </div>
          <div>
            <TableSortHeader label="First Name" field="first_name" currentSort={sortField} currentOrder={sortOrder} onSort={onSort} />
          </div>
          <div>
            <TableSortHeader label="Last Name" field="last_name" currentSort={sortField} currentOrder={sortOrder} onSort={onSort} />
          </div>
          <div>
            <TableSortHeader label="Email" field="email" currentSort={sortField} currentOrder={sortOrder} onSort={onSort} />
          </div>
          <div>Affiliation</div>
          <div>Location</div>
          <div>Phone</div>
          <div>Category</div>
          <div>Social</div>
          <div>Tags</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {contacts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">No contacts found</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isSelected={selectedContacts.includes(contact.id)}
              onSelect={() => onSelectContact(contact.id)}
              onDelete={() => onDeleteContact(contact.id)}
              onEdit={() => onEditContact(contact)}
              onView={() => onViewContact(contact)}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={paginationMeta.current_page}
        totalPages={paginationMeta.total_pages}
        totalCount={paginationMeta.total_count}
        perPage={paginationMeta.per_page}
        onPageChange={onPageChange}
      />
    </div>
  )
}
