import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import { uploadPDF } from '../api/client';
import { FileText, Shield, Zap } from 'lucide-react';
import './UploadPDF.css';

export default function UploadPDF() {
  const handleUpload = async (file, onProgress) => {
    const res = await uploadPDF(file, onProgress);
    return res.data;
  };

  return (
    <>
      <Header
        title="Upload Document"
        subtitle="Add medical PDFs to your knowledge base"
      />

      <div className="page-content">
        <div className="upload-page-layout">
          {/* Main upload area */}
          <div className="upload-main">
            <FileUploader onUpload={handleUpload} />
          </div>

          {/* Info sidebar */}
          <aside className="upload-info">
            <div className="upload-info-card glass-card-solid">
              <h4>How it works</h4>
              <div className="upload-steps">
                <div className="upload-step">
                  <div className="upload-step-num">1</div>
                  <div>
                    <p className="upload-step-title">Upload</p>
                    <p className="upload-step-desc">
                      Drop your PDF — text is extracted automatically
                    </p>
                  </div>
                </div>
                <div className="upload-step">
                  <div className="upload-step-num">2</div>
                  <div>
                    <p className="upload-step-title">Process</p>
                    <p className="upload-step-desc">
                      Text is chunked and embedded using MiniLM-L6-v2
                    </p>
                  </div>
                </div>
                <div className="upload-step">
                  <div className="upload-step-num">3</div>
                  <div>
                    <p className="upload-step-title">Index</p>
                    <p className="upload-step-desc">
                      Embeddings stored in FAISS for fast semantic search
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="upload-features">
              <div className="upload-feature">
                <FileText size={18} />
                <span>PDF only · Max 10 MB</span>
              </div>
              <div className="upload-feature">
                <Zap size={18} />
                <span>Auto-ingest on upload</span>
              </div>
              <div className="upload-feature">
                <Shield size={18} />
                <span>Local processing — no data leaves your server</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
