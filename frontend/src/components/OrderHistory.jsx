import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getCategorySummary(orders) {
  const counts = {};
  orders.flatMap((order) => order.items || []).forEach((item) => {
    const key = item.category || '未分類';
    counts[key] = (counts[key] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return {
    counts,
    topCategory: entries[0]?.[0] || '尚無資料',
    topCount: entries[0]?.[1] || 0,
  };
}

function getAdviceMeta(summary) {
  if (summary.totalOrders === 0) {
    return {
      tone: 'neutral',
      chipClass: 'bg-secondary-subtle text-secondary',
      chipText: '尚無資料',
      nextStep: '先下第一筆訂單，AI 才能產生個人化建議。',
      recommendation: '從商品頁挑一份健康餐開始。',
    };
  }

  if (summary.topCategory === '高蛋白') {
    return {
      tone: 'protein',
      chipClass: 'bg-primary-subtle text-primary',
      chipText: '蛋白偏高',
      nextStep: '下次下單可加入一份低糖或均衡飲食餐點。',
      recommendation: '建議搭配 1 份纖維來源，讓營養更均衡。',
    };
  }

  if (summary.topCategory === '低糖') {
    return {
      tone: 'light',
      chipClass: 'bg-warning-subtle text-warning',
      chipText: '低糖優先',
      nextStep: '下次可補一份高蛋白或均衡飲食餐點。',
      recommendation: '建議每 2 餐加入 1 份蛋白質來源，維持飽足與營養。',
    };
  }

  if (summary.topCategory === '均衡飲食') {
    return {
      tone: 'balanced',
      chipClass: 'bg-success-subtle text-success',
      chipText: '本週均衡',
      nextStep: '維持目前選餐節奏，每週檢查一次比例。',
      recommendation: '你目前飲食節奏不錯，繼續保持。',
    };
  }

  return {
    tone: 'balanced',
    chipClass: 'bg-success-subtle text-success',
    chipText: '本週均衡',
    nextStep: '維持目前選餐節奏，每週檢查一次比例。',
    recommendation: '你目前飲食節奏不錯，繼續保持。',
  };
}

export default function OrderHistory({ orderHistory, getHealthAdvice, onReorder }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const allCategories = useMemo(() => {
    const categories = new Set();
    orderHistory.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.category) categories.add(item.category);
      });
    });
    return ['all', ...Array.from(categories)];
  }, [orderHistory]);

  const summary = useMemo(() => {
    const totalOrders = orderHistory.length;
    const totalAmount = orderHistory.reduce((sum, order) => sum + toNumber(order.totalPrice), 0);
    const averageAmount = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;
    const categoryStats = getCategorySummary(orderHistory);

    return {
      totalOrders,
      totalAmount,
      averageAmount,
      topCategory: categoryStats.topCategory,
      topCategoryCount: categoryStats.topCount,
      categoryCounts: categoryStats.counts,
    };
  }, [orderHistory]);

  const filteredOrders = useMemo(() => {
    let rows = [...orderHistory].map((order, index) => ({ order, index }));

    if (categoryFilter !== 'all') {
      rows = rows.filter(({ order }) =>
        (order.items || []).some((item) => item.category === categoryFilter),
      );
    }

    rows.sort((a, b) => {
      if (sortBy === 'highest') {
        return toNumber(b.order.totalPrice) - toNumber(a.order.totalPrice);
      }

      if (sortBy === 'lowest') {
        return toNumber(a.order.totalPrice) - toNumber(b.order.totalPrice);
      }

      const aId = toNumber(a.order.id);
      const bId = toNumber(b.order.id);
      if (aId !== bId) return bId - aId;
      return b.index - a.index;
    });

    return rows.map(({ order }) => order);
  }, [categoryFilter, orderHistory, sortBy]);

  const adviceBasis = useMemo(() => {
    if (summary.totalOrders === 0) {
      return '尚未有資料可分析';
    }

    if (summary.topCategory === '尚無資料') {
      return '目前分類資料不足';
    }

    return `最近偏好：${summary.topCategory}（共 ${summary.topCategoryCount} 份）`;
  }, [summary]);
  const adviceMeta = useMemo(() => getAdviceMeta(summary), [summary]);

  return (
    <section id="order-history" className="container my-5">
      <h2 className="text-center fw-bold mb-4">訂單紀錄與智慧建議</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="summary-icon mb-2">🧾</div>
              <p className="text-muted mb-1">累積訂單</p>
              <h4 className="mb-0 fw-bold">{summary.totalOrders}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="summary-icon mb-2">💰</div>
              <p className="text-muted mb-1">累積消費</p>
              <h4 className="mb-0 fw-bold">NT$ {summary.totalAmount}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="summary-icon mb-2">📊</div>
              <p className="text-muted mb-1">平均客單</p>
              <h4 className="mb-0 fw-bold">NT$ {summary.averageAmount}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="summary-icon mb-2">🥗</div>
              <p className="text-muted mb-1">最常選擇</p>
              <h4 className="mb-0 fw-bold">{summary.topCategory}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center mb-3">
                <h4 className="mb-0 fw-bold">歷史訂單</h4>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? '全部分類' : category}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">最新優先</option>
                    <option value="highest">金額高到低</option>
                    <option value="lowest">金額低到高</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {filteredOrders.length === 0 ? (
                  <li className="list-group-item text-center text-muted mt-2 border-0 py-5">
                    <p className="mb-3">目前沒有符合條件的訂單。</p>
                    <Link to="/" className="btn btn-success rounded-pill px-4">
                      去商品頁選餐
                    </Link>
                  </li>
                ) : (
                  filteredOrders.map((order, i) => (
                    <li key={`${order.id}-${i}`} className="list-group-item py-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2 gap-2">
                        <strong className="fs-5 text-primary">訂單 #{order.id}</strong>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="badge bg-success rounded-pill px-3 py-2">NT$ {order.totalPrice}</span>
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm rounded-pill"
                            onClick={() => onReorder(order.items || [])}
                          >
                            再買一次
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {(order.items || []).map((item, j) => (
                          <span key={`${item.name}-${j}`} className="badge bg-light text-dark border">
                            {item.name}（{item.category}）
                          </span>
                        ))}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1">智慧分析</p>
                  <h3 className="fw-bold mb-0">AI 健康建議</h3>
                </div>
                <span className={`badge rounded-pill ${adviceMeta.chipClass}`}>{adviceMeta.chipText}</span>
              </div>

              <div className="rounded-3 border p-3 bg-light mb-3">
                <p className="mb-1 fw-semibold">核心建議</p>
                <p className="mb-0">{getHealthAdvice()}</p>
              </div>

              <div className="mb-3">
                <p className="small text-muted mb-1">為什麼</p>
                <p className="mb-0">{adviceBasis}</p>
              </div>

              <div className="mb-4">
                <p className="small text-muted mb-1">下一步</p>
                <p className="mb-0">{adviceMeta.nextStep}</p>
              </div>

              <div className="rounded-3 p-3 mb-4 border-start border-4 border-success bg-success-subtle">
                <p className="small text-muted mb-1">推薦行動</p>
                <p className="mb-0">{adviceMeta.recommendation}</p>
              </div>

              <div className="mt-auto d-flex gap-2">
                <Link to="/" className="btn btn-success rounded-pill px-3">
                  去選餐
                </Link>
                <Link to="/subscription" className="btn btn-outline-success rounded-pill px-3">
                  看訂閱方案
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
