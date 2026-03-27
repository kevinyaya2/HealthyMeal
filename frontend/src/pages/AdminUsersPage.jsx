import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import AdminTabs from '../components/AdminTabs';
import { getAuthToken, useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function adminHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const canManage = useMemo(() => user?.role === 'ADMIN', [user]);

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/admin/users`, { headers: adminHeaders() }).catch(() => null);
    if (!res) {
      toast.error('無法連線到後端。');
      setLoading(false);
      return;
    }

    const data = await res.json().catch(() => []);
    if (!res.ok) {
      toast.error(data?.message || '載入使用者失敗');
      setLoading(false);
      return;
    }

    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadUserDetail = async (userId) => {
    setActingId(userId);
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, { headers: adminHeaders() }).catch(() => null);
    if (!res) {
      toast.error('讀取使用者失敗');
      setActingId(null);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.message || '讀取使用者失敗');
      setActingId(null);
      return;
    }

    setSelectedUser(data);
    setActingId(null);
  };

  const updateRole = async (target, role) => {
    setActingId(target.id);
    const res = await fetch(`${API_BASE}/admin/users/${target.id}/role`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ role }),
    }).catch(() => null);

    if (!res) {
      toast.error('更新角色失敗');
      setActingId(null);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.message || '更新角色失敗');
      setActingId(null);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    if (selectedUser?.id === data.id) {
      setSelectedUser(data);
    }
    toast.success(`已更新 ${data.username} 為 ${data.role}`);
    setActingId(null);
  };

  const updateStatus = async (target, status) => {
    setActingId(target.id);
    const res = await fetch(`${API_BASE}/admin/users/${target.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status }),
    }).catch(() => null);

    if (!res) {
      toast.error('更新狀態失敗');
      setActingId(null);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.message || '更新狀態失敗');
      setActingId(null);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    if (selectedUser?.id === data.id) {
      setSelectedUser(data);
    }
    toast.success(`已更新 ${data.username} 狀態為 ${data.status}`);
    setActingId(null);
  };

  const resetSecurityQuestion = async (target) => {
    const securityQuestion = window.prompt('請輸入新的安全問題');
    if (!securityQuestion) return;
    const securityAnswer = window.prompt('請輸入新的安全問題答案');
    if (!securityAnswer) return;

    setActingId(target.id);
    const res = await fetch(`${API_BASE}/admin/users/${target.id}/security-question`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ securityQuestion, securityAnswer }),
    }).catch(() => null);

    if (!res) {
      toast.error('重設安全問題失敗');
      setActingId(null);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.message || '重設安全問題失敗');
      setActingId(null);
      return;
    }

    toast.success('安全問題已重設');
    setActingId(null);
  };

  const deleteUser = async (target) => {
    if (!window.confirm(`確定要刪除 ${target.username || target.email} 嗎？`)) return;

    setActingId(target.id);
    const res = await fetch(`${API_BASE}/admin/users/${target.id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }).catch(() => null);

    if (!res) {
      toast.error('刪除使用者失敗');
      setActingId(null);
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.message || '刪除使用者失敗');
      setActingId(null);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== target.id));
    if (selectedUser?.id === target.id) setSelectedUser(null);
    toast.success('使用者已刪除');
    setActingId(null);
  };

  useEffect(() => {
    if (canManage) {
      loadUsers();
    }
  }, [canManage]);

  if (!canManage) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">你沒有後台管理權限。</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3">後台管理</h2>
      <AdminTabs />

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-success btn-sm" onClick={loadUsers} disabled={loading}>重新整理</button>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-4">載入中...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4">目前沒有使用者</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username || '-'}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'text-bg-success' : 'text-bg-secondary'}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'ACTIVE' ? 'text-bg-primary' : 'text-bg-dark'}`}>{u.status}</span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => loadUserDetail(u.id)} disabled={actingId === u.id}>檢視</button>
                            {u.role === 'ADMIN' ? (
                              <button className="btn btn-sm btn-outline-warning" onClick={() => updateRole(u, 'USER')} disabled={actingId === u.id}>降為 USER</button>
                            ) : (
                              <button className="btn btn-sm btn-outline-success" onClick={() => updateRole(u, 'ADMIN')} disabled={actingId === u.id}>升為 ADMIN</button>
                            )}
                            {u.status === 'ACTIVE' ? (
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => updateStatus(u, 'DISABLED')} disabled={actingId === u.id}>停用</button>
                            ) : (
                              <button className="btn btn-sm btn-outline-info" onClick={() => updateStatus(u, 'ACTIVE')} disabled={actingId === u.id}>啟用</button>
                            )}
                            <button className="btn btn-sm btn-outline-dark" onClick={() => resetSecurityQuestion(u)} disabled={actingId === u.id}>重設安全問題</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u)} disabled={actingId === u.id}>刪除</button>
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

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h3 className="h6 mb-3">使用者詳細</h3>
              {selectedUser ? (
                <dl className="mb-0">
                  <dt>ID</dt><dd>{selectedUser.id}</dd>
                  <dt>Username</dt><dd>{selectedUser.username || '-'}</dd>
                  <dt>Email</dt><dd>{selectedUser.email}</dd>
                  <dt>Display Name</dt><dd>{selectedUser.displayName || '-'}</dd>
                  <dt>Role</dt><dd>{selectedUser.role}</dd>
                  <dt>Status</dt><dd>{selectedUser.status}</dd>
                </dl>
              ) : (
                <p className="text-muted mb-0">選擇左側使用者可查看詳細。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
