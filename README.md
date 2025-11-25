# SGHSS - Sistema de Gestão Hospitalar e de Serviços de Saúde

*To be done...*

## 📋 Requisitos

Para executar este projeto em ambiente de desenvolvimento, você precisará das seguintes ferramentas instaladas em sua máquina:

* **[Docker](https://www.docker.com/get-started/)**: Necessário para criar os containers da aplicação e do banco de dados.
* **[Visual Studio Code (VS Code)](https://code.visualstudio.com/)**: O editor de código recomendado.
* **[Dev Containers (Extensão VS Code)](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)**: Extensão que permite abrir a pasta do projeto diretamente dentro do container Docker configurado.

## 🚀 Instalação e Inicialização

Siga os passos abaixo para configurar e rodar o projeto localmente:

### 1. Clonar e Configurar Variáveis de Ambiente

Abra seu terminal, clone o repositório e entre na pasta:

```bash
git clone https://github.com/jairoduarteribeiro/sghss.git
cd sghss
```

Crie o arquivo de variáveis de ambiente .env a partir do template e configure os segredos iniciais (JWT e Banco de Dados) usando os comandos abaixo:

```bash
cp template.env .env
sed -i 's/<PUT_THE_SECRET_HERE>/JwtSecret123!/g' .env
sed -i 's/<PUT_THE_PASSWORD_HERE>/Password123!/g' .env
```

*Use as credenciais que preferir...*

### 2. Inicializar o Dev Container

Abra o projeto no VS Code:

```bash
code .
```

Assim que o VS Code abrir:

1. Um popup deve aparecer no canto inferior direito sugerindo reabrir no container. Clique em "Reopen in Container".
2. Caso não apareça, pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac) para abrir a paleta de comandos, digite e selecione: `Dev Containers: Rebuild and Reopen in Container`.

Aguarde: Na primeira execução, este processo pode levar alguns minutos. O VS Code irá baixar as imagens oficiais (Bun e Postgres), subir os serviços via Docker Compose (web e db), instalar as extensões do VS Code e baixar as dependências do projeto (package.json).

### 3. Banco de Dados e Execução

Após o ambiente carregar completamente, abra o terminal integrado do VS Code (Terminal > New Terminal) e execute as migrações para criar as tabelas no banco de dados:

```bash
bun db:migrate
```

Em seguida, inicie a aplicação:

```bash
bun dev
```

### 4. Acesso e Documentação

Ao iniciar, o sistema criará automaticamente um Usuário Administrador padrão para que você possa acessar as rotas protegidas:

- **Email**: `admin@vidaplus.com`
- **Senha**: `Admin123!`

O Dev Container fará o encaminhamento automático da porta 3000. Você pode acessar a documentação interativa da API (Swagger) no seu navegador:

👉 http://localhost:3000/api-docs

## 🏗️ Arquitetura

*To be done...*

## 🛠️ Tecnologias

*To be done...*

## 🧪 Testes

*To be done...*

## 📄 Licença

*To be done...*
