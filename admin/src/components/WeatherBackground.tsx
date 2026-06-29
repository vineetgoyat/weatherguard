import { useEffect, useRef } from 'react';
import { TimeOfDay } from '../hooks/useTimeOfDay';

interface Props { timeOfDay: TimeOfDay; }

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

export default function WeatherBackground({ timeOfDay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const starsRef = useRef<any[]>([]);
  const cloudsRef = useRef<any[]>([]);
  const shootingStarsRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init stars
    starsRef.current = Array.from({ length: 180 }, () => ({
      x: randomBetween(0, window.innerWidth),
      y: randomBetween(0, window.innerHeight),
      r: randomBetween(0.5, 2.5),
      speed: randomBetween(0.5, 2),
      phase: randomBetween(0, Math.PI * 2),
    }));

    // Init clouds
    cloudsRef.current = Array.from({ length: 5 }, (_, i) => ({
      x: randomBetween(-200, window.innerWidth),
      y: randomBetween(50, 300),
      scale: randomBetween(0.6, 1.4),
      speed: randomBetween(0.2, 0.5),
      opacity: randomBetween(0.5, 0.9),
    }));

    let frame = 0;
    let lastShoot = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (timeOfDay === 'night' || timeOfDay === 'dawn') {
        // Draw stars
        starsRef.current.forEach(s => {
          const twinkle = 0.4 + 0.6 * Math.sin(frame * 0.03 * s.speed + s.phase);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
          ctx.fillStyle = timeOfDay === 'night'
            ? `rgba(255,255,255,${twinkle * 0.9})`
            : `rgba(255,220,180,${twinkle * 0.6})`;
          ctx.fill();
        });

        // Shooting stars
        if (timeOfDay === 'night' && frame - lastShoot > 180 && Math.random() < 0.02) {
          shootingStarsRef.current.push({
            x: randomBetween(W * 0.3, W),
            y: randomBetween(0, H * 0.4),
            len: randomBetween(80, 160),
            speed: randomBetween(8, 16),
            life: 0,
            maxLife: randomBetween(20, 40),
          });
          lastShoot = frame;
        }
        shootingStarsRef.current = shootingStarsRef.current.filter(s => s.life < s.maxLife);
        shootingStarsRef.current.forEach(s => {
          s.life++;
          s.x -= s.speed;
          s.y += s.speed * 0.6;
          const progress = s.life / s.maxLife;
          const opacity = 1 - progress;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len * 0.6);
          grad.addColorStop(0, `rgba(255,255,255,${opacity})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.len, s.y - s.len * 0.6);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // Moon
        if (timeOfDay === 'night') {
          const moonX = W * 0.82;
          const moonY = H * 0.12;
          const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 80);
          moonGlow.addColorStop(0, 'rgba(200,220,255,0.15)');
          moonGlow.addColorStop(1, 'rgba(200,220,255,0)');
          ctx.beginPath();
          ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
          ctx.fillStyle = moonGlow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(220,230,255,0.95)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(moonX + 12, moonY - 6, 26, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(100,120,200,0.5)';
          ctx.fill();
        }
      }

      if (timeOfDay === 'day' || timeOfDay === 'dawn' || timeOfDay === 'sunset') {
        // Draw clouds
        cloudsRef.current.forEach(c => {
          c.x += c.speed;
          if (c.x > canvas.width + 300) c.x = -300;
          drawCloud(ctx, c.x, c.y, c.scale, c.opacity, timeOfDay);
        });

        // Sun
        if (timeOfDay === 'day') {
          const sunX = W * 0.15;
          const sunY = H * 0.15;
          const t = frame * 0.01;

          // Rays
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + t;
            const rayLen = 55 + 10 * Math.sin(t * 2 + i);
            ctx.beginPath();
            ctx.moveTo(sunX + Math.cos(angle) * 38, sunY + Math.sin(angle) * 38);
            ctx.lineTo(sunX + Math.cos(angle) * rayLen, sunY + Math.sin(angle) * rayLen);
            ctx.strokeStyle = `rgba(255,230,100,${0.3 + 0.2 * Math.sin(t + i)})`;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          // Glow
          const glow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 120);
          glow.addColorStop(0, 'rgba(255,240,100,0.4)');
          glow.addColorStop(1, 'rgba(255,200,50,0)');
          ctx.beginPath();
          ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Sun body
          ctx.beginPath();
          ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,235,80,0.95)';
          ctx.fill();
        }

        // Sunset sun
        if (timeOfDay === 'sunset') {
          const sunX = W * 0.5;
          const sunY = H * 0.75;
          const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 200);
          glow.addColorStop(0, 'rgba(255,160,50,0.5)');
          glow.addColorStop(0.5, 'rgba(255,80,20,0.2)');
          glow.addColorStop(1, 'rgba(255,50,0,0)');
          ctx.beginPath();
          ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,180,60,0.9)';
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current!);
      window.removeEventListener('resize', resize);
    };
  }, [timeOfDay]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number, time: TimeOfDay) {
  const color = time === 'day'
    ? `rgba(255,255,255,${opacity})`
    : time === 'sunset'
    ? `rgba(255,160,100,${opacity * 0.7})`
    : `rgba(200,180,220,${opacity * 0.4})`;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.arc(50, -10, 55, 0, Math.PI * 2);
  ctx.arc(110, 0, 40, 0, Math.PI * 2);
  ctx.arc(160, 5, 35, 0, Math.PI * 2);
  ctx.arc(80, 20, 35, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
