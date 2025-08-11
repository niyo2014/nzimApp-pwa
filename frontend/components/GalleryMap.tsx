import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Gallery } from '~backend/listing/types';

interface GalleryMapProps {
  galleries: Gallery[];
}

export default function GalleryMap({ galleries }: GalleryMapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Gallery Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Interactive map coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            For now, browse galleries in the list below.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
