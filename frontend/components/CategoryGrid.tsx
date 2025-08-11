import { Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '~backend/listing/types';

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: number) => void;
}

export default function CategoryGrid({ categories, onCategorySelect }: CategoryGridProps) {
  const getIconComponent = (iconName?: string) => {
    // For now, we'll use a default icon. In a real app, you'd map icon names to components
    return Grid3X3;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const IconComponent = getIconComponent(category.icon);
        return (
          <Card
            key={category.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                {category.name_kirundi && (
                  <p className="text-sm text-gray-500">{category.name_kirundi}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
