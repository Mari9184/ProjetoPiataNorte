import { TestBed } from "@angular/core/testing";
import { Orcamento } from "./orcamento";

describe("Orcamento", () => {
  let service: Orcamento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Orcamento);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
