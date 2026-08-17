'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CropArea } from '@/lib/image';
import { Loader2 } from 'lucide-react';

export function ImageCropModal({
  open,
  onOpenChange,
  imageSrc,
  cropShape,
  aspect,
  isProcessing,
  onCropComplete,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  cropShape: 'round' | 'rect';
  aspect: number | undefined;
  isProcessing: boolean;
  onCropComplete: (croppedAreaPixels: CropArea) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const handleCropDone = useCallback(
    (_: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    },
    [],
  );

  function handleConfirm() {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isProcessing) onCancel();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect ?? 4 / 3}
              cropShape={cropShape}
              showGrid={cropShape === 'rect'}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropDone}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              'Crop & Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
