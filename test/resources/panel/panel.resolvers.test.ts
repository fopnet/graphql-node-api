import * as jwt from "jsonwebtoken";

import { chai, db, app, expect, handleError } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from "../../../src/utils/utils";
import { PanelInstance } from "../../../src/models/PanelModel";
import * as moment from "../../../node_modules/moment";

describe("Panel", () => {
  let token: string;
  let stateRJ: string = "RJ";
  let panelId: number;
  let userId: number;

  beforeEach(() => {
    return db.Panel.destroy({ where: {} })
      .then((rows: number) => db.User.destroy({ where: {} }))
      .then((rows: number) =>
        db.User.create({
          name: "Rocket",
          email: "rocket@guardians.com",
          state: stateRJ,
          password: "1234",
        }),
      )
      .then((user: UserInstance) => {
        userId = user.get("id");
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);

        return db.Panel.bulkCreate([
          {
            installation_date: moment("01/01/2019", "DD/MM/YYYY").toDate(),
            data_provider: "Rio de janeiro",
            system_size: 1.0,
            state: stateRJ,
            zip_code: "12345678",
            cost: 1.1,
          },
          {
            installation_date: moment("02/02/2019", "DD/MM/YYYY").toDate(),
            data_provider: "Rio de janeiro",
            system_size: 2.0,
            state: stateRJ,
            zip_code: "23456789",
            cost: 2.1,
          },
          {
            installation_date: moment("03/03/2019", "DD/MM/YYYY").toDate(),
            data_provider: "Sao Paulo",
            system_size: 3.0,
            state: "SP",
            zip_code: "34567890",
            cost: 3.1,
          },
        ]);
      })
      .then((panels: PanelInstance[]) => {
        panelId = panels[0].get("id");
      });
  });

  describe("Queries", () => {
    describe("application/json", () => {
      describe("panels", () => {
        it("should return a list of Panels", () => {
          let body = {
            query: `
                    query {
                        panels {
                            id
                            data_provider
                            installation_date
                            system_size
                            zip_code
                            state
                            cost
                        }
                    }
                `,
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const panelList = res.body.data.panels;
              expect(res.body.data).to.be.an("object");
              expect(panelList).to.be.an("array");
              expect(panelList)
                .to.be.an("array")
                .with.length(2);
              expect(panelList[0]).to.not.have.keys(["createdAt", "updatedAt"]);
              expect(panelList[1]).to.keys([
                "id",
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[0].system_size).to.equal(1);
              expect(panelList[0].cost).to.equal(1.1);
              expect(panelList[0].zip_code).to.equal("12345678");
              expect(panelList[0].state).to.equal("RJ");
              expect(panelList[0].installation_date).to.equal("2019-01-01");
              expect(panelList[0].id).to.equal("1");
            })
            .catch(handleError);
        });
      });

      describe("panel", () => {
        it("should return a single Panel", () => {
          const body = {
            query: `
                            query getPanel($id: ID!){
                                panel(id: $id) {
                                    data_provider
                                    installation_date
                                    system_size
                                    zip_code
                                    state
                                    cost
                                }
                            }
                        `,
            variables: {
              id: panelId,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const singlePost = res.body.data.panel;
              expect(res.body.data).to.have.key("panel");
              expect(singlePost).to.be.an("object");
              expect(singlePost).to.have.keys([
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(singlePost).to.not.have.keys(["createdAt", "updatedAt"]);
              expect(singlePost.system_size).to.equal(1.0);
              expect(singlePost.data_provider).to.equal("Rio de janeiro");
            })
            .catch(handleError);
        });
      });
    });

    describe("application/graphql", () => {
      describe("panels", () => {
        it("should paginate a list of Panels", () => {
          let query = `
                        query getPanelList($first: Int, $offset: Int) {
                            panels(first: $first, offset: $offset) {
                                data_provider
                                installation_date
                                system_size
                                zip_code
                                state
                                cost
                            }
                        }
                    `;

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .set("authorization", `Bearer ${token}`)
            .send(query)
            .query({
              variables: JSON.stringify({
                first: 2,
                offset: 1,
              }),
            })
            .then(res => {
              const panelList = res.body.data.panels;
              expect(res.body.data).to.be.an("object");
              expect(panelList)
                .to.be.an("array")
                .with.length(1);
              expect(panelList[0]).to.have.keys([
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[0]).to.not.have.keys([
                "id",
                "createdAt",
                "updatedAt",
              ]);
              expect(panelList[0].zip_code).to.equal("23456789");
            })
            .catch(handleError);
        });
      });

      describe("chart queries", () => {
        it("should panelsCountByState", () => {
          let query = `
                        query {
                          panelsCountByState  {
                                state
                                amount
                          } 
                        }
                    `;

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .set("authorization", `Bearer ${token}`)
            .send(query)
            .then(res => {
              const amountList = res.body.data.panelsCountByState;

              expect(res.body.data).to.be.an("object");
              expect(amountList).to.be.an("object");
              expect(amountList).to.have.keys(["state", "amount"]);
              expect(amountList.amount).to.equal(2);
              expect(amountList.state).to.equal(stateRJ);
            })
            .catch(handleError);
        });

        it("should panelsCostByZipcode", () => {
          let query = `
                        query {
                          panelsTopCostByZipcode  {
                                zipcode
                                cost
                          } 
                        }
                    `;

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .set("authorization", `Bearer ${token}`)
            .send(query)
            .then(res => {
              const amount = res.body.data.panelsTopCostByZipcode;

              expect(res.body.data).to.be.an("object");
              expect(amount).to.be.an("object");
              expect(amount).to.have.keys(["zipcode", "cost"]);
              expect(amount.zipcode).to.equal("23456789");
              expect(amount.cost).to.equal(2.1);
            })
            .catch(handleError);
        });

        it("should panelsCountTop3ByMonth", () => {
          let query = `
                        query {
                          panelsCountTop3ByMonth  {
                                month
                                amount
                          } 
                        }
                    `;

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .set("authorization", `Bearer ${token}`)
            .send(query)
            .then(res => {
              const top3List = res.body.data.panelsCountTop3ByMonth;

              expect(res.body.data).to.be.an("object");
              expect(top3List).to.be.an("array");
              expect(top3List[0]).to.have.keys(["month", "amount"]);
              expect(top3List[0].month).to.equal("1/2019");
              expect(top3List[0].amount).to.equal(1);
              expect(top3List[1].month).to.equal("2/2019");
              expect(top3List[1].amount).to.equal(1);
            })
            .catch(handleError);
        });

        it("should panelsSystemSizeByYear", () => {
          let query = `
                        query {
                          panelsSystemSizeByYear  {
                                size
                                year
                          } 
                        }
                    `;

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .set("authorization", `Bearer ${token}`)
            .send(query)
            .then(res => {
              const sizeByYearList = res.body.data.panelsSystemSizeByYear;
              expect(res.body.data).to.be.an("object");
              expect(sizeByYearList).to.be.an("array");
              expect(sizeByYearList)
                .to.be.an("array")
                .with.length(1);
              expect(sizeByYearList[0]).to.have.keys(["size", "year"]);
              expect(sizeByYearList[0].year).to.equal("2019");
              expect(sizeByYearList[0].size).to.equal(3);
            })
            .catch(handleError);
        });
      });
    });
  });

  describe("Mutations", () => {
    describe("application/json", () => {
      describe("createPanel", () => {
        it("should create a new Panel", () => {
          let body = {
            query: `
                            mutation createNewPanel($input: PanelInput!) {
                                createPanel(input: $input) {
                                    data_provider
                                    installation_date
                                    system_size
                                    zip_code
                                    state
                                    cost
                                }
                            }
                        `,
            variables: {
              input: {
                data_provider: "My dp",
                installation_date: "2019-02-01",
                system_size: 1.1,
                zip_code: "22011010",
                state: "SP",
                cost: 1.44,
              },
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const createdPanel = res.body.data.createPanel;
              expect(createdPanel).to.be.an("object");
              expect(createdPanel).to.have.keys([
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(createdPanel.data_provider).to.equal("My dp");
              expect(createdPanel.installation_date).to.equal("2019-02-01");
              expect(createdPanel.zip_code).to.equal("22011010");
              expect(createdPanel.state).to.equal("SP");
              expect(createdPanel.cost).to.equal(1.44);
              expect(createdPanel.system_size).to.equal(1.1);
              expect(parseInt(createdPanel.id)).to.not.null;
            })
            .catch(handleError);
        });
      });

      describe("updatePanel", () => {
        it("should update an existing Panel", () => {
          let body = {
            query: `
                            mutation updateExistingPost($id: ID!, $input: PanelUpdateInput!) {
                                updatePanel(id: $id, input: $input) {
                                    cost
                                    system_size
                                    data_provider
                                }
                            }
                        `,
            variables: {
              id: panelId,
              input: {
                cost: 10.0,
                system_size: 9.0,
              },
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const updatedPanel = res.body.data.updatePanel;
              expect(updatedPanel.data_provider).to.equal("Rio de janeiro");
              expect(updatedPanel.cost).to.equal(10.0);
              expect(updatedPanel.system_size).to.equal(9.0);
              expect(parseInt(updatedPanel.id)).to.not.null;
            })
            .catch(handleError);
        });
      });

      describe("deletePanel", () => {
        it("should delete an existing Panel", () => {
          let body = {
            query: `
                            mutation deleteExistingPanel($id: ID!) {
                                deletePanel(id: $id)
                            }
                        `,
            variables: {
              id: panelId,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data).to.have.key("deletePanel");
              expect(res.body.data.deletePanel).to.be.true;
            })
            .catch(handleError);
        });
      });
    });
  });
});
