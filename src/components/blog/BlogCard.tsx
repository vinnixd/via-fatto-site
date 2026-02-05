 import { Link } from 'react-router-dom';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
import { ArrowRight, Clock } from 'lucide-react';
 
 export interface BlogPost {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   content: string | null;
   cover_image_url: string | null;
   category: string | null;
   author_name: string | null;
   published_at: string | null;
   created_at: string;
 }
 
 interface BlogCardProps {
   post: BlogPost;
   variant?: 'default' | 'compact';
 }
 
 const BlogCard = ({ post, variant = 'default' }: BlogCardProps) => {
   const publishedDate = post.published_at || post.created_at;
  const formattedDate = format(new Date(publishedDate), "dd 'de' MMMM, yyyy", { locale: ptBR });
 
   if (variant === 'compact') {
     return (
       <Link 
         to={`/blog/${post.slug}`}
        className="group flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors"
       >
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-sm">
           {post.cover_image_url ? (
             <img
               src={post.cover_image_url}
               alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             />
           ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
           )}
         </div>
         <div className="flex-1 min-w-0">
          {post.category && (
            <span className="text-xs font-medium text-primary mb-1 block">
              {post.category}
            </span>
          )}
           <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
             {post.title}
           </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
         </div>
       </Link>
     );
   }
 
   return (
    <article className="group h-full">
      <Link 
        to={`/blog/${post.slug}`} 
        className="block h-full bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
      >
         {/* Cover Image */}
        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
           {post.cover_image_url ? (
             <img
               src={post.cover_image_url}
               alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
               loading="lazy"
             />
           ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-5xl opacity-50">📝</span>
             </div>
           )}
          
          {/* Category Badge Overlay */}
          {post.category && (
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
                {post.category}
              </span>
            </div>
          )}
         </div>
 
        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Read More */}
          <div className="flex items-center text-primary text-sm font-semibold">
            <span>Ler Artigo</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
         </div>
       </Link>
     </article>
   );
 };
 
 export default BlogCard;