import "./property-detail.css";

export default function PropertyLoading() {
  return (
    <>
      <div className="property-detail container pt-3 pb-5">
        <nav aria-label="breadcrumb" className="mb-2">
          <div className="placeholder-glow">
            <span className="placeholder col-4"></span>
          </div>
        </nav>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-7">
            <div className="carousel-image-container position-relative rounded-2 overflow-hidden">
              <div className="placeholder-glow bg-light w-100 h-100">
                <span className="placeholder w-100 h-100 d-block"></span>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5 placeholder-glow">
            <div className="d-flex gap-2 mb-2">
              <span className="placeholder rounded-pill" style={{ width: 60, height: 22 }}></span>
              <span className="placeholder rounded-pill" style={{ width: 80, height: 22 }}></span>
            </div>
            <span className="placeholder col-10 d-block mb-2" style={{ height: 28 }}></span>
            <span className="placeholder col-7 d-block mb-2"></span>
            <span className="placeholder col-5 d-block mb-3"></span>
            <span className="placeholder col-12 d-block mb-3" style={{ height: 56 }}></span>
            <span className="placeholder col-12 d-block rounded" style={{ height: 96 }}></span>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 col-lg-8 placeholder-glow">
            <span className="placeholder col-3 d-block mb-3" style={{ height: 24 }}></span>
            <span className="placeholder col-12 d-block mb-2"></span>
            <span className="placeholder col-11 d-block mb-2"></span>
            <span className="placeholder col-10 d-block mb-2"></span>
            <span className="placeholder col-9 d-block"></span>
          </div>
        </div>
      </div>
      <div className="w-100">
        <div className="placeholder-glow bg-light" style={{ width: "100%", height: "450px" }}>
          <span className="placeholder w-100 h-100 d-block"></span>
        </div>
      </div>
    </>
  );
}
