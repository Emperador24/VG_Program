#!/bin/bash

echo "🚀 V&G DEPLOYMENT SCRIPT"
echo "========================"
echo ""

# Verificar git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ No es un repositorio git"
    exit 1
fi

echo "✓ Git repository encontrado"
echo ""

# Opciones
echo "Selecciona tu opción:"
echo "1. Push a GitHub (para Railway + Vercel)"
echo "2. Deploy local test"
echo "3. Ver configuración"
echo ""

read -p "Opción (1-3): " option

case $option in
    1)
        echo ""
        echo "📤 Preparando push a GitHub..."
        git status
        echo ""
        read -p "¿Deseas commitear cambios? (y/n): " commit_choice
        if [ "$commit_choice" = "y" ]; then
            read -p "Mensaje de commit: " commit_msg
            git add .
            git commit -m "$commit_msg"
        fi
        
        echo ""
        echo "Pushing a GitHub..."
        git push origin master
        
        echo ""
        echo "✅ Push completado"
        echo ""
        echo "Próximos pasos:"
        echo "1. Ir a https://railway.app"
        echo "2. Crear nuevo proyecto desde este repo"
        echo "3. Ir a https://vercel.com"
        echo "4. Crear nuevo proyecto desde este repo"
        echo ""
        ;;
    
    2)
        echo ""
        echo "🧪 Test deployment local..."
        echo "Instalando dependencias..."
        
        cd api && npm install --quiet && echo "✓ Backend dependencies OK"
        cd ../app && npm install --quiet && echo "✓ Frontend dependencies OK"
        cd ..
        
        echo ""
        echo "Para iniciar localmente:"
        echo "Terminal 1: cd api && npm start"
        echo "Terminal 2: cd app && npm run dev"
        echo ""
        ;;
    
    3)
        echo ""
        echo "⚙️ Configuración actual:"
        echo ""
        echo "GitHub:"
        git remote -v
        echo ""
        echo "Rama actual:"
        git branch
        echo ""
        echo "Commits:"
        git log --oneline -3
        echo ""
        ;;
    
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
echo "Para más información: ver DEPLOYMENT.md"
