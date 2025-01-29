export const increaseQuantity = (quantity: number, setQuantity: React.Dispatch<React.SetStateAction<number>>) => {
    setQuantity(quantity + 1); // Aumenta la cantidad
  };
  
  export const decreaseQuantity = (quantity: number, setQuantity: React.Dispatch<React.SetStateAction<number>>) => {
    if (quantity > 1) {
      setQuantity(quantity - 1); // Disminuye la cantidad solo si es mayor que 1
    }
  };