export default function Footer() {
  return (
    <>
      <section id="contact" className="text-center my-5 py-5 bg-light rounded-4 mx-3 shadow-sm border">
        <h2 className="fw-bold mb-4">聯絡我們</h2>
        <p className="fs-5">
          <i className="bi bi-envelope-fill text-success me-2"></i>
          Email:{' '}
          <a href="mailto:support@healthymeal.com" className="text-decoration-none">
            support@healthymeal.com
          </a>
        </p>
        <p className="fs-5">
          <i className="bi bi-telephone-fill text-success me-2"></i>
          Tel: <span className="fw-bold text-primary">04-6633-9457</span>
        </p>
      </section>

      <footer className="bg-dark text-white text-center py-4 mt-5">
        <p className="mb-0 text-white-50">c 2026 HealthyMeal. All rights reserved.</p>
        <small className="text-white-50">Made with React</small>
      </footer>
    </>
  );
}

