import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" (click)="close.emit()">
      <div class="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl w-full max-w-xs text-white" (click)="$event.stopPropagation()">
        
        <div class="bg-slate-900 rounded-lg p-4 text-right mb-4 overflow-hidden">
          <p class="text-slate-400 text-lg h-6 truncate" title="{{ operationDisplay }}">{{ operationDisplay }}</p>
          <p class="text-4xl font-mono break-all h-12 flex items-center justify-end">
            @if (errorState) {
              <span class="text-rose-400 text-3xl">Error</span>
            } @else {
              {{ displayValue }}
            }
          </p>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <button (click)="clear()" class="calculator-btn function-btn">C</button>
          <button (click)="backspace()" class="calculator-btn function-btn text-2xl">⌫</button>
          <button (click)="inputOperator('/')" class="calculator-btn operator-btn">&divide;</button>
          <button (click)="inputOperator('*')" class="calculator-btn operator-btn">&times;</button>
          
          <button (click)="inputDigit('7')" class="calculator-btn">7</button>
          <button (click)="inputDigit('8')" class="calculator-btn">8</button>
          <button (click)="inputDigit('9')" class="calculator-btn">9</button>
          <button (click)="inputOperator('-')" class="calculator-btn operator-btn">-</button>

          <button (click)="inputDigit('4')" class="calculator-btn">4</button>
          <button (click)="inputDigit('5')" class="calculator-btn">5</button>
          <button (click)="inputDigit('6')" class="calculator-btn">6</button>
          <button (click)="inputOperator('+')" class="calculator-btn operator-btn">+</button>

          <button (click)="inputDigit('1')" class="calculator-btn">1</button>
          <button (click)="inputDigit('2')" class="calculator-btn">2</button>
          <button (click)="inputDigit('3')" class="calculator-btn">3</button>
          <button (click)="calculate()" rowspan="2" class="row-span-2 calculator-btn bg-indigo-600 hover:bg-indigo-700">=</button>
          
          <button (click)="inputDigit('0')" class="col-span-2 calculator-btn">0</button>
          <button (click)="inputDecimal('.')" class="calculator-btn">.</button>
        </div>

        <div class="mt-4 flex gap-2">
            <button (click)="confirmResult()" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Usar Valor
            </button>
            <button (click)="close.emit()" class="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Fechar
            </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .calculator-btn {
      @apply bg-slate-700 text-2xl font-bold rounded-lg h-16 transition-transform duration-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 active:scale-95;
    }
    .calculator-btn:hover {
      @apply bg-slate-600;
    }
    .operator-btn {
      @apply bg-slate-600 text-indigo-400 text-3xl;
    }
    .operator-btn:hover {
      @apply bg-slate-500;
    }
    .function-btn {
      @apply bg-rose-600 text-white;
    }
    .function-btn:hover {
      @apply bg-rose-700;
    }
    @keyframes fade-in-fast {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1.0); }
    }
    .animate-fade-in-fast {
      animation: fade-in-fast 0.15s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
  },
})
export class CalculatorComponent {
  result = output<number>();
  close = output<void>();

  displayValue = '0';
  operationDisplay = '';
  private firstOperand: number | null = null;
  private waitingForSecondOperand = false;
  private operator: string | null = null;
  errorState = false;

  handleKeyDown(event: KeyboardEvent) {
    if (event.key >= '0' && event.key <= '9') {
      this.inputDigit(event.key);
    } else if (event.key === '.') {
      this.inputDecimal(event.key);
    } else if (['+', '-', '*', '/'].includes(event.key)) {
      this.inputOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
      event.preventDefault();
      this.calculate();
    } else if (event.key === 'Backspace') {
      this.backspace();
    } else if (event.key.toLowerCase() === 'c' || event.key === 'Delete') {
      this.clear();
    } else if (event.key === 'Escape') {
      this.close.emit();
    }
  }

  inputDigit(digit: string) {
    if (this.errorState) this.clear();
    if (this.displayValue.length >= 15 && !this.waitingForSecondOperand) return;

    if (this.waitingForSecondOperand) {
      this.displayValue = digit;
      this.waitingForSecondOperand = false;
    } else {
      this.displayValue = this.displayValue === '0' ? digit : this.displayValue + digit;
    }
  }

  inputDecimal(dot: string) {
    if (this.errorState) this.clear();
    if (this.waitingForSecondOperand) {
      this.displayValue = '0.';
      this.waitingForSecondOperand = false;
      return;
    }

    if (!this.displayValue.includes(dot)) {
      this.displayValue += dot;
    }
  }

  inputOperator(operator: string) {
    if (this.errorState) return;
    const inputValue = parseFloat(this.displayValue);

    if (this.operator && this.waitingForSecondOperand) {
      this.operator = operator;
      this.operationDisplay = `${this.firstOperand} ${this.operator}`;
      return;
    }

    if (this.firstOperand === null) {
      this.firstOperand = inputValue;
    } else if (this.operator) {
      const result = this.performCalculation(this.operator, this.firstOperand, inputValue);
      if (!isFinite(result)) {
        this.handleError();
        return;
      }
      this.displayValue = this.formatResult(result);
      this.firstOperand = result;
    }

    this.waitingForSecondOperand = true;
    this.operator = operator;
    this.operationDisplay = `${this.firstOperand} ${this.operator}`;
  }

  private performCalculation(op: string, first: number, second: number): number {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second; // JS returns Infinity for n/0
      default: return second;
    }
  }

  calculate() {
    if (this.errorState || this.operator === null || this.waitingForSecondOperand || this.firstOperand === null) {
      return;
    }

    const secondOperand = parseFloat(this.displayValue);
    const result = this.performCalculation(this.operator, this.firstOperand, secondOperand);
    
    if (!isFinite(result)) {
      this.handleError();
      return;
    }

    this.operationDisplay = `${this.firstOperand} ${this.operator} ${secondOperand} =`;
    this.displayValue = this.formatResult(result);
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
  }

  clear() {
    this.displayValue = '0';
    this.operationDisplay = '';
    this.firstOperand = null;
    this.waitingForSecondOperand = false;
    this.operator = null;
    this.errorState = false;
  }
  
  backspace() {
    if (this.errorState) {
      this.clear();
      return;
    }
    if (this.waitingForSecondOperand) return;
    
    this.displayValue = this.displayValue.length > 1 ? this.displayValue.slice(0, -1) : '0';
  }

  confirmResult() {
    if(this.errorState) return;
    const value = parseFloat(this.displayValue);
    if (!isNaN(value)) {
      this.result.emit(value);
    }
  }

  private handleError() {
    this.errorState = true;
    this.operationDisplay = '';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
  }

  private formatResult(num: number): string {
    return String(parseFloat(num.toPrecision(15)));
  }
}
