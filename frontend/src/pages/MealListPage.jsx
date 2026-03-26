import Header from '../components/Header';
import Menu from '../components/Menu';
import { useAppData } from '../context/AppDataContext';

export default function MealListPage() {
  const {
    menuItems,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    addToCart,
  } = useAppData();

  return (
    <>
      <Header />
      <Menu
        menuItems={menuItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        addToCart={addToCart}
      />
    </>
  );
}

