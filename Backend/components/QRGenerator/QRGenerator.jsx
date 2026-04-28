import { useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRGenerator.css';

/**
 * QRGenerator — generates a QR code for service check-in.
 * QR encodes: {origin}/checkin?serviceId={serviceId}
 *
 * @param {string} serviceId
 * @param {string} serviceName
 */
const QRGenerator = ({ serviceId, serviceName }) => {
  const qrRef = useRef(null);
  const checkinUrl = `${window.location.origin}/checkin?serviceId=${serviceId}`;

  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `queueless-${serviceName || serviceId}-qr.png`;
    link.click();
  }, [serviceId, serviceName]);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(checkinUrl).then(() => {
      alert('Check-in URL copied to clipboard!');
    });
  }, [checkinUrl]);

  return (
    <div className="qr-generator">
      <h3 className="qr-generator-title">Service QR Code</h3>

      <div className="qr-generator-canvas" ref={qrRef}>
        <QRCodeCanvas
          value={checkinUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#0a0f1a"
          level="H"
          includeMargin={false}
        />
      </div>

      <p className="qr-generator-url">{checkinUrl}</p>

      <div className="qr-generator-actions">
        <button className="btn btn-primary btn-sm" onClick={handleDownload}>
          Download QR
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleCopyUrl}>
          Copy URL
        </button>
      </div>
    </div>
  );
};

export default QRGenerator;
