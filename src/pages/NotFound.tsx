import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl font-bold text-primary mb-4">404</div>
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground mb-8">
              Desculpe, a página que você está procurando não existe ou foi movida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Página Inicial
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;