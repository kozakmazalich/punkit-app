import { useState, useRef } from 'react';

export default function PunkIT() {
  const [originalImage, setOriginalImage] = useState(null);
  const [punkImage, setPunkImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

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
    
    // Use timeout to ensure UI updates
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        generatePunkAvatar(img);
        setIsLoading(false);
      };
      img.src = originalImage;
    }, 100);
  };

  const generatePunkAvatar = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 400, 400);
    
    // Calculate square crop area
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    
    // Create pixelated version
    const pixelSize = 8; // 400/50 = 8px per block
    const gridSize = 50;
    
    // Draw image scaled down and then up for pixelation
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = gridSize;
    tempCanvas.height = gridSize;
    
    // Draw cropped image to small canvas
    tempCtx.drawImage(img, sx, sy, size, size, 0, 0, gridSize, gridSize);
    
    // Get pixel data
    const imageData = tempCtx.getImageData(0, 0, gridSize, gridSize);
    const data = imageData.data;
    
    // Punk color palette
    const punkColors = [
      '#000000', '#2D1E2F', '#663399', '#8B4513',
      '#DAA520', '#F0E68C', '#FF69B4', '#FF4500', 
      '#32CD32', '#1E90FF', '#FFFFFF', '#4A412A'
    ];
    
    // Draw pixelated image
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = (y * gridSize + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        
        if (a > 128) { // If pixel is not too transparent
          const color = getClosestColor(r, g, b, punkColors);
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Add random punk features
    addRandomFeatures(ctx, gridSize, pixelSize);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    setPunkImage(dataURL);
  };

  const getClosestColor = (r, g, b, palette) => {
    let minDistance = Infinity;
    let closestColor = palette[0];
    
    for (const color of palette) {
      const hex = color.replace('#', '');
      const cr = parseInt(hex.substr(0, 2), 16);
      const cg = parseInt(hex.substr(2, 2), 16);
      const cb = parseInt(hex.substr(4, 2), 16);
      
      const distance = Math.sqrt(
        Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
    
    return closestColor;
  };

  const addRandomFeatures = (ctx, gridSize, pixelSize) => {
    const features = [];
    
    // Random features (50% chance for each)
    if (Math.random() > 0.5) features.push('hair');
    if (Math.random() > 0.5) features.push('glasses');
    if (Math.random() > 0.5) features.push('beard');
    
    features.forEach(feature => {
      switch(feature) {
        case 'hair':
          drawHair(ctx, gridSize, pixelSize);
          break;
        case 'glasses':
          drawGlasses(ctx, gridSize, pixelSize);
          break;
        case 'beard':
          drawBeard(ctx, gridSize, pixelSize);
          break;
      }
    });
  };

  const drawHair = (ctx, gridSize, pixelSize) => {
    const colors = ['#000000', '#2D1E2F', '#8B4513', '#4A412A'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    
    // Draw hair on top
    for (let x = 15; x < 35; x++) {
      for (let y = 5; y < 10; y++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  const drawGlasses = (ctx, gridSize, pixelSize) => {
    ctx.fillStyle = '#000000';
    
    // Left lens
    for (let x = 18; x < 23; x++) {
      for (let y = 20; y < 22; y++) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Right lens
    for (let x = 27; x < 32; x++) {
      for (let y = 20; y < 22; y++) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Bridge
    for (let x = 23; x < 27; x++) {
      ctx.fillRect(x * pixelSize, 20 * pixelSize, pixelSize, pixelSize);
    }
  };

  const drawBeard = (ctx, gridSize, pixelSize) => {
    const colors = ['#000000', '#2D1E2F', '#4A412A'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    
    for (let x = 18; x < 32; x++) {
      for (let y = 28; y < 32; y++) {
        if (Math.random() > 0.4) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  const handleDownload = () => {
    if (!punkImage) return;
    
    const link = document.createElement('a');
    link.download = 'PunkIT.png';
    link.href = punkImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCast = () => {
    alert('Punk avatar generated! In a real app, this would post to Farcaster.');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>PunkIT</h1>
        <p style={styles.subtitle}>Transform your avatar into a CryptoPunks-style pixel art</p>
      </header>

      <main style={styles.main}>
        <div style={styles.uploadSection}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={styles.uploadButton}
          >
            Upload Image
          </button>
          
          {originalImage && (
            <div style={styles.previewArea}>
              <div style={styles.imagePreview}>
                <h3 style={styles.previewTitle}>Original Image</h3>
                <img 
                  src={originalImage} 
                  alt="Original" 
                  style={styles.previewImage}
                />
              </div>
              
              <button 
                onClick={handleGeneratePunk}
                disabled={isLoading}
                style={{
                  ...styles.generateButton,
                  ...(isLoading ? styles.buttonDisabled : {})
                }}
              >
                {isLoading ? 'Generating...' : 'Generate Punk'}
              </button>
            </div>
          )}
        </div>

        {punkImage && (
          <div style={styles.resultSection}>
            <h2 style={styles.resultTitle}>Your PunkIT Avatar</h2>
            <div style={styles.punkDisplay}>
              <img 
                src={punkImage} 
                alt="Punk Avatar" 
                style={styles.punkImage}
              />
            </div>
            
            <div style={styles.actionButtons}>
              <button onClick={handleDownload} style={styles.downloadButton}>
                Download PunkIT.png
              </button>
              <button onClick={handleCast} style={styles.castButton}>
                Cast on Farcaster
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'white',
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  uploadSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  uploadButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#4a90e2',
    color: 'white',
    transition: 'all 0.3s ease',
  },
  previewArea: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #eee',
  },
  imagePreview: {
    marginBottom: '1.5rem',
  },
  previewTitle: {
    marginBottom: '1rem',
    color: '#333',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '10px',
    border: '3px solid #e1e5e9',
  },
  generateButton: {
    background: '#ff6b35',
    color: 'white',
    fontSize: '1.1rem',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  resultSection: {
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid #eee',
  },
  resultTitle: {
    marginBottom: '1.5rem',
    color: '#333',
  },
  punkDisplay: {
    display: 'inline-block',
    border: '5px solid #ff6b35',
    borderRadius: '15px',
    padding: '1rem',
    background: '#1a1a1a',
    marginBottom: '2rem',
  },
  punkImage: {
    width: '400px',
    height: '400px',
    borderRadius: '10px',
    imageRendering: 'pixelated',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  downloadButton: {
    background: '#28a745',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  castButton: {
    background: '#8b4513',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
};

// Add hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .upload-button:hover { background: #357abd; }
    .generate-button:hover { background: #e55a2b; }
    .download-button:hover { background: #218838; }
    .cast-button:hover { background: #654321; }
    
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .title { font-size: 2.5rem; }
      .main { padding: 1.5rem; }
      .punk-image { 
        width: 300px; 
        height: 300px; 
      }
      .action-buttons { 
        flex-direction: column; 
        align-items: center;
      }
      button { 
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
  `;
  document.head.appendChild(style);
}
