
describe("Cypress + TypeScript setup", () => {
  it("loads the example page and checks content", () => {
    cy.visit("/");
       cy.contains("Kitchen Sink").should("be.visible");
  });
});