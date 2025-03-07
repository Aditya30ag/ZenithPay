import React, { useState, useEffect, useRef } from "react";

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  
  // Banking theme colors
  const colors = {
    primary: { r: 0, g: 73, b: 150 },     // Deep blue
    secondary: { r: 19, g: 124, b: 189 }, // Lighter blue
    accent: { r: 242, g: 201, b: 76 },    // Gold
    highlight: { r: 46, g: 168, b: 134 }  // Money green
  };

  let mouseX = 0;
  let mouseY = 0;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Resize canvas dynamically
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };
    
    // Initialize particles with banking theme
    const createParticles = () => {
      const numParticles = Math.min(window.innerWidth, window.innerHeight) * 0.12;
      
      particlesRef.current = Array.from({ length: numParticles }, () => {
        // Randomly choose particle type (data, coin, or standard)
        const type = Math.random() < 0.15 ? 
                      (Math.random() < 0.4 ? 'coin' : 'data') : 
                      'standard';
        
        const size = type === 'standard' 
                      ? Math.random() * 2 + 1 
                      : (type === 'coin' ? Math.random() * 5 + 3 : Math.random() * 3 + 2);
        
        // Select color based on type
        let colorKey;
        if (type === 'coin') {
          colorKey = 'accent';
        } else if (type === 'data') {
          colorKey = 'highlight';
        } else {
          colorKey = Math.random() < 0.7 ? 'primary' : 'secondary';
        }
        
        const color = colors[colorKey];
                
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          alpha: Math.random() * 0.6 + 0.4,
          type,
          color,
          pulse: 0,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          rotationSpeed: (Math.random() - 0.5) * 0.02
        };
      });
    };
    
    // Draw connecting lines
    const drawLine = (p1, p2, distance, maxDistance) => {
      const alpha = 1 - distance / maxDistance;
      
      // Different line styles based on particle types
      let lineColor;
      if (p1.type === 'coin' || p2.type === 'coin') {
        lineColor = `rgba(${colors.accent.r}, ${colors.accent.g}, ${colors.accent.b}, ${alpha * 0.4})`;
      } else if (p1.type === 'data' || p2.type === 'data') {
        lineColor = `rgba(${colors.highlight.r}, ${colors.highlight.g}, ${colors.highlight.b}, ${alpha * 0.4})`;
      } else {
        lineColor = `rgba(${colors.secondary.r}, ${colors.secondary.g}, ${colors.secondary.b}, ${alpha * 0.3})`;
      }
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    
    // Draw a data point (square with slight rotation)
    const drawDataPoint = (p) => {
      const size = p.size + Math.sin(p.pulse) * 1;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.pulse * p.rotationSpeed);
      
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      ctx.fillRect(-size/2, -size/2, size, size);
      
      ctx.restore();
    };
    
    // Draw a coin (circle with $ symbol)
    const drawCoin = (p) => {
      const size = p.size + Math.sin(p.pulse) * 1.5;
      
      // Draw coin circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      ctx.fill();
      
      // Add dollar sign if large enough
      if (size > 4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha + 0.2})`;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', p.x, p.y);
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      
      particles.forEach((p, index) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Update pulse
        p.pulse += p.pulseSpeed;
        if (p.pulse > Math.PI * 2) p.pulse = 0;
        
        // Boundary collision
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Mouse interaction
        if (hovering) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = (150 - dist) / 150;
            
            // Special attraction for coin and data particles
            if (p.type === 'coin' || p.type === 'data') {
              p.x += dx * force * 0.01;
              p.y += dy * force * 0.01;
            } else {
              p.x -= dx * force * 0.03;
              p.y -= dy * force * 0.03;
            }
          }
        }
        
        // Draw particle based on type
        if (p.type === 'data') {
          drawDataPoint(p);
        } else if (p.type === 'coin') {
          drawCoin(p);
        } else {
          // Standard particle
          const size = p.size + Math.sin(p.pulse) * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
          ctx.fill();
        }
        
        // Draw connections
        particles.slice(index + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect nearby particles, with special connections for financial particles
          const connectionDistance = (p.type !== 'standard' || p2.type !== 'standard') ? 140 : 100;
          
          if (distance < connectionDistance) {
            drawLine(p, p2, distance, connectionDistance);
          }
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Handle mouse movement
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Initialize animation
    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default ParticleCanvas;