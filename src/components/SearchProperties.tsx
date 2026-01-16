'use client';
import Image from 'next/image';
import './SearchProperties.css';

export default function SearchProperties() {
  return (
    <section className="hero min-vh-100 w-100 overflow-hidden position-relative text-white d-flex align-items-center justify-content-center">
      {/* Imagen de fondo */}
      <Image
        src="/Images/backgroun.jpg"
        alt="Imagen de fondo del formulario de búsqueda"
        fill
        className="object-cover z-n1"
        priority
      />

      {/* Overlay oscuro */}
      <div className="overlay position-absolute top-0 start-0 w-100 h-100 z-0"></div>

      {/* Contenido centrado */}
      <div className="container position-relative z-1 text-center">
        <div className="row pb-4">
          <div className="col-12 col-md-3 logo-container pb-4 mx-auto position-relative">
            <Image
              src="/Images/logoDzts.png"
              alt="Logo DZTS"
              fill
              className="logo-image"
              priority
            />
          </div>
          <h1 className="text-center">Encontrá la propiedad a medida</h1>
        </div>

        <div className="row gap-4 pb-4 flex-wrap flex-md-nowrap justify-content-center">
          <div className="col-12 col-md-3">
            <label htmlFor="operacion" className="visually-hidden">Operación</label>
            <select id="operacion" className="form-select ">
              <option value="">Operación</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="propiedad" className="visually-hidden">Propiedad</label>
            <select id="propiedad" className="form-select ">
              <option value="">Propiedad</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="localidad" className="visually-hidden">Localidad</label>
            <select id="localidad" className="form-select ">
              <option value="">Localidad</option>
              <option value="palermo">Palermo</option>
              <option value="belgrano">Belgrano</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="dormitorios" className="visually-hidden">Dormitorios</label>
            <select id="dormitorios" className="form-select ">
              <option value="">Dormitorios</option>
              <option value="1">1 dormitorio</option>
              <option value="2">2 dormitorios</option>
              <option value="3">3 dormitorios</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button type="button" className="btn btn-lg btn-outline-primary bg-secondary fw-semibold">Buscar</button>
        </div>
      </div>
    </section>
  );
}
