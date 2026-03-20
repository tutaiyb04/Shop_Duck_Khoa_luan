import React, { useState } from 'react';
import ReviewModal from './ReviewModal'; // Nhớ check lại đường dẫn này
import UserSidebar from "@/components/shared/UserSidebar";

const Orders = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

  const mockOrders = [
    { id: 'DH12345', productName: 'iPhone 12 Pro Max cũ', price: '12.500.000đ', status: 'Đã giao', sellerId: '65f1a2b00000000000000001', productId: '111000000000000000000001' },
    { id: 'DH12346', productName: 'Bàn phím cơ Keychron', price: '1.200.000đ', status: 'Đang giao', sellerId: '65f1a2c0000000000000002', productId: '222000000000000000000002' },
    { id: 'DH12347', productName: 'Chuột Logitech G102', price: '350.000đ', status: 'Chờ xác nhận', sellerId: '65f1a2d0000000000000003', productId: '333000000000000000000003' },
    { id: 'DH12348', productName: 'Màn hình Dell Ultrasharp', price: '4.500.000đ', status: 'Đã hủy', sellerId: '65f1a2e000000000000004', productId: '444000000000000000000004' },
  ];

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === 'Tất cả') return true;
    return order.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-10 mb-20">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* CỘT TRÁI: GỌI SIDEBAR */}
        <UserSidebar />

        {/* CỘT PHẢI: NỘI DUNG ĐƠN HÀNG */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Đơn hàng của tôi</h1>
          
          {/* Thanh Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 whitespace-nowrap font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Bảng đơn hàng (giữ nguyên cấu trúc của bạn) */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Mã đơn</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Sản phẩm</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Tổng tiền</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Trạng thái</th>
                  <th className="py-3 px-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-5 border-b border-gray-200 text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="py-5 px-5 border-b border-gray-200 text-sm text-gray-700">{order.productName}</td>
                      <td className="py-5 px-5 border-b border-gray-200 text-sm text-red-600 font-semibold">{order.price}</td>
                      <td className="py-5 px-5 border-b border-gray-200 text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Đã giao' ? 'bg-green-100 text-green-700' :
                          order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Chờ xác nhận' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-5 px-5 border-b border-gray-200 text-center text-sm">
                        {order.status === 'Đã giao' ? (
                          <ReviewModal sellerId={order.sellerId} productId={order.productId} />
                        ) : (
                          <span className="text-gray-400 italic">Không khả dụng</span>
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

      </div>
    </div>
  );
};

export default Orders;