# CarWashing Service Backend

🚗 Production-grade backend API

## Quick Start
```bash
npm install
npm run dev
### **7. Klasör yapısı oluştur**
```bash
mkdir -p src
mkdir -p src/config
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p src/services
cat > src/server.ts << 'EOF'
import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/health', async () => {
  return { 
    status: 'ok', 
    service: 'CarWashing Backend',
    timestamp: new Date().toISOString() 
  };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running at http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
