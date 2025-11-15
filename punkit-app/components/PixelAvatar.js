import { useEffect, useRef, useState } from 'react';

const PixelAvatar = ({ src, width = 400, height = 400 }) => {
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!src) return;

    const processImage = async () => {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Load the image
      const img = new Image();
      img.onload = () => {
        // Create pixelated version
        createPixelArt(img, ctx, canvas);
        setIsProcessing(false);
      };
      img.src = src;
    };

    processImage();
  }, [src, width, height]);

  const createPixelArt = (img, ctx, canvas) => {
    const pixelSize = 8; // 32x32 grid for 400px output (400/32 = 12.5, but we use 8 for more pixels)
    const gridSize = 32;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create off-screen canvas for pixel processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set temp canvas to grid size
    tempCanvas.width = gridSize;
    tempCanvas.height = gridSize;
    
    // Draw image to temp canvas (this automatically scales and pixelates)
    tempCtx.drawImage(img, 0, 0, gridSize, gridSize);
    
    // Get pixel data
    const imageData = tempCtx.getImageData(0, 0, gridSize, gridSize);
    const data = imageData.data;
    
    // Apply limited color palette and draw pixels
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = (y * gridSize + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        
        if (a > 128) { // Only draw if pixel is not transparent
          // Convert to limited color palette
          const limitedColor = applyLimitedPalette(r, g, b);
          
          // Draw pixel with nearest-neighbor scaling
          ctx.fillStyle = limitedColor;
          ctx.fillRect(
            x * pixelSize, 
            y * pixelSize, 
            pixelSize, 
            pixelSize
          );
        }
      }
    }
    
    // Add optional punk features randomly
    addPunkFeatures(ctx, gridSize, pixelSize);
  };

  const applyLimitedPalette = (r, g, b) => {
    // Limited punk color palette
    const colors = [
      '#1a1a1a', // Black
      '#2d1e2f', // Dark purple
      '#663399', // Purple
      '#8b4513', // Brown
      '#daa520', // Golden
      '#f0e68c', // Khaki
      '#ff69b4', // Pink
      '#ff4500', // Red orange
      '#32cd32', // Green
      '#1e90ff', // Blue
      '#ffffff', // White
    ];
    
    // Find closest color in palette
    let closestColor = colors[0];
    let minDistance = Infinity;
    
    const currentColor = { r, g, b };
    
    colors.forEach(color => {
      const hex = color.replace('#', '');
      const paletteColor = {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
      
      const distance = colorDistance(currentColor, paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    });
    
    return closestColor;
  };

  const colorDistance = (color1, color2) => {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  };

  const addPunkFeatures = (ctx, gridSize, pixelSize) => {
    const features = [
      'hair',
      'sunglasses', 
      'cigarette',
      'beard'
    ];
    
    // Randomly select 1-2 features
    const selectedFeatures = features
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1);
    
    selectedFeatures.forEach(feature => {
      switch (feature) {
        case 'hair':
          drawHair(ctx, gridSize, pixelSize);
          break;
        case 'sunglasses':
          drawSunglasses(ctx, gridSize, pixelSize);
          break;
        case 'cigarette':
          drawCigarette(ctx, gridSize, pixelSize);
          break;
        case 'beard':
          drawBeard(ctx, gridSize, pixelSize);
          break;
      }
    });
  };

  const drawHair = (ctx, gridSize, pixelSize) => {
    const hairColors = ['#1a1a1a', '#8b4513', '#daa520', '#663399'];
    const color = hairColors[Math.floor(Math.random() * hairColors.length)];
    
    ctx.fillStyle = color;
    
    // Draw hair on top of head
    for (let x = 8; x < 24; x++) {
      for (let y = 4; y < 8; y++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  const drawSunglasses = (ctx, gridSize, pixelSize) => {
    ctx.fillStyle = '#1a1a1a';
    
    // Left lens
    for (let x = 9; x < 13; x++) {
      for (let y = 14; y < 16; y++) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Right lens
    for (let x = 19; x < 23; x++) {
      for (let y = 14; y < 16; y++) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Bridge
    for (let x = 15; x < 17; x++) {
      ctx.fillRect(x * pixelSize, 14 * pixelSize, pixelSize, pixelSize);
    }
  };

  const drawCigarette = (ctx, gridSize, pixelSize) => {
    ctx.fillStyle = '#ffffff';
    
    // Cigarette
    for (let x = 18; x < 22; x++) {
      ctx.fillRect(x * pixelSize, 20 * pixelSize, pixelSize, pixelSize);
    }
    
    // Tip
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(22 * pixelSize, 20 * pixelSize, pixelSize, pixelSize);
  };

  const drawBeard = (ctx, gridSize, pixelSize) => {
    const beardColors = ['#1a1a1a', '#8b4513', '#663399'];
    const color = beardColors[Math.floor(Math.random() * beardColors.length)];
    
    ctx.fillStyle = color;
    
    for (let x = 10; x < 22; x++) {
      for (let y = 20; y < 24; y++) {
        if (Math.random() > 0.4) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  return (
    <div className="pixel-avatar">
      {isProcessing && <div className="processing">Processing...</div>}
      <canvas
        ref={canvasRef}
        style={{
          display: isProcessing ? 'none' : 'block',
          imageRendering: 'pixelated'
        }}
      />
      
      <style jsx>{`
        .pixel-avatar {
          position: relative;
          display: inline-block;
        }
        
        .processing {
          width: ${width}px;
          height: ${height}px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #666;
          font-style: italic;
        }
        
        canvas {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default PixelAvatar;