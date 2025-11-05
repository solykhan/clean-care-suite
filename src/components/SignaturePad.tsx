import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface SignaturePadProps {
  onEnd?: () => void;
}

export interface SignaturePadRef {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
  fromDataURL: (dataUrl: string) => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onEnd }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
      },
      toDataURL: () => {
        return sigCanvas.current?.toDataURL() || "";
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      fromDataURL: (dataUrl: string) => {
        if (sigCanvas.current && dataUrl) {
          sigCanvas.current.fromDataURL(dataUrl);
        }
      },
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
    };

    return (
      <div className="space-y-2">
        <div className="border-2 border-muted rounded-lg bg-background relative">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-[200px] touch-none",
              style: { touchAction: "none" },
            }}
            backgroundColor="rgba(255, 255, 255, 1)"
            penColor="black"
            onEnd={onEnd}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
            Sign here
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear Signature
        </Button>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
