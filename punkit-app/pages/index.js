import { useState, useRef } from 'react';
import Head from 'next/head';
import PixelAvatar from '../components/PixelAvatar';

export default function Home() {
  const [originalImage, setOriginalImage] = useState(null);
  const [punkImage, setPunkImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [farcasterUsername, setFarcasterUsername] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setPunkImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFarcasterLoad = async () => {
    if (!farcasterUsername.trim()) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, you'd fetch from Farcaster API
      // For demo, we'll use a placeholder
      const response = await fetch(`/api/farcaster-avatar?username=${farcasterUsername}`);
      const data = await response.json();
      
      if (data.avatarUrl) {
        setOriginalImage(data.avatarUrl);
        setPunkImage(null);
      }
    } catch (error) {
      console.error('Error loading Farcaster avatar:', error);
      alert('Error loading Farcaster avatar. Please try uploading an image instead.');
    }
    setIsLoading(false);
  };

  const handleGeneratePunk = async () => {
    if (!originalImage) return;
    
    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load and process image
      const img = new Image();
      img.onload = async () => {
        // Detect face using face-api.js
        await detectAndCropFace(img, canvas, ctx);
      };
      img.src = originalImage;
    } catch (error) {
      console.error('Error generating punk:', error);
      alert('Error generating punk avatar. Please try another image.');
    }
  };

  const detectAndCropFace = async (img, canvas, ctx) => {
    try {
      // Load face-api models (in production, these should be pre-loaded)
      const { detectSingleFace, nets } = await import('face-api.js');
      
      await nets.tinyFaceDetector.loadFromUri('/models');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const detection = await detectSingleFace(canvas, new window.faceapi.TinyFaceDetectorOptions());
      
      if (detection) {
        const { x, y, width, height } = detection.box;
        
        // Crop and process the face
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        
        // Expand crop area slightly to include more of head
        const expand = width * 0.3;
        const cropX = Math.max(0, x - expand);
        const cropY = Math.max(0, y - expand);
        const cropWidth = Math.min(canvas.width - cropX, width + expand * 2);
        const cropHeight = Math.min(canvas.height - cropY, height + expand * 2);
        
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        // Convert to data URL and set as punk image
        const processedImage = croppedCanvas.toDataURL('image/png');
        setPunkImage(processedImage);
      } else {
        alert('No face detected. Please try another image.');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      // Fallback: use center crop
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      croppedCanvas.width = size;
      croppedCanvas.height = size;
      croppedCtx.drawImage(img, x, y, size, size, 0, 0, size, size);
      
      const processedImage = croppedCanvas.toDataURL('image/png');
      setPunkImage(processedImage);
    }
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!punkImage) return;
    
    const link = document.createElement('a');
    link.download = 'PunkIT.png';
    link.href = punkImage;
    link.click();
  };

  const handleCast = async () => {
    if (!punkImage) return;
    
    try {
      const response = await fetch('/api/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: punkImage,
          username: farcasterUsername || 'anonymous',
        }),
      });
      
      if (response.ok) {
        alert('Punk avatar cast to Farcaster!');
      } else {
        alert('Error casting to Farcaster. Please try again.');
      }
    } catch (error) {
      console.error('Error casting:', error);
      alert('Error casting to Farcaster. Please try again.');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>PunkIT - Farcaster Pixel Avatar Generator</title>
        <meta name="description" content="Transform your Farcaster avatar into a CryptoPunks-style pixel avatar" />
        <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
      </Head>

      <main>
        <header className="header">
          <h1>PunkIT</h1>
          <p>Transform your Farcaster avatar into a CryptoPunks-style pixel avatar</p>
        </header>

        <div className="content">
          <div className="input-section">
            <div className="upload-methods">
              <div className="upload-method">
                <h3>Upload Image</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="button secondary"
                >
                  Choose File
                </button>
              </div>
              
              <div className="divider">OR</div>
              
              <div className="upload-method">
                <h3>Load from Farcaster</h3>
                <div className="farcaster-input">
                  <input
                    type="text"
                    placeholder="Enter Farcaster username"
                    value={farcasterUsername}
                    onChange={(e) => setFarcasterUsername(e.target.value)}
                    className="input"
                  />
                  <button 
                    onClick={handleFarcasterLoad}
                    className="button secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load Avatar'}
                  </button>
                </div>
              </div>
            </div>

            {originalImage && (
              <div className="preview-section">
                <div className="image-preview">
                  <h4>Original</h4>
                  <img src={originalImage} alt="Original" className="preview-image" />
                </div>
                
                <button 
                  onClick={handleGeneratePunk}
                  disabled={isLoading}
                  className="button primary generate-button"
                >
                  {isLoading ? 'Generating...' : 'Generate Punk'}
                </button>
              </div>
            )}
          </div>

          {punkImage && (
            <div className="result-section">
              <div className="punk-result">
                <h3>Your PunkIT Avatar</h3>
                <div className="punk-container">
                  <PixelAvatar 
                    src={punkImage} 
                    width={400}
                    height={400}
                  />
                </div>
                
                <div className="action-buttons">
                  <button onClick={handleDownload} className="button primary">
                    Download Image
                  </button>
                  <button onClick={handleCast} className="button accent">
                    Cast It on Farcaster
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header h1 {
          font-size: 3rem;
          color: #ff6b35;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .header p {
          font-size: 1.2rem;
          color: #666;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .input-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .upload-methods {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .upload-method {
          text-align: center;
        }

        .upload-method h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .divider {
          color: #999;
          font-weight: bold;
        }

        .farcaster-input {
          display: flex;
          gap: 0.5rem;
          flex-direction: column;
        }

        .input {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
        }

        .preview-section {
          text-align: center;
          border-top: 1px solid #e1e5e9;
          padding-top: 2rem;
        }

        .image-preview {
          margin-bottom: 1.5rem;
        }

        .image-preview h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .preview-image {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
        }

        .result-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .punk-result {
          text-align: center;
        }

        .punk-result h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .punk-container {
          display: inline-block;
          border: 4px solid #ff6b35;
          border-radius: 12px;
          padding: 1rem;
          background: #f8f9fa;
          margin-bottom: 2rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button.primary {
          background: #ff6b35;
          color: white;
        }

        .button.primary:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .button.secondary {
          background: #e1e5e9;
          color: #333;
        }

        .button.secondary:hover:not(:disabled) {
          background: #d1d5d9;
        }

        .button.accent {
          background: #4a90e2;
          color: white;
        }

        .button.accent:hover:not(:disabled) {
          background: #357abd;
          transform: translateY(-2px);
        }

        .generate-button {
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        @media (max-width: 768px) {
          .upload-methods {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          
          .divider {
            order: 2;
          }
          
          .upload-method:last-child {
            order: 3;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}