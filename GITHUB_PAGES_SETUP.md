# 🚀 Setup GitHub Pages

## Passo 1: Verifique o `vite.config.ts`

O arquivo já está configurado com:
```typescript
base: process.env.GITHUB_PAGES ? '/eldx_agenda_front/' : '/',
```

⚠️ **IMPORTANTE**: Se o nome do repositório for diferente de `eldx_agenda_front`, altere na linha acima.

Por exemplo:
- Se repo é `meu-projeto`: use `/meu-projeto/`
- Se repo é `user.github.io` (user/org page): use `/`

## Passo 2: Configure as Secrets do GitHub

O workflow usa `GITHUB_PAGES=true` automaticamente. Nenhuma secret adicional é necessária!

## Passo 3: Configure GitHub Pages

1. Vá para **Settings** do repositório
2. Vá para **Pages** (no menu lateral)
3. Em **Build and deployment**:
   - **Source**: Selecione `GitHub Actions`
4. Salve

## Passo 4: Faça Push para Main/Master

```bash
git add .
git commit -m "Setup GitHub Pages"
git push origin main
```

## Passo 5: Verifique o Deploy

1. Vá para **Actions** no repositório
2. Veja o workflow `Deploy to GitHub Pages` rodando
3. Após completar, vá para **Settings > Pages** para ver a URL

## 🔗 URL Final

Sua app estará disponível em:
- `https://seu-usuario.github.io/eldx_agenda_front/`

Exemplo:
- `https://seu-usuario.github.io/eldx_agenda_front/#dores`
- `https://seu-usuario.github.io/eldx_agenda_front/#solucoes`

## ✅ Tudo OK!

O roteamento por hash já funciona perfeitamente com GitHub Pages! 🎉
