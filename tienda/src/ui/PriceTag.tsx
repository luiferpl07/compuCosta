import { twMerge } from "tailwind-merge";
import FormatoPrecio from "./FormatoPrecio";

interface Props {
  precio?: number;
  precioDescuento?: number;
  className?: string;
}

const PriceTag = ({ precio, precioDescuento, className }: Props) => {
  return (
    <div className={twMerge("flex items-center gap-2", className)}>
      <p className="line-through text-gray-500 font-medium">
        <FormatoPrecio amount={precio} />
      </p>
      <p className="font-bold text-skyText">
        <FormatoPrecio amount={precioDescuento} />
      </p>
    </div>
  );
};

export default PriceTag;
