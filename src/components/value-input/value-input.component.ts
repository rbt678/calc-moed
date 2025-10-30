import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CalculatorComponent } from '../calculator/calculator.component';

@Component({
  selector: 'app-value-input',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, CalculatorComponent],
  template: `
    <div class="bg-slate-800 rounded-lg p-4 flex flex-col h-full shadow-lg">
      <h3 class="text-lg font-bold text-indigo-400 mb-3">{{ title() }}</h3>
      
      <form (submit)="addValue($event, numberInput)" class="flex gap-2 mb-3">
        <div class="relative flex-grow">
          <input 
            #numberInput
            type="number"
            step="0.01"
            placeholder="0,00"
            class="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full pr-10"
          >
          <button 
            type="button"
            (click)="openCalculator()"
            aria-label="Abrir calculadora"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 2h10v2H5V5Zm0 4h2v2H5V9Zm4 0h2v2H9V9Zm4 0h2v2h-2V9Zm-8 4h2v2H5v-2Zm4 0h2v2H9v-2Zm4 0h2v2h-2v-2Z" />
            </svg>
          </button>
        </div>
        <button 
          type="submit" 
          class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
        >
          +
        </button>
      </form>
      
      <div class="flex-grow overflow-y-auto pr-2 min-h-[120px]">
        @for (value of values(); track $index; let i = $index) {
          <div class="flex justify-between items-center bg-slate-700 rounded p-2 mb-2 animate-fade-in">
            <span class="text-gray-200">{{ value | currency:'BRL' }}</span>
            <button 
              (click)="removeValue(i)"
              class="text-red-400 hover:text-red-300 font-mono text-xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
              aria-label="Remover valor"
            >
              &times;
            </button>
          </div>
        }
        @if (values().length === 0) {
          <p class="text-slate-500 text-sm text-center py-4">Nenhum valor adicionado.</p>
        }
      </div>
      
      <div class="border-t border-slate-700 mt-3 pt-3">
        <p class="text-right font-bold text-xl text-white">{{ total() | currency:'BRL' }}</p>
      </div>
    </div>
    @if (showCalculator()) {
      <app-calculator 
        (result)="onCalculatorResult($event, numberInput)"
        (close)="closeCalculator()"
      ></app-calculator>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    /* Hide number input arrows */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueInputComponent {
  title = input.required<string>();
  values = input.required<number[]>();
  valuesChange = output<number[]>();

  showCalculator = signal(false);

  total = computed(() => this.values().reduce((sum, current) => sum + current, 0));

  addValue(event: SubmitEvent, inputElement: HTMLInputElement) {
    event.preventDefault();
    const value = parseFloat(inputElement.value.replace(',', '.'));

    if (!isNaN(value) && value > 0) {
      const currentValues = this.values();
      this.valuesChange.emit([...currentValues, value]);
      inputElement.value = '';
      inputElement.focus();
    }
  }

  removeValue(indexToRemove: number) {
    this.valuesChange.emit(this.values().filter((_, index) => index !== indexToRemove));
  }

  openCalculator() {
    if (!this.showCalculator()) {
      this.showCalculator.set(true);
    }
  }

  onCalculatorResult(value: number, inputElement: HTMLInputElement) {
    inputElement.value = String(value);
    this.showCalculator.set(false);
    inputElement.focus();
  }

  closeCalculator() {
    this.showCalculator.set(false);
  }
}