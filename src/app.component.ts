import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ValueInputComponent } from './components/value-input/value-input.component';

interface AppState {
  notas: number[];
  moedas: number[];
  sangria: number[];
  cofre: number[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ValueInputComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly storageKey = 'cashCalculatorData';

  notas = signal<number[]>([]);
  moedas = signal<number[]>([]);
  sangria = signal<number[]>([]);
  cofre = signal<number[]>([]);

  // Totals for each category
  totalNotas = computed(() => this.notas().reduce((sum, current) => sum + current, 0));
  totalMoedas = computed(() => this.moedas().reduce((sum, current) => sum + current, 0));
  totalSangria = computed(() => this.sangria().reduce((sum, current) => sum + current, 0));
  totalCofre = computed(() => this.cofre().reduce((sum, current) => sum + current, 0));

  // Calculated results
  valeMoeda = computed(() => this.totalNotas() + this.totalMoedas());
  total = computed(() => this.valeMoeda() + this.totalSangria());
  resultadoFinal = computed(() => this.total() - this.totalCofre());
  ajusteSugerido = computed(() => this.valeMoeda() - this.resultadoFinal());

  constructor() {
    this.loadState();
    
    // This effect will run whenever any of the signals change, saving the new state.
    effect(() => {
      const state: AppState = {
        notas: this.notas(),
        moedas: this.moedas(),
        sangria: this.sangria(),
        cofre: this.cofre(),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
      }
    });
  }

  private loadState() {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        try {
          const state: AppState = JSON.parse(savedState);
          this.notas.set(state.notas || []);
          this.moedas.set(state.moedas || []);
          this.sangria.set(state.sangria || []);
          this.cofre.set(state.cofre || []);
        } catch (e) {
          console.error('Error parsing saved state from localStorage', e);
          // If parsing fails, start with a clean state.
          localStorage.removeItem(this.storageKey);
        }
      }
    }
  }

  updateNotas(newValues: number[]) {
    this.notas.set(newValues);
  }

  updateMoedas(newValues: number[]) {
    this.moedas.set(newValues);
  }

  updateSangria(newValues: number[]) {
    this.sangria.set(newValues);
  }

  updateCofre(newValues: number[]) {
    this.cofre.set(newValues);
  }

  resetAll() {
    // Setting the signals to empty arrays will trigger the effect,
    // which will then save the empty state to localStorage.
    this.notas.set([]);
    this.moedas.set([]);
    this.sangria.set([]);
    this.cofre.set([]);
  }
}
