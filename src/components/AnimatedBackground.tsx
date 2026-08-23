import React, { useEffect, useRef } from 'react';
import { VisualMood } from '../types';

interface AnimatedBackgroundProps {
  mood: VisualMood;
  bgGradient?: string;
  accentColor?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  angle: number;
  angularSpeed: number;
  color: string;
  pulseSpeed?: number;
  length?: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  mood,
  bgGradient,
  accentColor = '#f472b6',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize particles based on visual mood
    const particles: Particle[] = [];
    const count = mood === 'starlight' ? 90 : mood === 'rain' ? 120 : mood === 'falling_petals' ? 45 : 50;

    for (let i = 0; i < count; i++) {
      if (mood === 'starlight') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 0.6,
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          maxOpacity: Math.random() * 0.9 + 0.1,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.03 + 0.01,
          color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#fbcfe8' : '#e0e7ff',
        });
      } else if (mood === 'falling_petals') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 9 + 6,
          speedX: Math.random() * 1.2 + 0.3,
          speedY: Math.random() * 1.5 + 0.8,
          opacity: Math.random() * 0.7 + 0.3,
          maxOpacity: 0.9,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.04 - 0.02,
          color: Math.random() > 0.3 ? 'rgba(251, 207, 232, 0.85)' : 'rgba(244, 114, 182, 0.85)',
        });
      } else if (mood === 'rain') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.8,
          speedX: -Math.random() * 1.2 - 0.5,
          speedY: Math.random() * 12 + 8,
          opacity: Math.random() * 0.5 + 0.2,
          maxOpacity: 0.7,
          angle: 0,
          angularSpeed: 0,
          color: 'rgba(224, 231, 255, 0.6)',
          length: Math.random() * 20 + 10,
        });
      } else if (mood === 'fireflies') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.8 + 0.2,
          maxOpacity: 0.9,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.02 + 0.01,
          color: Math.random() > 0.5 ? 'rgba(253, 224, 71, 0.9)' : 'rgba(134, 239, 172, 0.9)',
          pulseSpeed: Math.random() * 0.04 + 0.02,
        });
      } else if (mood === 'floating_hearts' || mood === 'soft_bokeh') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height + height * 0.2,
          size: mood === 'floating_hearts' ? Math.random() * 14 + 10 : Math.random() * 40 + 20,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: -Math.random() * 0.8 - 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          maxOpacity: 0.8,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.02 - 0.01,
          color: Math.random() > 0.5 ? 'rgba(244, 114, 182, 0.7)' : 'rgba(192, 132, 252, 0.6)',
        });
      } else if (mood === 'sunrise' || mood === 'aurora' || mood === 'autumn_breeze') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 4,
          speedX: Math.random() * 0.8 + 0.2,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          maxOpacity: 0.8,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: Math.random() * 0.02,
          color: mood === 'sunrise' ? 'rgba(253, 186, 116, 0.7)' : mood === 'aurora' ? 'rgba(94, 234, 212, 0.6)' : 'rgba(251, 146, 60, 0.7)',
        });
      }
    }

    // Draw helper functions
    const drawHeart = (x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
      ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (x: number, y: number, size: number, angle: number, color: string, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, size / 2, size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number } | null = null;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render shooting star occasionally in starlight mood
      if (mood === 'starlight') {
        if (!shootingStar && Math.random() < 0.008) {
          shootingStar = {
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            length: Math.random() * 80 + 50,
            speed: Math.random() * 10 + 12,
            opacity: 1,
          };
        }

        if (shootingStar) {
          ctx.save();
          const gradient = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            shootingStar.x - shootingStar.length,
            shootingStar.y - shootingStar.length * 0.5
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(shootingStar.x - shootingStar.length, shootingStar.y - shootingStar.length * 0.5);
          ctx.stroke();
          ctx.restore();

          shootingStar.x += shootingStar.speed;
          shootingStar.y += shootingStar.speed * 0.5;
          shootingStar.opacity -= 0.02;

          if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
            shootingStar = null;
          }
        }
      }

      // Render aurora waves
      if (mood === 'aurora') {
        ctx.save();
        const time = Date.now() * 0.0008;
        const grad = ctx.createLinearGradient(0, 0, width, height * 0.7);
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.15)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
        grad.addColorStop(1, 'rgba(45, 212, 191, 0.15)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.3);
        for (let x = 0; x <= width; x += 30) {
          const y = height * 0.3 + Math.sin(x * 0.005 + time) * 40 + Math.cos(x * 0.002 - time * 0.5) * 30;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Render particles
      particles.forEach((p) => {
        if (mood === 'starlight') {
          p.angle += p.angularSpeed;
          p.opacity = (Math.sin(p.angle) + 1) / 2 * p.maxOpacity;

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Star glow
          if (p.size > 1.8) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
          }
          ctx.restore();
        } else if (mood === 'falling_petals') {
          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.01) * p.speedX;
          p.angle += p.angularSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          drawPetal(p.x, p.y, p.size, p.angle, p.color, p.opacity);
        } else if (mood === 'rain') {
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 15));
          ctx.stroke();
          ctx.restore();
        } else if (mood === 'fireflies') {
          p.x += p.speedX + Math.sin(Date.now() * 0.001 + p.angle) * 0.3;
          p.y += p.speedY + Math.cos(Date.now() * 0.001 + p.angle) * 0.3;
          p.angle += p.pulseSpeed || 0.02;
          p.opacity = (Math.sin(p.angle) + 1) / 2 * p.maxOpacity;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (mood === 'floating_hearts') {
          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.01) * 0.6;

          if (p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          drawHeart(p.x, p.y, p.size, p.color, p.opacity);
        } else if (mood === 'soft_bokeh' || mood === 'sunrise' || mood === 'autumn_breeze') {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + 50) p.x = -50;
          if (p.y < -50 || p.y > height + 50) p.y = Math.random() * height;

          ctx.save();
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
    };
  }, [mood, accentColor]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-1000 ${className}`}
      style={{
        background: bgGradient || 'radial-gradient(ellipse at top, #fce7f3 0%, #fae8ff 50%, #f1f5f9 100%)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
