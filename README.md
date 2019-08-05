# Backend Programming challenge

## Critério de avaliação

- Solução funcional
- Organização do projeto
- Arquitetura
- Clean code
- [Controle de acesso](https://en.wikipedia.org/wiki/Access_control) de sua API

## Descrição

O desafio consiste em construir um API para servir os dados para a aplicação Front-end. Para isso, você deverá importar [este conjunto de dados](https://drive.google.com/file/d/1dbURdS6TjfnweoFSB_0vqJpn77QJFXoZ/view?usp=sharing) em uma tabela no banco de dados relacional de sua escolha. Esse arquivo contêm dados de instalação de painéis solares nos EUA. O quadro abaixo mostra os atributos do conjunto de dados e sua descrição. Você deverá expor esses dados através da API.

| Nome              | Descrição                                                   |
| ----------------- | ----------------------------------------------------------- |
| Data Provider     | Agência nacional responsável por fornecer o dado em questão |
| Installation Date | Data de instalação dos painéis solares                      |
| System Size       | Potência do sistema em MWh                                  |
| Zip Code          | CEP do local de instalação                                  |
| State             | Estado onde foi instalado os painéis solares                |
| Cost              | Custo de instalação                                         |

**Você deverá implementar controle de acesso com o objetivo de expor os dados apenas para usuários logados**. Você pode implementar isso usando o mecanismo que preferir (JWT ou OAuth, por exemplo). A tabela de usuários deverá conter pelos menos os seguintes atributos: `name`, `email`, e `state`.
Como requisito, cada usuário só pode ter acesso a dados de instalações solares do seu estado. Em hipótese algum ele deve se capaz de acessar dados de instalações de outros estados. Caso um usuário tente acessar dados de um estado que não seja o seu, a API deve retornar o [status HTTP 401 Unauthorized](https://httpstatuses.com/401).
Como parte do desafio você deverá também criar o endpoinst `/users` respondendo aos métodos GET, POST e DELETE. O que queremos avaliar aqui é como você pensa sobre a modelagem desde endpoint e o porquê de você ter definido ela da forma escolhida. Nós esperamos que você se coloque no lugar do cliente da sua API.

## Requisitos obrigatórios

- Implementar API utilizando RESTful ou GraphQL
- Utilizar Node.js para implementação da API utilizando o framework de sua preferência. Alguns exemplos: [Express.js](https://expressjs.com/), [NestJS](https://nestjs.com) e [Koa](https://koajs.com)
- A API deve retornar os dados apenas para usuário logados
- Padronização do código: seguir algum styleguide de JavaScript e CSS. Se preferir utilize o [Prettier](https://prettier.io/)
- Utilizar o conjunto de dados por completo
- Persistir os dados utilizando um banco de dados relacional. Exemplos: [PostgreSQL](https://www.postgresql.org) e [MySQL](https://www.mysql.com)

## Bônus

- Implementar testes
- Utilizar TypeScript
