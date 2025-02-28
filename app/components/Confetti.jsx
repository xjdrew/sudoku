'use client';
import { useEffect, useRef } from 'react';

export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 150;

    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = canvas.width * Math.random();
        this.y = -10;
        this.radius = Math.random() * 4 + 1;
        this.dx = Math.random() * 6 - 3;
        this.dy = Math.random() * 2 + 2;
        this.gravity = 0.1;
        this.alpha = 1;
        this.colors = [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7',
          '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
          '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
          '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      }

      update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.alpha -= 0.005;
        return this.alpha > 0;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.closePath();
      }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 动画循环
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (!particle.update()) {
          particles.splice(i, 1);
        } else {
          particle.draw(ctx);
        }
      }

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    }

    animate();

    // 清理函数
    return () => {
      particles.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
} 