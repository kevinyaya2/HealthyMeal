import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import AdminTabs from '../components/AdminTabs';
import { getAuthToken, useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function headers() {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const canManage = useMemo(() => user?.role === 'ADMIN', [user]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: headers() }).catch(() => null);
    if (!res) {
      toast.error('無法連線到後端。');
      setLoading(false);
      return;
    }

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.message || '載入儀表板失敗');
      setLoading(false);
      return;
    }

    setData(body);
    setLoading(false);
  };

  useEffect(() => {
    if (canManage) loadData();
  }, [canManage]);

  if (!canManage) {
    return <div className="container py-4"><div className="alert alert-danger mb-0">你沒有後台管理權限。</div></div>;
  }

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3">後台管理</h2>
      <AdminTabs />

      {loading ? <div className="text-muted">載入中...</div> : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="text-muted small">今日訂單數</div><div className="h3 mb-0">{data?.todayOrderCount ?? 0}</div></div></div></div>
            <div className="col-12 col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="text-muted small">今日營收</div><div className="h3 mb-0">${data?.todayRevenue ?? 0}</div></div></div></div>
            <div className="col-12 col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="text-muted small">熱銷項目數</div><div className="h3 mb-0">{(data?.topItems || []).length}</div></div></div></div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h6 mb-3">熱銷前 5</h3>
              {(data?.topItems || []).length === 0 ? <div className="text-muted">今日尚無資料</div> : (
                <ol className="mb-0">
                  {data.topItems.map((item) => (
                    <li key={item.name} className="mb-1">{item.name} <span className="text-muted">x {item.count}</span></li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
