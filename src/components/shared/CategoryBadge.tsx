import { Category } from '@/types/category';
import { getCategorySequenceBadgeStyle } from '@/lib/categoryBadgeStyles';

interface CategoryBadgeProps {
  category: Category | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function CategoryBadge({
  category,
  size = 'md',
  variant = 'default',
  showIcon = false,
  onClick,
  className = '',
  children,
}: CategoryBadgeProps) {
  // If no category, show "All Categories" badge
  if (!category) {
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-md font-medium
          ${size === 'sm' ? 'px-2 py-0.5 text-xs' : ''}
          ${size === 'md' ? 'px-2.5 py-1 text-sm' : ''}
          ${size === 'lg' ? 'px-3 py-1.5 text-base' : ''}
          ${variant === 'default' ? 'bg-background/10 text-foreground/60' : 'border border-border text-foreground/60'}
          ${onClick ? 'cursor-pointer hover:bg-background/20 transition-smooth' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        All Categories
      </span>
    );
  }

  // Get badge color from category or use default
  const badgeColor = category.color || '#8B5CF6'; // Default purple

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-md font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : ''}
        ${size === 'md' ? 'px-2.5 py-1 text-sm' : ''}
        ${size === 'lg' ? 'px-3 py-1.5 text-base' : ''}
        ${variant === 'default' ? 'category-sequence-badge' : 'border text-foreground'}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-smooth' : ''}
        ${className}
      `}
      style={{
        ...(variant === 'default'
          ? getCategorySequenceBadgeStyle(badgeColor)
          : { color: badgeColor }),
        borderColor: variant === 'outline' ? badgeColor : undefined,
      }}
      onClick={onClick}
    >
      {showIcon && category.icon && (
        <span className="text-current">{category.icon}</span>
      )}
      {category.name}
      {children}
    </span>
  );
}
