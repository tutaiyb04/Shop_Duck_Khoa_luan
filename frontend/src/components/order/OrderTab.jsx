function OrderTab({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`py-2 px-4 whitespace-nowrap font-medium text-sm transition-colors ${
            activeTab === tab
              ? "border-b-2 border-amber-500 text-amber-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default OrderTab;
