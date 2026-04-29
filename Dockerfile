FROM node:22-alpine

WORKDIR /app

# Copiar os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar o resto do projeto
COPY . .

# Expor a porta que o Vite utiliza
EXPOSE 3000

# Iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
