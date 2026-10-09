export const OPERATION_BADGE_CLASS = "bg-primary text-white";

export const PROPERTY_STATUS: Record<
  string,
  { label: string; badgeClass: string }
> = {
  reservado: { label: "Reservado", badgeClass: "bg-warning text-white" },
  vendido: { label: "Vendido", badgeClass: "bg-danger text-white" },
  alquilado: { label: "Alquilado", badgeClass: "bg-success text-white" },
};

export function getOperationLabel(operationType: string): string {
  return operationType === "venta" ? "Venta" : "Alquiler";
}
