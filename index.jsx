import { useState, useRef } from 'react';
import Head from 'next/head';

export default function PunkIT() {
  const [originalImage, setOriginalImage] = useState(null);
  const [punkImage, setPunkImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleGeneratePunk = () => {
    if (!originalImage) return;
    
    setIsLoading(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const img = new Image();
        img.onload = () => {
          const punkDataURL = createPixelArt(img);
          setPunkImage(punkDataURL);
          setIsLoading(false);
        };
        img.src = originalImage;
      } catch (error) {
        console.error('Error generating punk:', error);
        setIsLoading(false);
      }
    }, 100);
  };

  const createPixelArt = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Draw solid background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    // Create smaller canvas for pixelation
    const pixelCanvas = document.createElement('canvas');
    const pixelCtx = pixelCanvas.getContext('2d');
    const pixelSize = 32;
    pixelCanvas.width = pixelSize;
    pixelCanvas.height = pixelSize;

    // Draw image to small canvas (this pixelates it)
    pixelCtx.drawImage(img, 0, 0, pixelSize, pixelSize);
    
    const imageData = pixelCtx.getImageData(0, 0, pixelSize, pixelSize);
    const data = imageData.data;

    // Punk color palette
    const punkColors = [
      '#1a1a1a', '#2d1e2f', '#663399', '#8b4513', 
      '#daa520', '#f0e68c', '#ff69b4', '#ff4500',
      '#32cd32', '#1e90ff', '#ffffff'
    ];

    // Draw pixelated image with limited palette
    const blockSize = size / pixelSize;
    
    for (let y = 0; y < pixelSize; y++) {
      for (let x = 0; x < pixelSize; x++) {
        const index = (y * pixelSize + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (a > 128) {
          const color = findClosestColor(r, g, b, punkColors);
          ctx.fillStyle = color;
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }

    // Add random punk features
    addPunkFeatures(ctx, pixelSize, blockSize);

    return canvas.toDataURL('image/png');
  };

  const findClosestColor = (r, g, b, palette) => {
    let closestColor = palette[0];
    let minDistance = Infinity;

    for (const color of palette) {
      const hex = color.replace('#', '');
      const pr = parseInt(hex.substr(0, 2), 16);
      const pg = parseInt(hex.substr(2, 2), 16);
      const pb = parseInt(hex.substr(4, 2), 16);

      const distance = Math.sqrt(
        Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor;
  };

  const addPunkFeatures = (ctx, gridSize, blockSize) => {
    const features = [];
    
    // Randomly add features (30% chance for each)
    if (Math.random() < 0.3) features.push('hair');
    if (Math.random() < 0.3) features.push('sunglasses');
    if (Math.random() < 0.3) features.push('cigarette');
    if (Math.random() < 0.3) features.push('beard');

    features.forEach(feature => {
      switch (feature) {
        case 'hair':
          drawHair(ctx, gridSize, blockSize);
          break;
        case 'sunglasses':
          drawSunglasses(ctx, gridSize, blockSize);
          break;
        case 'cigarette':
          drawCigarette(ctx, gridSize, blockSize);
          break;
        case 'beard':
          drawBeard(ctx, gridSize, blockSize);
          break;
      }
    });
  };

  const drawHair = (ctx, gridSize, blockSize) => {
    const colors = ['#1a1a1a', '#8b4513', '#663399', '#2d1e2f'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    
    for (let x = 8; x < 24; x++) {
      for (let y = 4; y < 8; y++) {
        if (Math.random() < 0.7) {
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
  };

  const drawSunglasses = (ctx, gridSize, blockSize) => {
    ctx.fillStyle = '#1a1a1a';
    
    // Left lens
    for (let x = 9; x < 13; x++) {
      for (let y = 14; y < 16; y++) {
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
    
    // Right lens
    for (let x = 19; x < 23; x++) {
      for (let y = 14; y < 16; y++) {
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  };

  const drawCigarette = (ctx, gridSize, blockSize) => {
    // Cigarette
    ctx.fillStyle = '#ffffff';
    for (let x = 18; x < 22; x++) {
      ctx.fillRect(x * blockSize, 20 * blockSize, blockSize, blockSize);
    }
    
    // Tip
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(22 * blockSize, 20 * blockSize, blockSize, blockSize);
  };

  const drawBeard = (ctx, gridSize, blockSize) => {
    const colors = ['#1a1a1a', '#8b4513', '#2d1e2f'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    
    for (let x = 10; x < 22; x++) {
      for (let y = 20; y < 24; y++) {
        if (Math.random() < 0.6) {
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
  };

  const handleDownload = () => {
    if (!punkImage) return;
    
    const link = document.createElement('a');
    link.download = 'PunkIT.png';
    link.href = punkImage;
    link.click();
  };

  const handleCast = () => {
    if (!punkImage) return;
    
    // Simulate casting - in real app, this would connect to Farcaster API
    alert('Punk avatar ready to cast! (Farcaster integration would go here)');
    console.log('Punk image data:', punkImage.substring(0, 100) + '...');
  };

  return (
    <div className="container">
      <Head>
        <title>PunkIT - Farcaster Pixel Avatar</title>
        <meta name="description" content="Transform your avatar into a CryptoPunks-style pixel avatar" />
      </Head>

      <main>
        <header className="header">
          <h1>PunkIT</h1>
          <p>Transform your avatar into a CryptoPunks-style pixel art</p>
        </header>

        <div className="content">
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="button upload-btn"
            >
              Upload Image
            </button>
            
            {originalImage && (
              <div className="preview-area">
                <div className="image-preview">
                  <h3>Original</h3>
                  <img src={originalImage} alt="Original" className="preview-img" />
                </div>
                
                <button 
                  onClick={handleGeneratePunk}
                  disabled={isLoading}
                  className="button generate-btn"
                >
                  {isLoading ? 'Generating...' : 'Generate Punk'}
                </button>
              </div>
            )}
          </div>

          {punkImage && (
            <div className="result-section">
              <h2>Your PunkIT Avatar</h2>
              <div className="punk-display">
                <img 
                  src={punkImage} 
                  alt="Punk Avatar" 
                  className="punk-image"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              
              <div className="actions">
                <button onClick={handleDownload} className="button download-btn">
                  Download PunkIT.png
                </button>
                <button onClick={handleCast} className="button cast-btn">
                  Cast on Farcaster
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .header h1 {
          font-size: 3.5rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .content {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .upload-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .button {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0.5rem;
        }

        .upload-btn {
          background: #4a90e2;
          color: white;
        }

        .upload-btn:hover {
          background: #357abd;
          transform: translateY(-2px);
        }

        .generate-btn {
          background: #ff6b35;
          color: white;
          font-size: 1.1rem;
          padding: 15px 30px;
        }

        .generate-btn:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .preview-area {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .image-preview {
          margin-bottom: 1.5rem;
        }

        .image-preview h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .preview-img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 10px;
          border: 3px solid #e1e5e9;
        }

        .result-section {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .result-section h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .punk-display {
          display: inline-block;
          border: 5px solid #ff6b35;
          border-radius: 15px;
          padding: 1rem;
          background: #1a1a1a;
          margin-bottom: 2rem;
        }

        .punk-image {
          width: 400px;
          height: 400px;
          border-radius: 10px;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .download-btn {
          background: #28a745;
          color: white;
        }

        .download-btn:hover {
          background: #218838;
          transform: translateY(-2px);
        }

        .cast-btn {
          background: #8b4513;
          color: white;
        }

        .cast-btn:hover {
          background: #654321;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          .header h1 {
            font-size: 2.5rem;
          }
          
          .content {
            padding: 1.5rem;
          }
          
          .punk-image {
            width: 300px;
            height: 300px;
          }
          
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .punk-image {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}