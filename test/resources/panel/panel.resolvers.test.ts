import * as jwt from "jsonwebtoken";

import { chai, db, app, expect, handleError } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from "../../../src/utils/utils";
import { PanelInstance } from "../../../src/models/PanelModel";

describe("Panel", () => {
  let token: string;
  let stateId: string;
  let panelId: number;

  beforeEach(() => {
    return db.Panel.destroy({ where: {} })
      .then((rows: number) => db.User.destroy({ where: {} }))
      .then((rows: number) =>
        db.User.create({
          name: "Rocket",
          email: "rocket@guardians.com",
          state: "RJ",
          password: "1234",
        }),
      )
      .then((user: UserInstance) => {
        stateId = user.get("state");
        const payload = { sub: stateId };
        token = jwt.sign(payload, JWT_SECRET);

        return db.Panel.bulkCreate([
          {
            installation_date: "01/01/2019",
            data_provider: "Rio de janeiro",
            system_size: 1.0,
            state: stateId,
            zip_code: "12345678",
            cost: 1.1,
          },
          {
            installation_date: "02/02/2019",
            data_provider: "Rio de janeiro",
            system_size: 2.0,
            state: stateId,
            zip_code: "2345679",
            cost: 2.1,
          },
          {
            installation_date: "03/03/2019",
            data_provider: "Rio de janeiro",
            system_size: 3.0,
            state: stateId,
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
            .send(JSON.stringify(body))
            .then(res => {
              const panelList = res.body.data.posts;
              expect(res.body.data).to.be.an("object");
              expect(panelList).to.be.an("array");
              expect(panelList)
                .to.be.an("array")
                .with.length(2);
              expect(panelList[0]).to.not.have.keys([
                "id",
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[1]).to.have.keys([
                "id",
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[0].cost).to.equal(1.0);
              expect(panelList[0].system_size).to.equal(1.1);
              expect(panelList[0].zip_code).to.equal("12345678");
              expect(panelList[0].state).to.equal("RJ");
              expect(panelList[0].installation_date).to.equal("01/01/2019");
              expect(panelList[0].id).to.equal(1);
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
            .send(JSON.stringify(body))
            .then(res => {
              const singlePost = res.body.data.post;
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
                                id
                                data_provider
                                installation_date
                                system_size
                                zip_code
                                state
                                cost
                            }
                        }
                    `;

          // /graphql?variables={"first": 10, "offset": 1}

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/graphql")
            .send(query)
            .query({
              variables: JSON.stringify({
                first: 2,
                offset: 1,
              }),
            })
            .then(res => {
              const panelList = res.body.data.posts;
              expect(res.body.data).to.be.an("object");
              expect(panelList)
                .to.be.an("array")
                .with.length(2);
              expect(panelList[0]).to.not.have.keys([
                "id",
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[1]).to.have.keys([
                "id",
                "data_provider",
                "installation_date",
                "system_size",
                "zip_code",
                "state",
                "cost",
              ]);
              expect(panelList[1].zip_code).to.equal("34567890");
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
                            mutation createNewPanel($input: PostInput!) {
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
                installation_date: "01/02/2019",
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
              const createdPanel = res.body.data.createPost;
              expect(createdPanel).to.be.an("object");
              expect(createdPanel).to.have.keys([
                "id",
                "title",
                "content",
                "author",
              ]);
              expect(createdPanel.data_provider).to.equal("My dp");
              expect(createdPanel.installation_date).to.equal("01/02/2019");
              expect(createdPanel.zip_code).to.equal("22011010");
              expect(createdPanel.state).to.equal("SP");
              expect(createdPanel.cost).to.equal(1.44);
              expect(createdPanel.system_zie).to.equal(1.1);
              expect(parseInt(createdPanel.id)).to.not.null;
            })
            .catch(handleError);
        });
      });

      describe("updatePanel", () => {
        it("should update an existing Panel", () => {
          let body = {
            query: `
                            mutation updateExistingPost($id: ID!, $input: PanelInput!) {
                                updatePost(id: $id, input: $input) {
                                    cost
                                    system_size
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
              expect(updatedPanel.data_provider).to.equal("My dp");
              expect(updatedPanel.installation_date).to.equal("01/02/2019");
              expect(updatedPanel.zip_code).to.equal("22011010");
              expect(updatedPanel.state).to.equal("SP");
              expect(updatedPanel.cost).to.equal(10.0);
              expect(updatedPanel.system_zie).to.equal(9.0);
              expect(parseInt(updatedPanel.id)).to.not.null;
            })
            .catch(handleError);
        });
      });

      describe("deletePanel", () => {
        it("should delete an existing Panel", () => {
          let body = {
            query: `
                            mutation deleteExistingPost($id: ID!) {
                                deletePost(id: $id)
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
              expect(res.body.data.deletePost).to.be.true;
            })
            .catch(handleError);
        });
      });
    });
  });
});
