import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const TITLE_LEVELS = [
  { threshold: 0, title: '尚未獲得稱號' },
  { threshold: 1, title: '健康新手' },
  { threshold: 5, title: '健康進階者' },
  { threshold: 10, title: '均衡達人' },
  { threshold: 20, title: '健康王者' },
];

function getProgressInfo(orderCount) {
  const currentIndex = TITLE_LEVELS.reduce((acc, level, index) => {
    if (orderCount >= level.threshold) return index;
    return acc;
  }, 0);

  const current = TITLE_LEVELS[currentIndex];
  const next = TITLE_LEVELS[currentIndex + 1] || null;

  if (!next) {
    return {
      current,
      next,
      progressPercent: 100,
      remaining: 0,
    };
  }

  const range = next.threshold - current.threshold;
  const finished = orderCount - current.threshold;

  return {
    current,
    next,
    progressPercent: Math.min(100, Math.round((finished / range) * 100)),
    remaining: Math.max(0, next.threshold - orderCount),
  };
}

export default function BadgePage() {
  const { getTitle, orderHistory } = useAppData();
  const orderCount = orderHistory.length;
  const progress = getProgressInfo(orderCount);

  return (
    <section className="container my-5">
      <div className="p-4 p-md-5 bg-gradient bg-light rounded-4 shadow-sm border border-warning-subtle">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3">你的健康稱號</h2>
          <h3 className="text-warning fw-bold display-5 mb-2">{getTitle()}</h3>
          <p className="text-muted mb-0">目前累積訂單數：{orderCount}</p>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary">升級進度</span>
            <span className="text-success fw-bold">{progress.progressPercent}%</span>
          </div>
          <div className="progress" role="progressbar" aria-label="title-progress" aria-valuenow={progress.progressPercent} aria-valuemin="0" aria-valuemax="100" style={{ height: '12px' }}>
            <div className="progress-bar bg-success" style={{ width: `${progress.progressPercent}%` }}></div>
          </div>
        </div>

        <div className="milestone-track mb-4">
          {TITLE_LEVELS.slice(1).map((level) => {
            const reached = orderCount >= level.threshold;
            return (
              <div key={level.threshold} className="milestone-item text-center">
                <div className={`milestone-dot ${reached ? 'reached' : ''}`}></div>
                <div className="small fw-semibold mt-2">{level.threshold} 單</div>
                <div className={`small ${reached ? 'text-success' : 'text-muted'}`}>{level.title}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3 p-3 p-md-4 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            {progress.next ? (
              <>
                <p className="mb-1 fw-semibold">下一級稱號：{progress.next.title}</p>
                <p className="mb-0 text-muted">再完成 {progress.remaining} 筆訂單即可升級。</p>
              </>
            ) : (
              <p className="mb-0 fw-semibold text-success">你已達成最高稱號，維持很棒的飲食紀律。</p>
            )}
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-success rounded-pill px-4" to="/orders-advice">
              查看紀錄
            </Link>
            <Link className="btn btn-success rounded-pill px-4" to="/">
              繼續選餐
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
