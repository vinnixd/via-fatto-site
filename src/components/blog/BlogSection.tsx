 import { Link } from 'react-router-dom';
 import { ArrowRight } from 'lucide-react';
 import BlogCard, { BlogPost } from './BlogCard';
 
 interface BlogSectionProps {
   posts: BlogPost[];
   isLoading?: boolean;
 }
 
 const BlogSection = ({ posts, isLoading }: BlogSectionProps) => {
   if (isLoading) {
     return (
       <section className="py-10 sm:py-16 bg-muted/30">
         <div className="container">
           <div className="text-center mb-8 sm:mb-12">
             <span className="text-primary font-medium text-sm uppercase tracking-wider">
               NOTÍCIAS
             </span>
             <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 mb-3">
               Últimas do Mercado
             </h2>
             <div className="w-16 h-1 bg-primary mx-auto"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
             {[1, 2, 3].map((i) => (
               <div key={i} className="animate-pulse">
                 <div className="aspect-[16/10] rounded-xl bg-muted mb-4" />
                 <div className="h-4 bg-muted rounded w-24 mb-3" />
                 <div className="h-6 bg-muted rounded w-full mb-2" />
                 <div className="h-4 bg-muted rounded w-20" />
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
     <section className="py-10 sm:py-16 bg-muted/30">
       <div className="container">
         <div className="text-center mb-8 sm:mb-12">
           <span className="text-primary font-medium text-sm uppercase tracking-wider">
             NOTÍCIAS
           </span>
           <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 mb-3">
             Últimas do Mercado
           </h2>
           <div className="w-16 h-1 bg-primary mx-auto"></div>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
           {posts.slice(0, 3).map((post) => (
             <BlogCard key={post.id} post={post} />
           ))}
         </div>
 
         <div className="text-center mt-8 sm:mt-10">
           <Link 
             to="/blog" 
             className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
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