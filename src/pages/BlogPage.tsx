 import { useState } from 'react';
import { Loader2, Search, FileText, BookOpen, TrendingUp } from 'lucide-react';
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
 
  // Separate featured post (first one) from the rest
  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

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
        <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 sm:py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }} />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                <span>Blog Via Fatto</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Insights do <span className="text-primary">Mercado Imobiliário</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                Dicas, tendências e tudo que você precisa saber para fazer os melhores negócios
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                />
              </div>
             </div>
           </div>
         </section>
 
         {/* Categories */}
         {categories.length > 0 && (
          <section className="py-8 border-b border-border/50 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
            <div className="container overflow-x-auto scrollbar-hide">
              <div className="flex justify-center gap-2 min-w-max px-4">
                 <button
                   onClick={() => setActiveCategory('')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                     !activeCategory
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                   }`}
                 >
                   Todos
                 </button>
                 {categories.map((category) => (
                   <button
                     key={category}
                     onClick={() => setActiveCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                       activeCategory === category
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
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
        <section className="py-12 sm:py-20">
           <div className="container">
             {isLoading ? (
               <div className="flex justify-center py-16">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : filteredPosts.length > 0 ? (
              <div className="space-y-12">
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Destaque</h2>
                    </div>
                    <article className="group">
                      <a 
                        href={`/blog/${featuredPost.slug}`}
                        className="grid md:grid-cols-2 gap-6 lg:gap-10 bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500"
                      >
                        <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                          {featuredPost.cover_image_url ? (
                            <img
                              src={featuredPost.cover_image_url}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                              <span className="text-6xl opacity-50">📝</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6 lg:p-10 flex flex-col justify-center">
                          {featuredPost.category && (
                            <span className="inline-block w-fit px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
                              {featuredPost.category}
                            </span>
                          )}
                          <h3 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                            {featuredPost.title}
                          </h3>
                          {featuredPost.excerpt && (
                            <p className="text-muted-foreground text-base sm:text-lg line-clamp-3 mb-6 leading-relaxed">
                              {featuredPost.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center text-primary font-semibold">
                            Ler Artigo Completo
                            <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </div>
                      </a>
                    </article>
                  </div>
                )}

                {/* Remaining Posts */}
                {remainingPosts.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">Mais Artigos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {remainingPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
               </div>
             ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground text-lg">
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