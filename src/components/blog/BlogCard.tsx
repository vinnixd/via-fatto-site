 import { Link } from 'react-router-dom';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 
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
   const formattedDate = format(new Date(publishedDate), "dd MMM yyyy", { locale: ptBR });
 
   if (variant === 'compact') {
     return (
       <Link 
         to={`/blog/${post.slug}`}
         className="group flex gap-4 items-start"
       >
         <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
           {post.cover_image_url ? (
             <img
               src={post.cover_image_url}
               alt={post.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
             />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
           )}
         </div>
         <div className="flex-1 min-w-0">
           <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
             {post.title}
           </h4>
           <span className="text-xs text-muted-foreground mt-1 block">
             {formattedDate}
           </span>
         </div>
       </Link>
     );
   }
 
   return (
     <article className="group">
       <Link to={`/blog/${post.slug}`} className="block">
         {/* Cover Image */}
         <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
           {post.cover_image_url ? (
             <img
               src={post.cover_image_url}
               alt={post.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               loading="lazy"
             />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
               <span className="text-4xl">📝</span>
             </div>
           )}
         </div>
 
         {/* Meta */}
         <div className="flex items-center gap-3 mb-3">
           {post.category && (
             <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
               {post.category}
             </span>
           )}
           <span className="text-sm text-muted-foreground">{formattedDate}</span>
         </div>
 
         {/* Title */}
         <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
           {post.title}
         </h3>
 
         {/* Excerpt */}
         {post.excerpt && (
           <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
             {post.excerpt}
           </p>
         )}
 
         {/* Read More */}
         <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
           Ler Artigo <span>→</span>
         </span>
       </Link>
     </article>
   );
 };
 
 export default BlogCard;