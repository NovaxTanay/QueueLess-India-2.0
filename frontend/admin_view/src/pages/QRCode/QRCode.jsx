// ============================================
// QR Code — Generate & download service QR
// ============================================

import { useRef } from 'react';
import { useAuth } from '@backend/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './QRCode.css';

const QRCodePage = () => {
  const { user, activeService, activeServiceId } = useAuth();
  const qrRef = useRef(null);

  const userAppUrl = import.meta.env.VITE_USER_URL || 'http://localhost:5173';
  const qrValue = activeServiceId
    ? `${userAppUrl}/checkin?serviceId=${activeServiceId}`
    : '';

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `queueless-qr-${activeService?.name || 'service'}.png`;
    link.click();
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>QueueLess QR Code — ${activeService?.name || ''}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;">
          <h1 style="margin-bottom:8px;">${activeService?.name || 'Service'}</h1>
          <p style="color:#64748b;margin-bottom:24px;">Scan to join the queue</p>
          <img src="${url}" style="width:300px;height:300px;" />
          <p style="margin-top:24px;color:#94a3b8;font-size:12px;">Powered by QueueLess India</p>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (!activeServiceId) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <Topbar />
        <main className="page-content">
          <div className="loading-container">
            <p>No service selected. Please create or select a service.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar />

      <main className="page-content">
        <div className="qr-page fade-in">
          <h1>QR Code</h1>
          <p className="qr-subtitle">Share this QR code for customers to join your queue</p>

          <div className="qr-content">
            <div className="qr-card card">
              <div className="qr-preview" ref={qrRef}>
                {qrValue && (
                  <QRCodeCanvas
                    value={qrValue}
                    size={240}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <div className="qr-service-name">{activeService?.name}</div>
              <div className="qr-service-url">{qrValue}</div>

              <div className="qr-actions">
                <button className="btn btn-primary" onClick={handleDownload}>
                  📥 Download PNG
                </button>
                <button className="btn btn-secondary" onClick={handlePrint}>
                  🖨️ Print
                </button>
              </div>
            </div>

            <div className="qr-instructions card">
              <h3>How to use</h3>
              <div className="qr-instructions-list">
                <div className="qr-instruction-item">
                  <span className="qr-instruction-num">1</span>
                  <div>
                    <strong>Download or Print</strong>
                    <p>Save the QR code and display it at your service location</p>
                  </div>
                </div>
                <div className="qr-instruction-item">
                  <span className="qr-instruction-num">2</span>
                  <div>
                    <strong>Customers Scan</strong>
                    <p>Users scan the QR code with their phone camera</p>
                  </div>
                </div>
                <div className="qr-instruction-item">
                  <span className="qr-instruction-num">3</span>
                  <div>
                    <strong>Auto Check-in</strong>
                    <p>They are automatically added to your queue with a token</p>
                  </div>
                </div>
                <div className="qr-instruction-item">
                  <span className="qr-instruction-num">4</span>
                  <div>
                    <strong>Manage Queue</strong>
                    <p>Use the Queue Management page to call and serve customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodePage;
