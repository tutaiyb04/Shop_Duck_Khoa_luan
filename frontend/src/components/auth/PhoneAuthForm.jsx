import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";

function PhoneAuthForm({
  isOtpSent,
  phoneNumber,
  setPhoneNumber,
  handleSendOtp,
  otpCode,
  setOtpCode,
  handleVerifyOtp,
  setIsPhoneMode,
}) {
  return (
    <div className="space-y-4">
      {!isOtpSent ? (
        <>
          <FieldLabel>Nhập số điện thoại của bạn</FieldLabel>
          <PhoneInput
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={setPhoneNumber}
            defaultCountry="VN"
            international={true}
            withCountryCallingCode={true}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-within:ring-0 focus-within:border-yellow-500"
          />
          <Button
            type="button"
            className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
            onClick={() => handleSendOtp(phoneNumber)}
          >
            Gửi mã OTP
          </Button>
        </>
      ) : (
        <>
          <FieldLabel>Nhập mã xác nhận (6 số)</FieldLabel>
          <Input
            placeholder="Nhập mã OTP..."
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="!ring-0 focus-visible:border-yellow-500"
          />
          <Button
            type="button"
            className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
            onClick={() => handleVerifyOtp(phoneNumber)}
          >
            Xác nhận mã OTP
          </Button>
        </>
      )}

      <Button
        type="button"
        className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none font-medium"
        onClick={() => setIsPhoneMode(false)}
      >
        Quay lại đăng ký bằng Email
      </Button>

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PhoneAuthForm;
