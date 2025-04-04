// MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

export const MainLayout = () => {

  const categorias = ["Todos", "Perfumes", "Desodorantes", "Colônias", "Lábios"]

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categorias} />
      <main className="flex-grow">
        <Outlet /> {/* Isso renderiza as sub-rotas */}
      </main>
      <Footer />
    </div>
  );
};