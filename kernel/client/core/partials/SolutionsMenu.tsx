import { TbGridDots } from "react-icons/tb";

const SolutionsMenu = () => {
  return (
    <div className="relative">
      <button className={`
        p-[0.6rem] text-gray-800 rounded-full cursor-pointer transition-colors duration-350
        border-1 border-transparent hover:border-gray-200 hover:bg-gray-100
      `}>
        <TbGridDots size={18} />
      </button>
    </div>
  );
};

export default SolutionsMenu
