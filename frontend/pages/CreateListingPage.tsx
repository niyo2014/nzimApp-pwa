import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'BIF',
    category_id: '',
    vendor_id: '',
    listing_type: 'offering' as 'offering' | 'wanted',
    contact_hidden: false,
    duration_days: '30',
    images: [] as string[]
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => backend.listing.listCategories()
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => backend.vendor.listVendors({})
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        currency: formData.currency,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        vendor_id: parseInt(formData.vendor_id),
        listing_type: formData.listing_type,
        contact_hidden: formData.contact_hidden,
        duration_days: parseInt(formData.duration_days),
        images: formData.images.length > 0 ? formData.images : undefined
      };
      
      return await backend.listing.createListing(payload);
    },
    onSuccess: (listing) => {
      toast({
        title: "Listing created!",
        description: "Your listing has been successfully created."
      });
      navigate(`/listing/${listing.id}`);
    },
    onError: (error) => {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.vendor_id || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate();
  };

  const handleImageAdd = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Listing</h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listing Type */}
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select 
                  value={formData.listing_type} 
                  onValueChange={(value: 'offering' | 'wanted') => 
                    setFormData(prev => ({ ...prev, listing_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offering">Offering (I'm selling)</SelectItem>
                    <SelectItem value="wanted">Wanted (I'm looking for)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select 
                  value={formData.vendor_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name} ({vendor.vendor_type})
                        {vendor.gallery_name && ` - ${vendor.gallery_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={formData.listing_type === 'wanted' ? 'What are you looking for?' : 'What are you selling?'}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide more details about your listing..."
                  rows={4}
                />
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {formData.listing_type === 'wanted' ? 'Budget' : 'Price'} *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIF">BIF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="space-y-4">
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageAdd}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <p className="text-xs text-gray-500">
                    Basic plan allows up to 3 images. Upgrade for more.
                  </p>
                </div>
              </div>

              {/* Contact Hidden */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="contact-hidden"
                  checked={formData.contact_hidden}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, contact_hidden: checked }))
                  }
                />
                <Label htmlFor="contact-hidden">
                  Hide contact information (buyers pay to reveal)
                </Label>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Listing'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
