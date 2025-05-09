import PropertyCard from './PropertyCard';

export default function FeaturedProperties() {
  return (
    <div className="container py-4">
      <h1 className="text-center mb-5 fw-bold">Propiedades Destacadas</h1>
      <div className="row justify-content-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-12 col-md-4 d-flex justify-content-center mb-4">
            <PropertyCard />
          </div>
        ))}
      </div>
    </div>
  );
}