import { VendorContact } from '@/services/api';
import ContactRow from './ContactRow';
import Pagination from './Pagination';

interface ContactsTableProps {
  contacts: VendorContact[];
  selectedContacts: number[];
  onSelectContact: (contactId: number) => void;
  onSelectAll: () => void;
  onDeleteContact: (contactId: number) => void;
  onEditContact: (contact: VendorContact) => void;
  paginationMeta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
}

export default function ContactsTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onDeleteContact,
  onEditContact,
  paginationMeta,
  onPageChange,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

  return (
    <div className="voxxy-table-shell">
      {/* Table Header - Condensed view for all screen sizes */}
      <div className="voxxy-table-header">
        <div className="voxxy-table-header-row grid grid-cols-[28px,1fr,140px,120px,130px,100px,80px,1fr,70px] items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-3.5 h-3.5 rounded border-border bg-background/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
              title={allSelected ? 'Deselect all' : 'Select all'}
            />
          </div>
          <div>Name</div>
          <div>Business</div>
          <div>Location</div>
          <div>Phone</div>
          <div>Category</div>
          <div>Social</div>
          <div>Email</div>
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
  );
}
