import React, { useState } from 'react';
import ReviewModal from '../components/profile/ReviewModal'; // Nhớ check lại đường dẫn này

const Orders = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

  const mockOrders = [
    { id: 'DH12345', productName: 'iPhone 12 Pro Max cũ', price: '12.500.000đ', status: 'Đã giao', sellerId: '65f1a2b', productId: '111' },
    { id: 'DH12346', productName: 'Bàn phím cơ Keychron', price: '1.200.000đ', status: 'Đang giao', sellerId: '65f1a2c', productId: '222' },
    { id: 'DH12347', productName: 'Chuột Logitech G102', price: '350.000đ', status: 'Chờ xác nhận', sellerId: '65f1a2d', productId: '333' },
    { id: 'DH12348', productName: 'Màn hình Dell Ultrasharp', price: '4.500.000đ', status: 'Đã hủy', sellerId: '65f1a2e', productId: '444' },
  ];

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === 'Tất cả') return true;
    return order.status === activeTab;
  });

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-left">Quản lý đơn mua</h2>
      
      {/* Thanh Menu Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-amber-500 text-amber-600'
                : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bảng danh sách đơn hàng đã được nâng cấp Style */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {/* Thêm border-r để tạo vạch ngăn cách dọc, tăng padding (py-4, px-5) để rộng hơn */}
              <th className="py-4 px-5 font-bold border-b-2 border-r border-gray-200">Mã đơn</th>
              <th className="py-4 px-5 font-bold border-b-2 border-r border-gray-200">Sản phẩm</th>
              <th className="py-4 px-5 font-bold border-b-2 border-r border-gray-200">Tổng tiền</th>
              <th className="py-4 px-5 font-bold border-b-2 border-r border-gray-200">Trạng thái</th>
              <th className="py-4 px-5 font-bold border-b-2 border-gray-200 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                  {/* Các ô (td) đều có viền dưới và viền phải, đệm to ra (py-5) */}
                  <td className="py-5 px-5 border-b border-r border-gray-200 font-medium text-gray-900">{order.id}</td>
                  <td className="py-5 px-5 border-b border-r border-gray-200 text-gray-700">{order.productName}</td>
                  <td className="py-5 px-5 border-b border-r border-gray-200 text-red-500 font-bold">{order.price}</td>
                  <td className="py-5 px-5 border-b border-r border-gray-200">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                      order.status === 'Đã hoàn thành' ? 'bg-green-100 text-green-700' :
                      order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Chờ xác nhận' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 px-5 border-b border-gray-200 text-center">
                    {order.status === 'Đã giao' ? (
                      <ReviewModal 
                        sellerId={order.sellerId} 
                        productId={order.productId} 
                      />
                    ) : (
                      <span className="text-gray-400 text-sm italic">Không khả dụng</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500 border-b border-gray-200">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl mb-3">🦆</span>
                    <p className="text-lg">Chưa có đơn hàng nào ở trạng thái này.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;