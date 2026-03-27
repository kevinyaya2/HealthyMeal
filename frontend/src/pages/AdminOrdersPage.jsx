import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import AdminTabs from '../components/AdminTabs';
import { getAuthToken, useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function headers() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const statuses = ['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELED'];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const canManage = useMemo(() => user?.role === 'ADMIN', [user]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/admin/orders`, { headers: headers() }).catch(() => null);
    if (!res) {
      toast.error('無法連線到後端。');
      setLoading(false);
      return;
    }
    const body = await res.json().catch(() => []);
    if (!res.ok) {
      toast.error(body?.message || '載入訂單失敗');
      setLoading(false);
      return;
    }
    setOrders(Array.isArray(body) ? body : []);
    setLoading(false);
  };

  useEffect(() => {
    if (canManage) loadOrders();
  }, [canManage]);

  const changeStatus = async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status }),
    }).catch(() => null);

    if (!res) {
      toast.error('更新狀態失敗');
      return;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.message || '更新狀態失敗');
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === body.id ? body : o)));
    if (selectedOrder?.id === body.id) {
      setSelectedOrder(body);
    }
  };

  const viewDetail = async (id) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}`, { headers: headers() }).catch(() => null);
    if (!res) {
      toast.error('讀取訂單失敗');
      return;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.message || '讀取訂單失敗');
      return;
    }
    setSelectedOrder(body);
  };

  if (!canManage) {
    return <div className="container py-4"><div className="alert alert-danger mb-0">你沒有後台管理權限。</div></div>;
  }

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3">後台管理</h2>
      <AdminTabs />

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead><tr><th>ID</th><th>日期</th><th>金額</th><th>狀態</th><th className="text-end">操作</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={5} className="text-center py-4">載入中...</td></tr> : orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderDate?.replace('T', ' ')}</td>
                        <td>${o.totalPrice || 0}</td>
                        <td>
                          <select className="form-select form-select-sm" value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => viewDetail(o.id)}>檢視</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h3 className="h6 mb-3">訂單明細</h3>
              {!selectedOrder ? <p className="text-muted mb-0">選擇左側訂單可查看明細。</p> : (
                <>
                  <div className="small text-muted">訂單 #{selectedOrder.id}</div>
                  <ul className="list-group list-group-flush mt-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <li className="list-group-item px-0" key={`${selectedOrder.id}-${idx}`}>{item.name} - ${item.price}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
