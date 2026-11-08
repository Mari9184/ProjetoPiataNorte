import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrcamentoService } from '../../services/orcamento.service';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { Preview } from './preview';

describe('Preview', () => {
  let component: Preview;
  let fixture: ComponentFixture<Preview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preview],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
        { provide: OrcamentoService, useValue: { obterOrcamento: () => of(undefined) } },
        provideRouter([]),
        ...firebaseTestProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Preview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the budget total in the conditions section', () => {
    fixture.detectChanges();

    const conditions = fixture.nativeElement.querySelector('.a4-conditions') as HTMLElement;
    expect(conditions.textContent).toContain('Total');
    expect(conditions.querySelector('li strong')?.textContent).toContain(component.formatarReais(10000));
  });
});
