const Spinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex justify-center items-center">
      <div className={`border-t-4 border-indigo-500 border-solid rounded-full animate-spin ${spinnerClass}`}></div>
    </div>
  );
};

export default Spinner;