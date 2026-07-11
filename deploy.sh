#!/bin/bash
# Uso: ./deploy.sh caminho/para/arquivo.zip "mensagem do commit"
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Uso: ./deploy.sh caminho/para/arquivo.zip \"mensagem do commit\""
  exit 1
fi

unzip -o "$1" -d .
git add .
git commit -m "$2"
git push origin main

echo "✅ Publicado!"
