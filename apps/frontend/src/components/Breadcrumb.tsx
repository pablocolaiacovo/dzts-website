import Link from "next/link";
import "./Breadcrumb.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isHome?: boolean;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb mb-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.href) {
            return (
              <li
                key={index}
                className="breadcrumb-item active"
                aria-current="page"
              >
                {item.label}
              </li>
            );
          }

          return (
            <li key={index} className="breadcrumb-item">
              <Link href={item.href}>
                {item.isHome ? (
                  <>
                    <i className="bi bi-house-door-fill" aria-hidden="true"></i>
                    <span className="visually-hidden">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
