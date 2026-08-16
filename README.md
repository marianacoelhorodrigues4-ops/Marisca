# MARISCA

Primeira versão do aplicativo de apoio à produção e comercialização das marisqueiras.

## O que inclui
- Registro de produção diária
- Controle de caixas/galeias, horas trabalhadas e peso da sacolinha
- Cálculo automático de produção, vendas pendentes e receita
- Visualização de produção por dia e mês
- Painel com maré e previsão do tempo
- Persistência local no navegador com localStorage

## Como usar
1. Abra o arquivo `index.html` em um navegador, ou
2. Rode um servidor local na pasta do projeto:

   python3 -m http.server 8000

3. Acesse: http://localhost:8000

## Observações
- Os dados ficam salvos no navegador do usuário.
- A consulta de maré usa a base local em `mares-2026.json`.
- A previsão do tempo usa a API Open-Meteo.
