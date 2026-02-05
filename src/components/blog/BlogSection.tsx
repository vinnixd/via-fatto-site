 import { Link } from 'react-router-dom';
 import { ArrowRight, ChevronRight } from 'lucide-react';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { BlogPost } from './BlogCard';
 
 interface BlogSectionProps {
   posts: BlogPost[];
   isLoading?: boolean;
 }
 
 const BlogSectionCard = ({ post }: { post: BlogPost }) => {
   const publishedDate = post.published_at || post.created_at;
   const formattedDate = format(new Date(publishedDate), "dd MMM yyyy", { locale: ptBR });
 
   return (
     <article className="group">
       <Link to={`/blog/${post.slug}`} className="block">
         {/* Cover Image */}
         <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
           {post.cover_image_url ? (
             <img
               src={post.cover_image_url}
               alt={post.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               loading="lazy"
             />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
               <span className="text-4xl opacity-50">📝</span>
             </div>
           )}
         </div>
 
         {/* Meta */}
         <div className="flex items-center justify-between mb-3">
           {post.category && (
             <span className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">
               {post.category}
             </span>
           )}
           <span className="text-sm text-muted-foreground">{formattedDate}</span>
         </div>
 
         {/* Title */}
         <h3 className="text-base sm:text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
           {post.title}
         </h3>
 
         {/* Read More */}
         <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
           Ler Artigo <ChevronRight className="h-4 w-4" />
         </span>
       </Link>
     </article>
   );
 };
 
 const BlogSection = ({ posts, isLoading }: BlogSectionProps) => {
   if (isLoading) {
     return (
       <section className="py-12 sm:py-20">
         <div className="container">
           <div className="text-center mb-8 sm:mb-12">
             <span className="text-primary font-semibold text-sm uppercase tracking-widest">
               NOTÍCIAS
             </span>
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-3 mb-4">
               Últimas do Mercado
             </h2>
             <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
             {[1, 2, 3].map((i) => (
               <div key={i} className="animate-pulse">
                 <div className="aspect-[16/10] rounded-xl bg-muted mb-4" />
                 <div className="flex justify-between mb-3">
                   <div className="h-6 bg-muted rounded w-20" />
                   <div className="h-4 bg-muted rounded w-24" />
                 </div>
                 <div className="h-6 bg-muted rounded w-full mb-3" />
                 <div className="h-4 bg-muted rounded w-24" />
               </div>
             ))}
           </div>
         </div>
       </section>
     );
   }
 
   if (posts.length === 0) {
     return null;
   }
 
   return (
     <section className="py-12 sm:py-20">
       <div className="container">
         <div className="text-center mb-8 sm:mb-12">
           <span className="text-primary font-semibold text-sm uppercase tracking-widest">
             NOTÍCIAS
           </span>
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-3 mb-4">
             Últimas do Mercado
           </h2>
           <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
           {posts.slice(0, 3).map((post) => (
             <BlogSectionCard key={post.id} post={post} />
           ))}
         </div>
 
         <div className="text-center mt-8 sm:mt-12">
           <Link 
             to="/blog" 
             className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
           >
             Ver todas as notícias
             <ArrowRight size={18} />
           </Link>
         </div>
       </div>
     </section>
   );
 };
 
 export default BlogSection;