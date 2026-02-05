 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useTenantId } from './useSupabaseData';
 import type { BlogPost } from '@/components/blog/BlogCard';
 
 interface UseBlogPostsOptions {
   limit?: number;
   category?: string;
 }
 
 export const useBlogPosts = (options?: UseBlogPostsOptions) => {
   const { data: tenantId } = useTenantId();
   
   return useQuery({
     queryKey: ['blog-posts', tenantId, options],
     queryFn: async () => {
       if (!tenantId) return [];
 
       let query = supabase
         .from('blog_posts')
         .select('*')
         .eq('tenant_id', tenantId)
         .eq('published', true)
         .order('published_at', { ascending: false, nullsFirst: false });
 
       if (options?.category) {
         query = query.eq('category', options.category);
       }
 
       if (options?.limit) {
         query = query.limit(options.limit);
       }
 
       const { data, error } = await query;
 
       if (error) {
         console.error('[useBlogPosts] Error fetching posts:', error);
         throw error;
       }
 
       return (data || []) as BlogPost[];
     },
     enabled: !!tenantId,
   });
 };
 
 export const useBlogPost = (slug: string) => {
   const { data: tenantId } = useTenantId();
   
   return useQuery({
     queryKey: ['blog-post', tenantId, slug],
     queryFn: async () => {
       if (!tenantId || !slug) return null;
 
       const { data, error } = await supabase
         .from('blog_posts')
         .select('*')
         .eq('tenant_id', tenantId)
         .eq('slug', slug)
         .eq('published', true)
         .maybeSingle();
 
       if (error) {
         console.error('[useBlogPost] Error fetching post:', error);
         throw error;
       }
 
       return data as BlogPost | null;
     },
     enabled: !!tenantId && !!slug,
   });
 };
 
 export const useBlogCategories = () => {
   const { data: tenantId } = useTenantId();
   
   return useQuery({
     queryKey: ['blog-categories', tenantId],
     queryFn: async () => {
       if (!tenantId) return [];
 
       const { data, error } = await supabase
         .from('blog_posts')
         .select('category')
         .eq('tenant_id', tenantId)
         .eq('published', true)
         .not('category', 'is', null);
 
       if (error) {
         console.error('[useBlogCategories] Error:', error);
         throw error;
       }
 
       const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))].sort();
       return uniqueCategories as string[];
     },
     enabled: !!tenantId,
   });
 };