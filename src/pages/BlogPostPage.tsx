 import { useParams, Link } from 'react-router-dom';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { Loader2, ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';
 import Header from '@/components/layout/Header';
 import Footer from '@/components/layout/Footer';
 import SEOHead from '@/components/SEOHead';
 import BlogCard from '@/components/blog/BlogCard';
 import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
 import { useSiteConfig } from '@/hooks/useSupabaseData';
 
 const BlogPostPage = () => {
   const { slug } = useParams<{ slug: string }>();
   const { data: siteConfig } = useSiteConfig();
   const { data: post, isLoading, error } = useBlogPost(slug || '');
   const { data: relatedPosts = [] } = useBlogPosts({ limit: 3 });
 
   const handleShare = async () => {
     if (navigator.share && post) {
       try {
         await navigator.share({
           title: post.title,
           text: post.excerpt || '',
           url: window.location.href,
         });
       } catch (err) {
         // User cancelled or error
       }
     } else {
       navigator.clipboard.writeText(window.location.href);
     }
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-background">
         <Header />
         <div className="flex justify-center items-center py-32">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
         <Footer />
       </div>
     );
   }
 
   if (error || !post) {
     return (
       <div className="min-h-screen bg-background">
         <Header />
         <div className="container py-16 text-center">
           <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
           <p className="text-muted-foreground mb-6">
             O artigo que você está procurando não existe ou foi removido.
           </p>
           <Link to="/blog" className="btn-primary inline-block">
             Voltar ao Blog
           </Link>
         </div>
         <Footer />
       </div>
     );
   }
 
   const publishedDate = post.published_at || post.created_at;
   const formattedDate = format(new Date(publishedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
 
   // Filter out current post from related
   const otherPosts = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);
 
   return (
     <div className="min-h-screen bg-background">
       <SEOHead 
         pageKey="blog-post"
         title={post.title}
         description={post.excerpt || undefined}
         ogImage={post.cover_image_url || undefined}
         siteConfig={siteConfig}
       />
       <Header />
       
       <main>
         {/* Hero */}
         <section className="relative">
           {post.cover_image_url ? (
             <div className="h-[40vh] sm:h-[50vh] relative">
               <img
                 src={post.cover_image_url}
                 alt={post.title}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
             </div>
           ) : (
             <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
           )}
         </section>
 
         {/* Content */}
         <section className="py-8 sm:py-12">
           <div className="container">
             <div className="max-w-3xl mx-auto">
               {/* Back Link */}
               <Link 
                 to="/blog" 
                 className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
               >
                 <ArrowLeft size={18} />
                 Voltar ao Blog
               </Link>
 
               {/* Meta */}
               <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                 {post.category && (
                   <span className="inline-flex items-center gap-1.5">
                     <Tag size={14} />
                     <span className="text-primary font-medium">{post.category}</span>
                   </span>
                 )}
                 <span className="inline-flex items-center gap-1.5">
                   <Calendar size={14} />
                   {formattedDate}
                 </span>
                 {post.author_name && (
                   <span className="inline-flex items-center gap-1.5">
                     <User size={14} />
                     {post.author_name}
                   </span>
                 )}
               </div>
 
               {/* Title */}
               <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                 {post.title}
               </h1>
 
               {/* Share */}
               <button
                 onClick={handleShare}
                 className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
               >
                 <Share2 size={16} />
                 Compartilhar
               </button>
 
               {/* Content */}
               <article 
                 className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary"
                 dangerouslySetInnerHTML={{ __html: post.content || '<p>Conteúdo não disponível.</p>' }}
               />
             </div>
           </div>
         </section>
 
         {/* Related Posts */}
         {otherPosts.length > 0 && (
           <section className="py-10 sm:py-16 bg-muted/30">
             <div className="container">
               <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center">
                 Outros Artigos
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                 {otherPosts.map((relatedPost) => (
                   <BlogCard key={relatedPost.id} post={relatedPost} />
                 ))}
               </div>
             </div>
           </section>
         )}
       </main>
 
       <Footer />
     </div>
   );
 };
 
 export default BlogPostPage;