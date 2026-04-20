#!/bin/bash
# GoalGetter v3.25 Codespace Setup

echo "🚀 Setting up GoalGetter v3.25 on GitHub Codespaces..."

# Create .env.local with Turso credentials
cat > .env.local << 'ENV_EOF'
# Turso Cloud Database (Production)
DATABASE_URL=libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWFlLWU5NzgtNDQ3Ni1hNDRjLTYyZDY2ODZiZWMxZiJ9.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg

# JWT Secret
JWT_SECRET=goalgetter-leap99-dev-secret-key-2026

# Next.js
NODE_ENV=development
NEXT_DISABLE_TYPE_CHECK=true
ENV_EOF

echo "✅ Created .env.local with Turso credentials"
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎯 Ready to start!"
echo ""
echo "Run: npm run dev"
echo "Then open the forwarded port link (should be auto-forwarded to 3000)"
echo ""
echo "Login:"
echo "  Email: louie@leap99.com (or just 'louie')"
echo "  Password: louie-99"
