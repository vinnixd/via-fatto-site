 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { Loader2, Search, FileText } from 'lucide-react';
 import Header from '@/components/layout/Header';
 import Footer from '@/components/layout/Footer';
 import SEOHead from '@/components/SEOHead';
 import BlogCard from '@/components/blog/BlogCard';
 import { useBlogPosts, useBlogCategories } from '@/hooks/useBlogPosts';
 import { useSiteConfig } from '@/hooks/useSupabaseData';
 
 const BlogPage = () => {
   const [activeCategory, setActiveCategory] = useState<string>('');
   const [searchQuery, setSearchQuery] = useState('');
   
   const { data: siteConfig } = useSiteConfig();
   const { data: posts = [], isLoading } = useBlogPosts({ category: activeCategory || undefined });
   const { data: categories = [] } = useBlogCategories();
 
   const filteredPosts = posts.filter(post => {
     if (!searchQuery) return true;
     const query = searchQuery.toLowerCase();
     return (
       post.title.toLowerCase().includes(query) ||
       post.excerpt?.toLowerCase().includes(query) ||
       post.category?.toLowerCase().includes(query)
     );
   });
 
   return (
     <div className="min-h-screen bg-background">
       <SEOHead 
         pageKey="blog"
         title="Blog | Notícias do Mercado Imobiliário"
         siteConfig={siteConfig}
       />
       <Header />
       
       <main>
         {/* Hero Section */}
         <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 sm:py-16">
           <div className="container text-center">
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
               Blog
             </h1>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
               Fique por dentro das últimas notícias, dicas e tendências do mercado imobiliário
             </p>
 
             {/* Search Bar */}
             <div className="max-w-xl mx-auto relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
               <input
                 type="text"
                 placeholder="Buscar artigos..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
               />
             </div>
           </div>
         </section>
 
         {/* Categories */}
         {categories.length > 0 && (
           <section className="py-6 border-b border-border">
             <div className="container">
               <div className="flex flex-wrap justify-center gap-2">
                 <button
                   onClick={() => setActiveCategory('')}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                     !activeCategory
                       ? 'bg-primary text-primary-foreground'
                       : 'bg-muted text-muted-foreground hover:bg-muted/80'
                   }`}
                 >
                   Todos
                 </button>
                 {categories.map((category) => (
                   <button
                     key={category}
                     onClick={() => setActiveCategory(category)}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                       activeCategory === category
                         ? 'bg-primary text-primary-foreground'
                         : 'bg-muted text-muted-foreground hover:bg-muted/80'
                     }`}
                   >
                     {category}
                   </button>
                 ))}
               </div>
             </div>
           </section>
         )}
 
         {/* Posts Grid */}
         <section className="py-10 sm:py-16">
           <div className="container">
             {isLoading ? (
               <div className="flex justify-center py-16">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : filteredPosts.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                 {filteredPosts.map((post) => (
                   <BlogCard key={post.id} post={post} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-16">
                 <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                 <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
                 <p className="text-muted-foreground">
                   {searchQuery 
                     ? 'Tente buscar por outro termo' 
                     : 'Em breve teremos novidades por aqui'}
                 </p>
               </div>
             )}
           </div>
         </section>
       </main>
 
       <Footer />
     </div>
   );
 };
 
 export default BlogPage;