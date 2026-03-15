import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";

function AvatarUpload({ user, previewImage, onFileSelect, className }) {
  // Hàm xử lý khi người dùng chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Cảnh báo quá 5MB theo SRS
        toast.error("Vui lòng chọn ảnh có kích thước dưới 5MB!");
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <Avatar className="h-40 w-40 object-cover">
        <AvatarImage src={previewImage} />
        <AvatarFallback>
          {user.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="max-w-xs cursor-pointer"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
}

export default AvatarUpload;
