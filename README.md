# Plataforma local do Curso de Hebraico Bíblico

Este repositório inclui uma interface web para estudar o arquivo `curso-hebraico-biblico.md` no VS Code/navegador.

## Como abrir no VS Code

Use este caminho no VS Code:

```bash
code /workspace/teste
```

Se quiser abrir direto o arquivo do curso:

```bash
code /workspace/teste/curso-hebraico-biblico.md
```

Depois, com a pasta aberta no VS Code, inicie um servidor local na raiz:

```bash
python3 -m http.server 8000
```

Abra no navegador:

- http://localhost:8000

## Recursos da interface

- Lista das 200 lições com busca por número, título, descrição ou módulo.
- Navegação por lição anterior/próxima.
- Marcação de lições concluídas com persistência em `localStorage`.
- Barra de progresso automática e botão para limpar o progresso.
- Cartão de revisão de vocabulário com extração automática do próprio conteúdo do curso.


## Se a URL do Codespaces não abrir

Se você estiver usando uma URL como `https://...-5500.app.github.dev/` e a tela ficar vazia, abra explicitamente:

- `https://...-5500.app.github.dev/index.html`

E confirme que a porta **5500** está com visibilidade **Public** no painel **Ports** do VS Code/Codespaces.

