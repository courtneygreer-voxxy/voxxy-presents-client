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
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header - Condensed view for all screen sizes */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
        <div className="grid grid-cols-[28px,1fr,130px,110px,120px,90px,70px,1fr,120px,60px] gap-2 px-2 py-1 items-center text-[10px] font-semibold text-white/70 uppercase tracking-wide">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
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
          <div>Tags</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {contacts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-white/50 text-sm">No contacts found</p>
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
