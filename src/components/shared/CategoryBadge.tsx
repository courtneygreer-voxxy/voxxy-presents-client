import { Category } from '@/types/category';

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
          ${variant === 'default' ? 'bg-white/10 text-white/60' : 'border border-white/20 text-white/60'}
          ${onClick ? 'cursor-pointer hover:bg-white/20 transition-smooth' : ''}
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
        ${variant === 'default' ? 'text-white' : 'border text-white'}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-smooth' : ''}
        ${className}
      `}
      style={{
        backgroundColor: variant === 'default' ? badgeColor : 'transparent',
        borderColor: variant === 'outline' ? badgeColor : undefined,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.4)',
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
