import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import DemoPDFCard from '../components/DemoPDFCard';
import { uploadPDF, getDemoPDFs } from '../api/client';
import { FileText, Shield, Zap, Library } from 'lucide-react';
import './UploadPDF.css';

export default function UploadPDF() {
  const navigate = useNavigate();
  const [demoPDFs, setDemoPDFs] = useState([]);
  const [demoLoading, setDemoLoading] = useState(true);
  const [demoError, setDemoError] = useState(false);

  // Fetch demo PDF list on mount
  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const res = await getDemoPDFs();
        const data = res.data;
        setDemoPDFs(Array.isArray(data) ? data : []);
      } catch {
        setDemoError(true);
      } finally {
        setDemoLoading(false);
      }
    };
    fetchDemos();
  }, []);

  const handleUpload = async (file, onProgress) => {
    const res = await uploadPDF(file, onProgress);
    return res.data;
  };

  const handleDemoSuccess = () => {
    // Callback when a demo PDF is successfully ingested — can be used
    // for future page-level state (e.g. showing a banner)
  };

  return (
    <>
      <Header
        title="Upload Document"
        subtitle="Add medical PDFs to your knowledge base"
      />

      <div className="page-content">
        <div className="upload-page-layout">
          {/* ---- Main column ---- */}
          <div className="upload-main">

            {/* === Demo PDF Library === */}
            <section className="demo-section">
              <div className="demo-section-header">
                <div className="demo-section-title-row">
                  <Library size={20} className="demo-section-icon" />
                  <h3 className="demo-section-title">Choose a Demo PDF</h3>
                </div>
                <p className="demo-section-subtitle">
                  Instantly load a sample document — no upload required.
                </p>
              </div>

              {/* Loading skeletons */}
              {demoLoading && (
                <div className="demo-grid">
                  {[1, 2].map((i) => (
                    <div key={i} className="demo-card-skeleton loading-skeleton" />
                  ))}
                </div>
              )}

              {/* Error fetching list */}
              {!demoLoading && demoError && (
                <p className="demo-fetch-error">
                  Could not load demo PDFs. Make sure the backend is running.
                </p>
              )}

              {/* No PDFs found */}
              {!demoLoading && !demoError && demoPDFs.length === 0 && (
                <p className="demo-fetch-error">
                  No demo PDFs found in the uploads folder.
                </p>
              )}

              {/* Cards */}
              {!demoLoading && !demoError && demoPDFs.length > 0 && (
                <div className="demo-grid">
                  {demoPDFs.map((pdf, idx) => (
                    <DemoPDFCard
                      key={pdf.filename}
                      filename={pdf.filename}
                      description={pdf.description}
                      sizeBytes={pdf.size_bytes}
                      onSuccess={handleDemoSuccess}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* === OR Divider === */}
            <div className="upload-divider">
              <span className="upload-divider-line" />
              <span className="upload-divider-label">OR</span>
              <span className="upload-divider-line" />
            </div>

            {/* === Normal Upload === */}
            <section className="upload-own-section">
              <div className="demo-section-header">
                <h3 className="demo-section-title">Upload Your Own PDF</h3>
                <p className="demo-section-subtitle">
                  Drag &amp; drop or browse your own medical documents.
                </p>
              </div>
              <FileUploader onUpload={handleUpload} />
            </section>
          </div>

          {/* ---- Info sidebar ---- */}
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
