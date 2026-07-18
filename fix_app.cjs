const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add explanation to Question interface
code = code.replace("mediaType?: 'image' | 'youtube' | 'audio'; // Multimedia type", "mediaType?: 'image' | 'youtube' | 'audio'; // Multimedia type\n  explanation?: string;");

// Fix TaskSelect missing activeTab "ai" -> Wait, error TS2367: This comparison appears to be unintentional because the types '"tasks" | "questions" | "import" | "settings" | "attempts" | "paper"' and '"ai"' have no overlap.
code = code.replace("const [activeTab, setActiveTab] = useState<'tasks' | 'questions' | 'import' | 'settings' | 'attempts' | 'paper'>('tasks');", "const [activeTab, setActiveTab] = useState<'tasks' | 'questions' | 'ai' | 'import' | 'settings' | 'attempts' | 'paper'>('tasks');");

// Add previewData to ImportTab
code = code.replace("const [textInput, setTextInput] = useState('');\n\n  const parseRobustJSON", "const [textInput, setTextInput] = useState('');\n  const [previewData, setPreviewData] = useState<Partial<Question>[]>([]);\n\n  const parseRobustJSON");

// Add ParticleEngine class
const particleEngineClass = `class ParticleEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: any[];
  animationId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.particles = [];
    this.resize();
    window.addEventListener('resize', this.resize);
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  createParticles(x: number, y: number, color: string, count: number = 20) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color,
        size: Math.random() * 5 + 2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(this.animate);
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    cancelAnimationFrame(this.animationId);
  }
}
`;

// Insert ParticleEngine before Gameplay
code = code.replace("export function Gameplay", particleEngineClass + "\nexport function Gameplay");

// Fix currentQ redeclaration
code = code.replace("  const currentQ = questions[currentIndex];\n\n  const handleAnswer", "  const handleAnswer");

// Add Heart import
code = code.replace("import { Settings, BookOpen", "import { Heart, Settings, BookOpen");

fs.writeFileSync('src/App.tsx', code);
