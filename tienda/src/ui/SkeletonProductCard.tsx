const SkeletonProductCard = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-1 overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-200 rounded-md mb-3" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-8 bg-gray-200 rounded w-full" />
    </div>
  );
};

export default SkeletonProductCard;
