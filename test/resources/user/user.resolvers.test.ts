import * as jwt from "jsonwebtoken";

import { app, db, chai, handleError, expect } from "./../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { JWT_SECRET } from "../../../src/utils/utils";

describe("User", () => {
  let token: string;
  let userId: number;
  const stateRJ = "RJ";

  beforeEach(() => {
    return db.Panel.destroy({ where: {} })
      .then((rows: number) => db.User.destroy({ where: {} }))
      .then((rows: number) =>
        db.User.bulkCreate([
          {
            name: "Felipe Pina",
            email: "fop.net@gmail.com",
            state: stateRJ,
            password: "admin",
          },
          {
            name: "Dany Miller",
            email: "dany@mail.com",
            password: "1234",
            state: "SP",
          },
          {
            name: "Tod",
            email: "tod@mail.com",
            password: "4321",
            state: "RN",
          },
        ]),
      )
      .then((users: UserInstance[]) => {
        userId = users[0].get("id");
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);
      });
  });

  describe("Queries", () => {
    describe("application/json", () => {
      describe("users", () => {
        it("should return a list of Users", () => {
          let body = {
            query: `
                    query {
                        users {
                            name
                            email
                            state
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
              const usersList = res.body.data.users;
              expect(res.body.data).to.be.an("object");
              expect(usersList).to.be.an("array");
              expect(usersList[0]).to.not.have.keys([
                "id",
                "createdAt",
                "updatedAt",
                "panels",
              ]);
              expect(usersList[0]).to.have.keys(["name", "email", "state"]);
            })
            .catch(handleError);
        });

        it("should paginate a list of Users", () => {
          let body = {
            query: `
                            query getUsersList($first: Int, $offset: Int) {
                                users(first: $first, offset: $offset) {
                                    name
                                    email
                                    state
                                    createdAt
                                }
                            }
                        `,
            variables: {
              first: 2,
              offset: 1,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const usersList = res.body.data.users;
              expect(res.body.data).to.be.an("object");
              expect(usersList)
                .to.be.an("array")
                .of.length(2);
              expect(usersList[0]).to.not.have.keys([
                "id",
                "updatedAt",
                "panels",
                "password",
              ]);
              expect(usersList[0]).to.have.keys([
                "name",
                "email",
                "state",
                "createdAt",
              ]);
            })
            .catch(handleError);
        });
      });

      describe("user", () => {
        it("should return a single User", () => {
          let body = {
            query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    state
                                    panels {
                                      state
                                   }
                                }
                            }
                        `,
            variables: {
              id: userId,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const singleUser = res.body.data.user;
              expect(res.body.data).to.be.an("object");
              expect(singleUser).to.be.an("object");
              expect(singleUser).to.have.keys([
                "id",
                "name",
                "email",
                "state",
                "panels",
              ]);
              expect(singleUser.name).to.equal("Felipe Pina");
              expect(singleUser.state).to.equal("RJ");
              expect(singleUser.email).to.equal("fop.net@gmail.com");
              expect(singleUser.panels)
                .to.be.an("array")
                .of.length(0);
            })
            .catch(handleError);
        });

        it("should return only 'name' attribute", () => {
          let body = {
            query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
            variables: {
              id: userId,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const singleUser = res.body.data.user;
              expect(res.body.data).to.be.an("object");
              expect(singleUser).to.be.an("object");
              expect(singleUser).to.have.key("name");
              expect(singleUser.name).to.equal("Felipe Pina");
              expect(singleUser.email).to.be.undefined;
              expect(singleUser.state).to.be.undefined;
              expect(singleUser.createdAt).to.be.undefined;
              expect(singleUser.panels).to.be.undefined;
            })
            .catch(handleError);
        });

        it("should return an error if User not exists", () => {
          let body = {
            query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email
                                }
                            }
                        `,
            variables: {
              id: -1,
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data.user).to.be.null;
              expect(res.body.errors).to.be.an("array");
              expect(res.body).to.have.keys(["data", "errors"]);
              expect(res.body.errors[0].message).to.equal(
                "Error: User with id -1 not found!",
              );
            })
            .catch(handleError);
        });
      });

      describe("currentUser", () => {
        it("should return the User owner of the token", () => {
          let body = {
            query: `
                            query {
                                currentUser {
                                    name
                                    email
                                    state
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
              const currentUser = res.body.data.currentUser;
              expect(currentUser).to.be.an("object");
              expect(currentUser).to.have.keys(["name", "email", "state"]);
              expect(currentUser.name).to.equal("Felipe Pina");
              expect(currentUser.email).to.equal("fop.net@gmail.com");
              expect(currentUser.state).to.equal(stateRJ);
            })
            .catch(handleError);
        });
      });
    });
  });

  describe("Mutations", () => {
    describe("application/json", () => {
      describe("createUser", () => {
        it("should create new User", () => {
          let body = {
            query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                    state
                                }
                            }
                        `,
            variables: {
              input: {
                name: "Drax",
                email: "drax@guardians.com",
                password: "1234",
                state: "SP",
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
              const createdUser = res.body.data.createUser;
              expect(createdUser).to.be.an("object");
              expect(createdUser.name).to.equal("Drax");
              expect(createdUser.email).to.equal("drax@guardians.com");
              expect(createdUser.state).to.equal("SP");
              expect(parseInt(createdUser.id)).to.be.a("number");
            })
            .catch(handleError);
        });
      });

      describe("updateUser", () => {
        it("should update an existing User", () => {
          let body = {
            query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    state
                                }
                            }
                        `,
            variables: {
              input: {
                name: "Felipe Pina chnages",
                email: "pina@gmail.com",
                state: "SP",
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
              const updatedUser = res.body.data.updateUser;
              expect(updatedUser).to.be.an("object");
              expect(updatedUser.name).to.equal("Felipe Pina chnages");
              expect(updatedUser.email).to.equal("pina@gmail.com");
              expect(updatedUser.state).to.equal("SP");
              expect(updatedUser.id).to.be.undefined;
            })
            .catch(handleError);
        });

        it("should block operation if token is invalid", () => {
          let body = {
            query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    state
                                }
                            }
                        `,
            variables: {
              input: {
                name: "Star Lord",
                email: "peter@guardians.com",
                state: "AA",
              },
            },
          };

          return chai
            .request(app)
            .post("/graphql")
            .set("content-type", "application/json")
            .set("authorization", "Bearer INVALID_TOKEN")
            .send(JSON.stringify(body))
            .then(res => {
              expect(res.body.data.updateUser).to.be.null;
              expect(res.body).to.have.keys(["data", "errors"]);
              expect(res.body.errors).to.be.an("array");
              expect(res.body.errors[0].message).to.equal(
                "JsonWebTokenError: jwt malformed",
              );
            })
            .catch(handleError);
        });
      });

      describe("deleteUser", () => {
        it("should delete an existing User", () => {
          let body = {
            query: `
                            mutation {
                                deleteUser
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
              expect(res.body.data.deleteUser).to.be.true;
            })
            .catch(handleError);
        });

        it("should block operation if token is not provided", () => {
          let body = {
            query: `
                      mutation {
                          deleteUser
                      }
                  `,
          };

          return (
            chai
              .request(app)
              .post("/graphql")
              .set("content-type", "application/json")
              // .set("authorization", `Bearer ${token}`)
              .send(JSON.stringify(body))
              .then(res => {
                expect(res.body.errors[0].message).to.equal(
                  "Unauthorized! Token not provided!",
                );
              })
              .catch(handleError)
          );
        });

        it("should block operation if token is provided, but the user does not exists anymore", () => {
          let body = {
            query: `
                      mutation {
                          deleteUser
                      }
                  `,
          };

          return (
            chai
              .request(app)
              .post("/graphql")
              .set("content-type", "application/json")
              .set("authorization", `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.2KgzeaJJh7NUr374s7pVc5vaP3xL-tFkJTYmwYYmMX4`)
              .send(JSON.stringify(body))
              .then(res => {
                expect(res.body.errors[0].message).to.equal(
                  "User does not exists anymore",
                );
              })
              .catch(handleError)
          );
        });
      });
    });
  });
});
