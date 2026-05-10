export interface Asset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  preview: string;
  category: 'Primitive' | 'Mockup';
  source: string;
}
