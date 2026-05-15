import { Component, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductFilter, ProductType } from '../core/models/product.model';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="filters">
      <h3 class="filters__title">Filtre</h3>

      <form [formGroup]="form" novalidate>

        <!-- Product type — wrapped in fieldset for screen reader grouping -->
        <fieldset class="filter-section filter-fieldset">
          <legend class="filter-section__label">TIP PRODUS</legend>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="" />
            <span>Toate</span>
          </label>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="WHEEL" />
            <span>Roată Transpalet</span>
          </label>
          <label class="filter-check">
            <input type="radio" formControlName="type" value="BEARING" />
            <span>Rulment</span>
          </label>
        </fieldset>

        <div class="filter-section">
          <label class="filter-section__label" for="filter-material">MATERIAL</label>
          <input
            id="filter-material"
            class="filter-input"
            formControlName="material"
            placeholder="ex. Poliuretan, Nailon…"
            autocomplete="off"
          />
        </div>

        <div class="filter-section">
          <label class="filter-section__label" for="filter-size">DIMENSIUNE</label>
          <input
            id="filter-size"
            class="filter-input"
            formControlName="size"
            placeholder="ex. 200mm"
            autocomplete="off"
          />
        </div>

        <div class="filter-section">
          <label class="filter-section__label" for="filter-load">CAPACITATE ÎNCĂRCARE (kg)</label>
          <input
            id="filter-load"
            class="filter-input"
            type="number"
            formControlName="maxLoad"
            placeholder="ex. 1000"
            min="0"
          />
        </div>

        <div class="filter-section">
          <label class="filter-section__label" for="filter-diameter">DIAMETRU RULMENT</label>
          <input
            id="filter-diameter"
            class="filter-input"
            formControlName="diameter"
            placeholder="ex. 52mm"
            autocomplete="off"
          />
        </div>

        <!-- UC-5: bearing material filter (required by spec) -->
        <div class="filter-section">
          <label class="filter-section__label" for="filter-bearing-material">MATERIAL RULMENT</label>
          <input
            id="filter-bearing-material"
            class="filter-input"
            formControlName="bearingMaterial"
            placeholder="ex. Inox, Ceramică…"
            autocomplete="off"
          />
        </div>

        <div class="filter-section">
          <label class="filter-section__label" for="filter-name">CAUTĂ DUPĂ NUME</label>
          <input
            id="filter-name"
            class="filter-input"
            formControlName="name"
            placeholder="Caută produs…"
            type="search"
            autocomplete="off"
          />
        </div>

        <button class="filter-reset" type="button" (click)="reset()">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Resetare filtre
        </button>

      </form>
    </div>
  `,
  styles: [`
    .filters {
      padding: var(--sp-6) var(--sp-5);
    }

    .filters__title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--rw-text);
      text-transform: uppercase;
      margin: 0 0 var(--sp-5);
    }

    .filter-section {
      margin-bottom: var(--sp-6);
    }

    /* Remove fieldset default styling */
    .filter-fieldset {
      border: none;
      padding: 0;
      margin: 0 0 var(--sp-6);
      min-width: 0;
    }

    .filter-section__label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.9px;
      color: var(--rw-muted);
      margin: 0 0 var(--sp-3);
      text-transform: uppercase;
    }

    /* legend inherits label styles */
    legend.filter-section__label {
      padding: 0;
      float: left;
      width: 100%;
      margin-bottom: var(--sp-3);
    }

    /* Clearfix after legend float */
    .filter-fieldset::after {
      content: '';
      display: table;
      clear: both;
    }

    .filter-check {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: 14px;
      color: var(--rw-text);
      margin-bottom: var(--sp-2);
      cursor: pointer;
      border-radius: var(--r-sm);
      padding: 3px 4px;
      transition: background var(--t-fast);
    }

    .filter-check:hover { background: var(--rw-bg); }

    .filter-check input[type="radio"] {
      accent-color: var(--rw-orange);
      width: 16px;
      height: 16px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .filter-input {
      width: 100%;
      padding: 9px var(--sp-3);
      border: 1px solid var(--rw-border);
      border-radius: var(--r-md);
      font-size: 13px;
      color: var(--rw-text);
      background: #fff;
      outline: none;
      font-family: inherit;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .filter-input:focus {
      border-color: var(--rw-orange);
      box-shadow: 0 0 0 3px rgba(232,96,28,0.12);
    }

    .filter-input::placeholder { color: #b0b7c0; }

    /* Hide number input spinners */
    .filter-input[type="number"]::-webkit-inner-spin-button,
    .filter-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
    .filter-input[type="number"] { -moz-appearance: textfield; }

    .filter-reset {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      width: 100%;
      padding: 9px var(--sp-3);
      background: transparent;
      border: 1px solid var(--rw-border);
      border-radius: var(--r-md);
      font-size: 13px;
      font-weight: 500;
      color: var(--rw-muted);
      cursor: pointer;
      font-family: inherit;
      transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
      margin-top: var(--sp-1);
    }

    .filter-reset:hover {
      border-color: var(--rw-orange);
      color: var(--rw-orange);
      background: rgba(232,96,28,0.04);
    }
  `],
})
export class ProductFilterComponent {
  readonly filterChange = output<ProductFilter>();
  private readonly fb   = inject(FormBuilder);

  readonly form = this.fb.group({
    name:            [''],
    type:            ['' as ProductType | ''],
    size:            [''],
    material:        [''],
    maxLoad:         [null as number | null],
    diameter:        [''],
    bearingMaterial: [''],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emit());
  }

  reset(): void {
    this.form.reset({
      name: '', type: '', size: '', material: '',
      maxLoad: null, diameter: '', bearingMaterial: '',
    });
    this.filterChange.emit({});
  }

  private emit(): void {
    const v = this.form.value;
    const filter: ProductFilter = {};
    if (v.name)            filter.name            = v.name;
    if (v.type)            filter.type            = v.type as ProductType;
    if (v.size)            filter.size            = v.size;
    if (v.material)        filter.material        = v.material;
    if (v.maxLoad != null) filter.maxLoad         = v.maxLoad;
    if (v.diameter)        filter.diameter        = v.diameter;
    if (v.bearingMaterial) filter.bearingMaterial = v.bearingMaterial;
    this.filterChange.emit(filter);
  }
}
