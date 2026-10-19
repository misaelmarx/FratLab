# FretLab

Ferramenta para aulas de guitarra, com braço interativo, identificação de acordes e escalas e criação de materiais para os alunos.

## Recursos

- Seleção de notas em até 24 casas, com nomes e destaque para a tônica.
- Modos de exploração, acordes e escalas; afinações alternativas e orientação para canhotos.
- Identificação de acordes, inversões e escalas, distinguindo correspondências exatas de escalas compatíveis.
- Reprodução sonora sintetizada, transposição e exemplos musicais.
- Shapes e rascunhos salvos no navegador, com busca por título ou aluno.
- Navegação pelo teclado, notas ampliadas e modo aula.
- Exportação de PNG e PDF com nome do aluno e anotações opcionais.

## Executar localmente

Não é necessário instalar dependências para usar o aplicativo. Com Python 3 instalado, execute na pasta do projeto:

```sh
python -m http.server 8000 --directory dist
```

Abra `http://localhost:8000` no navegador.

## Publicar na Vercel

Importe o repositório na Vercel com a raiz do projeto em `./`. O arquivo `vercel.json` configura a publicação de `dist`, sem comandos de instalação ou build. Os pushes para a branch de produção conectada atualizam o site automaticamente.

## GitHub Actions e publicação opcional no Pages

O fluxo `.github/workflows/pages.yml` verifica o JavaScript, a análise musical e as interações em cada push ou pull request para `main` ou `master`.

Para usar o GitHub Pages como hospedagem alternativa, ative **GitHub Actions** em **Settings → Pages → Source**. Depois execute **Verificar FretLab** na aba **Actions**, marcando a opção **Também publicar no GitHub Pages**. Essa publicação é manual e independente da Vercel.

## Verificar a análise musical

Com Node.js 22:

```sh
node tests/music.cjs
node tests/ui.cjs
```

## Dados dos alunos

Os shapes, rascunhos e anotações são mantidos no armazenamento local do navegador. Os materiais exportados são gerados no próprio dispositivo. A coleção não é sincronizada entre dispositivos.
