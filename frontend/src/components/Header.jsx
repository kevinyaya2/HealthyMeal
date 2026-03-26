export default function Header() {
  const handleStartShopping = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="text-center bg-success text-white py-5 mb-5 shadow">
      <h1 className="fw-bold mb-3">健康餐訂購平台</h1>
      <p className="lead mb-4">快速挑選你喜歡的健康餐，建立自己的均衡飲食節奏。</p>
      <button className="btn btn-warning btn-lg fw-bold shadow-sm" onClick={handleStartShopping}>
        開始選購
      </button>
    </header>
  );
}
