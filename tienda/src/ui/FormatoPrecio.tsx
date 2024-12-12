const FormatoPrecio = ({ amount }: { amount?: number }) => {
  const formatoCantidad = new Number(amount).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0, // Generalmente no se muestran centavos en COP
  });
  return <span>{formatoCantidad}</span>;
};

export default FormatoPrecio;
