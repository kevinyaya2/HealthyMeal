import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const billingOptions = [
  { key: 'monthly', label: '月付', multiplier: 1, savingsText: '彈性方案' },
  { key: 'quarterly', label: '季付', multiplier: 3, savingsText: '平均省 10%' },
];

const plans = [
  {
    id: 'starter',
    name: '單次體驗',
    monthlyPrice: 150,
    unit: '/ 餐',
    description: '彈性下單，適合想先試吃的你。',
    meals: '1 份 / 次',
    support: '一般客服',
    customization: '基本客製',
    cta: '選擇方案',
    highlighted: false,
  },
  {
    id: 'pro',
    name: '月訂方案',
    monthlyPrice: 900,
    unit: '/ 月',
    description: '每月 6 份健康餐，平均每餐更划算。',
    meals: '6 份 / 月',
    support: '優先客服',
    customization: '口味與目標調整',
    cta: '開始每月健康計畫',
    highlighted: true,
  },
  {
    id: 'vip',
    name: 'VIP 季訂',
    monthlyPrice: 1200,
    unit: '/ 月（季繳）',
    description: '每季 24 份，含專屬營養建議與客服快速通道。',
    meals: '24 份 / 季',
    support: '專屬客服',
    customization: '完整客製',
    cta: '升級 VIP',
    highlighted: false,
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat('zh-TW').format(price);
}

export default function Plans() {
  const [billing, setBilling] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const selectedBilling = billingOptions.find((option) => option.key === billing) || billingOptions[0];

  const computedPlans = useMemo(() => {
    return plans.map((plan) => {
      const isQuarterly = billing === 'quarterly';
      if (!isQuarterly) {
        return {
          ...plan,
          displayPrice: plan.monthlyPrice,
          displayUnit: plan.unit,
          periodNote: '',
        };
      }

      if (plan.id === 'starter') {
        return {
          ...plan,
          displayPrice: plan.monthlyPrice,
          displayUnit: plan.unit,
          periodNote: '單次方案不適用季繳折扣',
        };
      }

      const quarterlyTotal = Math.round(plan.monthlyPrice * selectedBilling.multiplier * 0.9);
      return {
        ...plan,
        displayPrice: quarterlyTotal,
        displayUnit: '/ 季',
        periodNote: '已套用季繳 9 折',
      };
    });
  }, [billing, selectedBilling.multiplier]);

  const selectedPlan = computedPlans.find((plan) => plan.id === selectedPlanId) || computedPlans[0];

  const selectPlan = (plan) => {
    setSelectedPlanId(plan.id);

    if (plan.id === 'vip') {
      setBilling('quarterly');
    }

    toast(`已切換到 ${plan.name}（${plan.id === 'vip' ? '季付' : billing === 'monthly' ? '月付' : '季付'}）`, {
      icon: '✅',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  return (
    <section id="plans" className="container my-5 py-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-3">健康訂閱方案</h2>
        <p className="text-muted mb-2">可隨時取消，付款透明，依你的目標彈性調整菜單。</p>
        <p className="small mb-4">
          目前方案：<span className="fw-bold text-success">{selectedPlan.name}</span>
        </p>

        <div className="billing-toggle d-inline-flex p-1 rounded-pill bg-light border">
          {billingOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`btn rounded-pill px-4 ${billing === option.key ? 'btn-success' : 'btn-light'}`}
              onClick={() => setBilling(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="small text-muted mt-2">{selectedBilling.savingsText}</div>
      </div>

      <div className="row g-4 justify-content-center mb-5">
        {computedPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const showFeatured = Boolean(plan.highlighted);
          return (
            <div className="col-md-4" key={plan.id}>
              <div
                className={`card h-100 shadow border-0 hover-effect position-relative ${plan.highlighted ? 'plan-featured' : ''} ${isSelected ? 'plan-selected' : ''}`}
              >
                {showFeatured || isSelected ? (
                  <div className="position-absolute top-0 start-50 translate-middle-x mt-2 d-flex gap-2">
                    {showFeatured ? (
                      <span className="badge rounded-pill bg-danger px-3 py-2 fs-6">
                        最推薦
                      </span>
                    ) : null}
                    {isSelected ? (
                      <span className="badge rounded-pill bg-success px-3 py-2">
                        目前方案
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="card-body text-center p-5 d-flex flex-column">
                  <h3 className="fw-bold mb-3">{plan.name}</h3>
                  <h2 className={`mb-2 ${plan.highlighted ? 'text-success fw-bold' : 'text-primary'}`}>
                    NT$ {formatPrice(plan.displayPrice)} <span className="fs-6 text-muted">{plan.displayUnit}</span>
                  </h2>
                  <p className="small text-muted mb-3" style={{ minHeight: '20px' }}>
                    {plan.periodNote}
                  </p>
                  <p className="text-muted mb-4 flex-grow-1">{plan.description}</p>
                  <button
                    className={`btn btn-lg rounded-pill ${isSelected ? 'btn-success fw-bold' : plan.highlighted ? 'btn-success fw-bold shadow-sm' : 'btn-outline-primary'}`}
                    onClick={() => selectPlan(plan)}
                    disabled={isSelected}
                  >
                    {isSelected ? '已選擇' : plan.cta}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <p className="small text-muted mb-1">確認區塊</p>
            <h5 className="fw-bold mb-1">你目前選擇：{selectedPlan.name}</h5>
            <p className="mb-0 text-muted">
              計費方式：{billing === 'monthly' ? '月付' : '季付'}
            </p>
          </div>
          <div className="text-md-end">
            <p className="small text-muted mb-1">本期價格</p>
            <h4 className="fw-bold text-success mb-0">
              NT$ {formatPrice(selectedPlan.displayPrice)}
              <span className="fs-6 text-muted ms-1">{selectedPlan.displayUnit}</span>
            </h4>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle comparison-table">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">方案比較</th>
                  <th>單次體驗</th>
                  <th>月訂方案</th>
                  <th>VIP 季訂</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ps-4 fw-semibold">餐點數量</td>
                  <td>1 份 / 次</td>
                  <td>6 份 / 月</td>
                  <td>24 份 / 季</td>
                </tr>
                <tr>
                  <td className="ps-4 fw-semibold">客服支援</td>
                  <td>一般</td>
                  <td>優先</td>
                  <td>專屬</td>
                </tr>
                <tr>
                  <td className="ps-4 fw-semibold">客製化程度</td>
                  <td>基本</td>
                  <td>進階</td>
                  <td>完整</td>
                </tr>
                <tr>
                  <td className="ps-4 fw-semibold">是否可隨時取消</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
        <span className="badge text-bg-light border">已服務 10,000+ 用戶</span>
        <span className="badge text-bg-light border">付款前可隨時取消</span>
        <span className="badge text-bg-light border">客服 24 小時內回覆</span>
      </div>
    </section>
  );
}
