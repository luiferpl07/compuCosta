const LoadingSpinner = () => {
  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-textoRojo rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-600">Cargando...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;