import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Home from './Home';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
