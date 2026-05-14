import { Component, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductFilter, ProductType } from '../core/models/product.model';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <aside class="filters">
      <h3 class="filters__title">Filtre</h3>

      <form [formGroup]="form">

        <div class="filter-section">
          <p class="filter-section__label">TIP PRODUS</p>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="" /> Toate
          </label>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="WHEEL" /> Roată Transpalet
          </label>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="BEARING" /> Rulment
          </label>
        </div>

        <div class="filter-section">
          <p class="filter-section__label">MATERIAL</p>
          <input
            class="filter-input"
            formControlName="material"
            placeholder="ex. Poliuretan, Nailon…"
          />
        </div>

        <div class="filter-section">
          <p class="filter-section__label">DIMENSIUNE</p>
          <input
            class="filter-input"
            formControlName="size"
            placeholder="ex. 200mm"
          />
        </div>

        <div class="filter-section">
          <p class="filter-section__label">CAPACITATE ÎNCĂRCARE (kg)</p>
          <input
            class="filter-input"
            type="number"
            formControlName="maxLoad"
            placeholder="ex. 1000"
            min="0"
          />
        </div>

        <div class="filter-section">
          <p class="filter-section__label">DIAMETRU RULMENT</p>
          <input
            class="filter-input"
            formControlName="diameter"
            placeholder="ex. 52mm"
          />
        </div>

        <div class="filter-section">
          <p class="filter-section__label">CAUTĂ DUPĂ NUME</p>
          <input
            class="filter-input"
            formControlName="name"
            placeholder="Caută produs…"
          />
        </div>

        <button class="filter-reset" type="button" (click)="reset()">
          Resetare filtre
        </button>

      </form>
    </aside>
  `,
  styles: [`
    .filters {
      padding: 24px 20px;
    }

    .filters__title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--rw-text);
      text-transform: uppercase;
      margin: 0 0 20px;
    }

    .filter-section {
      margin-bottom: 24px;
    }

    .filter-section__label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--rw-muted);
      margin: 0 0 10px;
    }

    .filter-check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--rw-text);
      margin-bottom: 8px;
      cursor: pointer;
    }

    .filter-check input[type="radio"] {
      accent-color: var(--rw-orange);
      width: 15px;
      height: 15px;
      cursor: pointer;
    }

    .filter-input {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      font-size: 13px;
      color: var(--rw-text);
      background: #fff;
      outline: none;
      font-family: inherit;
      transition: border-color .15s;
    }

    .filter-input:focus {
      border-color: var(--rw-orange);
      box-shadow: 0 0 0 3px rgba(232,96,28,.10);
    }

    .filter-input::placeholder { color: #aaa; }

    .filter-reset {
      width: 100%;
      padding: 9px;
      background: transparent;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      font-size: 13px;
      color: var(--rw-muted);
      cursor: pointer;
      font-family: inherit;
      transition: all .15s;
      margin-top: 4px;
    }

    .filter-reset:hover {
      border-color: var(--rw-orange);
      color: var(--rw-orange);
    }
  `],
})
export class ProductFilterComponent {
  readonly filterChange = output<ProductFilter>();
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name:     [''],
    type:     ['' as ProductType | ''],
    size:     [''],
    material: [''],
    maxLoad:  [null as number | null],
    diameter: [''],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emit());
  }

  reset(): void {
    this.form.reset({ name: '', type: '', size: '', material: '', maxLoad: null, diameter: '' });
    this.filterChange.emit({});
  }

  private emit(): void {
    const v = this.form.value;
    const filter: ProductFilter = {};
    if (v.name)              filter.name     = v.name;
    if (v.type)              filter.type     = v.type as ProductType;
    if (v.size)              filter.size     = v.size;
    if (v.material)          filter.material = v.material;
    if (v.maxLoad != null)   filter.maxLoad  = v.maxLoad;
    if (v.diameter)          filter.diameter = v.diameter;
    this.filterChange.emit(filter);
  }
}
