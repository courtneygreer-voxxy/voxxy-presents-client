import { VendorContact } from '@/services/api';
import ContactRow from './ContactRow';

interface ContactsTableProps {
  contacts: VendorContact[];
  selectedContacts: number[];
  onSelectContact: (contactId: number) => void;
  onSelectAll: () => void;
  onDeleteContact: (contactId: number) => void;
  onEditContact: (contact: VendorContact) => void;
}

export default function ContactsTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onDeleteContact,
  onEditContact,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
          />
          <span className="text-xs font-medium text-white/60">
            {allSelected ? 'Deselect All' : 'Select All'}
          </span>
          <span className="text-xs text-white/40 ml-auto">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isSelected={selectedContacts.includes(contact.id)}
            onSelect={() => onSelectContact(contact.id)}
            onDelete={() => onDeleteContact(contact.id)}
            onEdit={() => onEditContact(contact)}
          />
        ))}
      </div>
    </div>
  );
}
