import { Category } from '@/types/category';

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onToggleCategory: (categoryId: number) => void;
  onSelectAll: () => void;
  showAll?: boolean;
}

export function CategoryFilterBar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onSelectAll,
  showAll = true,
}: CategoryFilterBarProps) {
  const allSelected = categories.length > 0 && selectedCategoryIds.length === categories.length;
  const noneSelected = selectedCategoryIds.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* All Categories Button */}
        {showAll && (
          <button
            type="button"
            onClick={onSelectAll}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2
              ${allSelected || noneSelected
                ? 'border-purple-500 bg-purple-500/20 text-violet-950 dark:text-purple-200'
                : 'border-border bg-background/5 text-foreground dark:text-foreground/60 hover:border-border hover:bg-background/10'
              }
            `}
          >
            {allSelected || noneSelected ? '✓ All' : `All`}
          </button>
        )}

        {/* Individual Category Buttons */}
        {categories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id);
          const badgeColor = category.color || '#8B5CF6';

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggleCategory(category.id)}
              className={`
                relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2
                flex items-center gap-1.5
                ${isSelected
                  ? 'text-foreground shadow-lg'
                  : 'border-border bg-background/5 text-foreground dark:text-foreground/60 hover:border-border hover:bg-background/10'
                }
              `}
              style={{
                borderColor: isSelected ? badgeColor : undefined,
                backgroundColor: isSelected ? `${badgeColor}66` : undefined,
              }}
            >
              {category.icon && (
                <span className="text-sm">{category.icon}</span>
              )}
              {category.name}
              {isSelected && (
                <span className="text-[10px]">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected count indicator */}
      {!noneSelected && !allSelected && (
        <div className="text-xs text-foreground/85 dark:text-foreground/50">
          {selectedCategoryIds.length} of {categories.length} categories selected
        </div>
      )}
    </div>
  );
}
