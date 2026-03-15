import FacebookLogin from "@greatsumini/react-facebook-login";
import { Button } from "@/components/ui/button";

function SocialForm({ handleGoogleLogin, onFacebookSuccess, setIsPhoneMode }) {
  return (
    <div className="space-y-3 mt-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 font-medium">Hoặc</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => handleGoogleLogin()}
        className="w-full flex items-center justify-center gap-2 !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Tiếp tục bằng Google
      </Button>

      <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
        fields="name, email, picture"
        onSuccess={onFacebookSuccess}
        onFail={(error) => {
          console.log("Lỗi: ", error);
        }}
        render={({ onClick }) => (
          <Button
            type="button"
            onClick={onClick}
            className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            Tiếp tục bằng Facebook
          </Button>
        )}
      />

      <Button
        type="button"
        className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
        onClick={() => {
          setIsPhoneMode(true);
        }}
      >
        Tiếp tục với số điện thoại
      </Button>
    </div>
  );
}

export default SocialForm;
