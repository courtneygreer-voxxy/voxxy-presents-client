import { VendorContact } from '@/services/api';
import ContactRow from './ContactRow';

interface ContactsTableProps {
  contacts: VendorContact[];
  selectedContacts: number[];
  onSelectContact: (contactId: number) => void;
  onSelectAll: () => void;
  onDeleteContact: (contactId: number) => void;
  onEditContact: (contact: VendorContact) => void;
  onToggleFeatured: (contactId: number) => void;
}

export default function ContactsTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onDeleteContact,
  onEditContact,
  onToggleFeatured,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
        <div className="grid grid-cols-[auto,180px,160px,140px,160px,140px,140px,100px,60px,60px,80px] gap-3 px-4 py-2 items-center text-xs font-semibold text-white/70 uppercase tracking-wide">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
              title={allSelected ? 'Deselect all' : 'Select all'}
            />
          </div>
          <div>Name</div>
          <div>Business</div>
          <div>Category</div>
          <div>Tags</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Location</div>
          <div>Social</div>
          <div className="text-center">Hist</div>
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
              onToggleFeatured={onToggleFeatured}
            />
          ))
        )}
      </div>

      {/* Footer with count */}
      {contacts.length > 0 && (
        <div className="bg-white/5 border-t border-white/10 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>
              Showing {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </span>
            {selectedContacts.length > 0 && (
              <span className="text-purple-400">
                {selectedContacts.length} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
