import React, { useRef, useEffect } from 'react';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];
        let mouse = { x: width / 2, y: height / 2 };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;

            constructor(x: number, y: number, size: number, color: string) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = color;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.size > 0.1) this.size -= 0.01;

                // interaction with mouse
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    this.size += 0.5;
                }

                // boundary check
                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.x = Math.random() * width;
                    this.y = Math.random() * height;
                    this.size = Math.random() * 1.5 + 1;
                }
            }

            draw(context: CanvasRenderingContext2D) {
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.closePath();
                context.fill();
            }
        }

        function init() {
            particles = [];
            for (let i = 0; i < 100; i++) {
                const size = Math.random() * 1.5 + 1;
                const x = Math.random() * width;
                const y = Math.random() * height;
                const color = 'rgba(107, 114, 128, 0.5)';
                particles.push(new Particle(x, y, size, color));
            }
        }

        function animate() {
            ctx!.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw(ctx!);
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };
        
        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />;
};

export default ParticleBackground;
