# Cryptfolio

Dashboard de portefólio de criptomoedas, pensado para uso no telemóvel. Preços em tempo real (EUR) via CoinGecko, gráficos de distribuição e evolução, tema claro/escuro, e instalável como app (PWA).

## Funcionalidades

- Seleção de moedas com pesquisa em tempo real (CoinGecko) e lista de populares
- Preços em EUR com variação nas últimas 24h, atualização automática a cada minuto
- Gráfico de distribuição do portfólio (pizza) e investido vs. atual (barras), com exportação para PNG
- Tabela de breakdown por moeda, ordenável, com edição inline da quantidade
- Portfólio guardado no dispositivo (localStorage) — reabre direto no dashboard
- Tema claro/escuro, com deteção da preferência do sistema
- Instalável no ecrã principal do telemóvel (PWA)

## Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Recharts](https://recharts.org/) para os gráficos
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) para a app instalável
- [CoinGecko API](https://www.coingecko.com/en/api) para preços e pesquisa de moedas

## Desenvolvimento

```bash
npm install
npm run dev
```

Para testar no telemóvel (mesma rede Wi-Fi):

```bash
npm run dev -- --host
```

Abre o endereço `http://<IP-da-rede-local>:5173` mostrado no terminal.

## Build de produção

```bash
npm run build
npm run preview
```

A instalação como PWA e o comportamento completo do service worker só se manifestam em `build`/`preview` (ou já publicado), não em `dev`.

## Estrutura do projeto

```text
src/
  dashboard/
    CryptoDashboard.jsx   # componente principal (estado dos 3 passos)
    dashboard.css         # estilos e variáveis de tema
    data/                 # lista de moedas populares e paleta de cores
    utils/                # formatação, cache de pedidos, cálculo do portfólio
    hooks/                 # pesquisa de moedas, preços, tema, localStorage
    steps/                 # os 3 ecrãs: selecionar, quantidades, dashboard
    components/             # peças reutilizáveis (tabela, gráficos, cards, ícones)
```

## Deploy

O projeto é estático depois do build (pasta `dist/`) — qualquer hosting com HTTPS serve (Vercel, Netlify, etc.). HTTPS é necessário para a instalação como PWA funcionar corretamente no telemóvel.
