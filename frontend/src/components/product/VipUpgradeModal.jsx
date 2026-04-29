import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useVipUpgradeLogic from "@/hooks/productHooks/useVipUpgradeLogic";
import ChoosePlanView from "./vipUpdgrade/ChoosePlanView";
import PaymentView from "./vipUpdgrade/PaymentView";

export default function VipUpgradeModal({
  open,
  onOpenChange,
  product,
  onPaidRefresh,
}) {
  const {
    selectedPlan,
    setSelectedPlan,
    step,
    submitting,
    checkoutUrl,
    countdown,
    handlePay,
    plan,
    iframeRef,
    handleIframeLoad,
    handleCancelTransaction,
  } = useVipUpgradeLogic({ open, onOpenChange, product, onPaidRefresh });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0 overflow-hidden flex flex-col",
          step === "pay"
            ? "h-[min(90vh,720px)] max-h-[min(90vh,720px)] w-[min(100%-0.5rem,42rem)] sm:max-w-2xl"
            : "max-w-[min(100%-1rem,28rem)] sm:max-w-md",
        )}
        showCloseButton
      >
        {step === "choose" ? (
          <ChoosePlanView
            product={product}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            submitting={submitting}
            handlePay={handlePay}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <PaymentView
            plan={plan}
            product={product}
            countdown={countdown}
            checkoutUrl={checkoutUrl}
            iframeRef={iframeRef}
            handleIframeLoad={handleIframeLoad}
            onCancel={handleCancelTransaction}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
