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
                ? 'border-primary bg-primary/20 text-violet-950 dark:text-primary shadow-sm'
                : 'border-border/80 bg-card/80 dark:bg-card/40 text-foreground dark:text-foreground/70 hover:border-primary/40 hover:bg-primary/10 shadow-sm'
              }
            `}
          >
            {allSelected || noneSelected ? '✓ All' : `All`}
          </button>
        )}

        {/* Individual Category Buttons */}
        {categories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id);
          const badgeColor = category.color || '#9054e3';

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggleCategory(category.id)}
              className={`
                relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2
                flex items-center gap-1.5
                ${isSelected
                  ? 'text-foreground shadow-md'
                  : 'border-border/80 bg-card/80 dark:bg-card/40 text-foreground dark:text-foreground/70 hover:border-primary/40 hover:bg-primary/10 shadow-sm'
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
