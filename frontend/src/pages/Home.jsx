function Home() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 w-screen">
      <div className="max-w-2xl text-center space-y-8">
        {/* Phần Header giới thiệu */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Duck Shop 🦆
          </h1>
          <p className="text-xl text-gray-600">
            Nền tảng mua bán đồ cũ thông minh. Tìm kiếm dễ dàng, giao dịch an
            toàn và nhanh chóng.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
