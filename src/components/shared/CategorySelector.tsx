import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Category, CreateCategoryData } from '@/types/category';
import { CategoryBadge } from './CategoryBadge';

interface CategorySelectorProps {
  organizationId: number;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  mode?: 'single' | 'multi';
  allowCreate?: boolean;
  placeholder?: string;
  categories: Category[];
  onCreateCategory?: (data: CreateCategoryData) => Promise<Category>;
  disabled?: boolean;
}

export function CategorySelector({
  organizationId,
  selectedIds,
  onChange,
  mode = 'multi',
  allowCreate = true,
  placeholder = 'Select categories...',
  categories,
  onCreateCategory,
  disabled = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState('');

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected categories
  const selectedCategories = categories.filter((cat) =>
    selectedIds.includes(cat.id)
  );

  // Handle category selection
  const handleSelect = (categoryId: number) => {
    if (mode === 'single') {
      onChange([categoryId]);
      setIsOpen(false);
    } else {
      if (selectedIds.includes(categoryId)) {
        onChange(selectedIds.filter((id) => id !== categoryId));
      } else {
        onChange([...selectedIds, categoryId]);
      }
    }
    setSearchQuery('');
  };

  // Handle category removal
  const handleRemove = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== categoryId));
  };

  // Handle create new category
  const handleCreate = async () => {
    if (!newCategoryName.trim() || !onCreateCategory) return;

    setCreateError('');
    setIsCreating(true);

    try {
      const newCategory = await onCreateCategory({
        name: newCategoryName.trim(),
      });

      // Add to selection
      onChange([...selectedIds, newCategory.id]);
      setNewCategoryName('');
      setSearchQuery('');
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Selected Categories Display */}
      <div
        className={`
          min-h-[42px] px-3 py-2 rounded-lg border
          ${disabled ? 'bg-background/5 cursor-not-allowed' : 'voxxy-surface-elevated cursor-pointer hover:border-primary/50'}
          border-border transition-smooth
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <CategoryBadge
                key={category.id}
                category={category}
                size="sm"
                className="group"
              >
                <button
                  onClick={(e) => handleRemove(category.id, e)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </CategoryBadge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-foreground/40">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 voxxy-surface-elevated border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="voxxy-input-well w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              autoFocus
            />
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <div className="p-2">
                {filteredCategories.map((category) => {
                  const isSelected = selectedIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSelect(category.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-smooth
                        ${isSelected ? 'bg-primary/20 text-foreground' : 'text-foreground/70 hover:bg-background/5 hover:text-foreground'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={category} size="sm" />
                        {category.usage && (
                          <span className="text-xs text-foreground/40">
                            ({category.usage.applications_count} apps)
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-violet-700 dark:text-primary text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-foreground/40">
                No categories found
              </div>
            )}
          </div>

          {/* Create New Category */}
          {allowCreate && onCreateCategory && searchQuery && filteredCategories.length === 0 && (
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategoryName || searchQuery}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 voxxy-input-well rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newCategoryName.trim()}
                  className="px-4 py-2 voxxy-btn-solid disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-lg flex items-center gap-2 transition-smooth"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
              {createError && (
                <p className="text-xs text-red-400 mt-2">{createError}</p>
              )}
            </div>
          )}

          {/* Footer Info */}
          {mode === 'multi' && (
            <div className="px-3 py-2 bg-background/5 text-xs text-foreground/40">
              {selectedIds.length} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
