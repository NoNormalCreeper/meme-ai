import { MemeResult } from "../types";

interface ResultDisplayProps {
  result: MemeResult | null;
  isLoading: boolean;
}

const ResultDisplay = ({ result, isLoading }: ResultDisplayProps) => {
  const getStyleForResult = (res: string) => {
    switch (res) {
      case "🍭":
        return "bg-gradient-to-br from-pink-100 to-rose-200 text-pink-600";
      case "艾斯比":
        return "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 font-mono";
      case "无敌了":
        return "bg-gradient-to-br from-amber-100 to-orange-200 text-orange-700";
      case "何意味":
        return "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-800 italic";
      case "爆了":
        return "bg-gradient-to-br from-red-100 to-red-300 text-red-700 font-black";
      case "[续标识]":
        return "bg-gradient-to-br from-green-100 to-emerald-200 text-emerald-800";
      case "6":
        return "bg-gradient-to-br from-blue-100 to-cyan-200 text-blue-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 sm:h-64 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium tracking-wide">AI 正在思考...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full h-48 sm:h-64 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-8 text-center">
        <div className="text-gray-400">
          <p className="text-lg">输入文本，获取你的专属词</p>
        </div>
      </div>
    );
  }

  const resultStyle = getStyleForResult(result);

  return (
    <div className={`w-full h-48 sm:h-64 rounded-2xl flex flex-col items-center justify-center p-6 shadow-inner transition-all duration-500 transform ${resultStyle}`}>
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <span className="block text-sm uppercase tracking-wider opacity-60 mb-2 font-semibold">
          Result
        </span>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight drop-shadow-sm break-words leading-tight">
          {result}
        </h1>
      </div>
    </div>
  );
};

export default ResultDisplay;
