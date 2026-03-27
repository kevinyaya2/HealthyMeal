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

const emptyForm = {
  name: '',
  price: 0,
  category: '',
  image: '',
  active: true,
};

function normalizeImagePath(path) {
  const raw = String(path || '').trim().replace(/\\/g, '/');
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('image/') || raw.startsWith('/image/')) return raw.replace(/^\//, '');
  return `image/${raw.replace(/^\//, '')}`;
}

export default function AdminMenuPage() {
  const { user } = useAuth();
  const canManage = useMemo(() => user?.role === 'ADMIN', [user]);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/admin/menu`, { headers: headers() }).catch(() => null);
    if (!res) {
      toast.error('無法連線到後端。');
      setLoading(false);
      return;
    }
    const body = await res.json().catch(() => []);
    if (!res.ok) {
      toast.error(body?.message || '載入餐點失敗');
      setLoading(false);
      return;
    }
    setItems(Array.isArray(body) ? body : []);
    setLoading(false);
  };

  useEffect(() => {
    if (canManage) loadItems();
  }, [canManage]);

  const submit = async (event) => {
    event.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/admin/menu/${editingId}` : `${API_BASE}/admin/menu`;

    const payload = {
      ...form,
      image: normalizeImagePath(form.image),
      price: Number(form.price) || 0,
    };
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) }).catch(() => null);
    if (!res) {
      toast.error('儲存失敗');
      return;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.message || '儲存失敗');
      return;
    }

    toast.success(editingId ? '餐點已更新' : '餐點已新增');
    setForm(emptyForm);
    setEditingId(null);
    loadItems();
  };

  const setActive = async (id, active) => {
    const res = await fetch(`${API_BASE}/admin/menu/${id}/active?active=${active}`, {
      method: 'PATCH',
      headers: headers(),
    }).catch(() => null);
    if (!res) {
      toast.error('更新上架狀態失敗');
      return;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.message || '更新上架狀態失敗');
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === body.id ? body : item)));
  };

  if (!canManage) {
    return <div className="container py-4"><div className="alert alert-danger mb-0">你沒有後台管理權限。</div></div>;
  }

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3">後台管理</h2>
      <AdminTabs />

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h3 className="h6 mb-3">{editingId ? '編輯餐點' : '新增餐點'}</h3>
          <form className="row g-2" onSubmit={submit}>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="名稱" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
            <div className="col-6 col-md-2"><input className="form-control" type="number" placeholder="價格" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required /></div>
            <div className="col-6 col-md-2"><input className="form-control" placeholder="分類" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required /></div>
            <div className="col-12 col-md-4"><input className="form-control" placeholder="圖片路徑（例如 image/chicken2.png 或 https://...）" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} required /></div>
            <div className="col-12 d-flex align-items-center gap-2">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="active-check" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                <label className="form-check-label" htmlFor="active-check">上架</label>
              </div>
              <button className="btn btn-success btn-sm" type="submit">{editingId ? '儲存變更' : '新增'}</button>
              {editingId ? <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>取消</button> : null}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead><tr><th>ID</th><th>名稱</th><th>價格</th><th>分類</th><th>上架</th><th className="text-end">操作</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-4">載入中...</td></tr> : items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td>{item.category}</td>
                    <td><span className={`badge ${item.active ? 'text-bg-success' : 'text-bg-secondary'}`}>{item.active ? '上架' : '下架'}</span></td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingId(item.id); setForm({ ...item }); }}>編輯</button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => setActive(item.id, !item.active)}>{item.active ? '下架' : '上架'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
