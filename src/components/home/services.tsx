import { services } from "@/lib/sample-data";

export function Services() {
  return (
    <section aria-labelledby="services-title" className="hairline-t">
      <div className="page-container section-y">
        <h2 id="services-title" className="sr-only">
          Client services
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <li key={service.title} className="text-center">
              <h3 className="type-label">{service.title}</h3>
              <p className="type-body-sm mx-auto mt-2 max-w-60 text-fg-muted">{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
