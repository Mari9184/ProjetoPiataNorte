import { AfterViewInit, Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

function formatarHtmlSeguro(html: string): string {
  const documento = new DOMParser().parseFromString(html, 'text/html');

  const converter = (no: Node): string => {
    if (no.nodeType === Node.TEXT_NODE) {
      return (no.textContent ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (!(no instanceof HTMLElement)) return '';
    const conteudo = Array.from(no.childNodes, converter).join('');
    if (no.tagName === 'BR') return '<br>';
    if (no.tagName === 'B' || no.tagName === 'STRONG') return `<strong>${conteudo}</strong>`;
    if (no.tagName === 'DIV' || no.tagName === 'P') return `${conteudo}<br>`;
    return conteudo;
  };

  return Array.from(documento.body.childNodes, converter).join('').replace(/(?:<br>)+$/, '');
}

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  template: `
    <div class="rich-text-editor">
      <div
        #editor
        class="rich-text-editor__input"
        [attr.contenteditable]="desabilitado ? 'false' : 'true'"
        role="textbox"
        aria-multiline="true"
        aria-label="Descrição"
        (input)="atualizarValor()"
        (blur)="onTouched()"
        (paste)="colarTexto($event)"
      ></div>
      <button
        class="rich-text-editor__bold"
        type="button"
        aria-label="Aplicar negrito ao trecho selecionado"
        title="Selecione um trecho e clique para aplicar negrito"
        [disabled]="desabilitado"
        (mousedown)="$event.preventDefault()"
        (click)="aplicarNegrito()"
      ><strong>B</strong> Negrito</button>
    </div>
  `,
  styles: [`
    :host { display: block; margin-top: 6px; }
    .rich-text-editor__input {
      width: 100%;
      min-height: 68px;
      padding: 10px 12px;
      overflow: auto;
      border: 1px solid #e0e4eb;
      border-radius: 8px;
      outline: none;
      background: #fff;
      color: #30343b;
      font: inherit;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .rich-text-editor__input:focus {
      border-color: #b8bec9;
      box-shadow: 0 0 0 3px rgba(181, 31, 38, .08);
    }
    .rich-text-editor__bold {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 7px;
      padding: 5px 9px;
      border: 1px solid #dedfe3;
      border-radius: 6px;
      background: #fff;
      color: #30343b;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .rich-text-editor__bold:disabled { cursor: not-allowed; opacity: .6; }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextEditor),
    multi: true,
  }],
})
export class RichTextEditor implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') private editor?: ElementRef<HTMLDivElement>;

  desabilitado = false;
  private valor = '';
  private onChange: (valor: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.editor) this.editor.nativeElement.innerHTML = this.valor;
  }

  writeValue(valor: string | null): void {
    this.valor = formatarHtmlSeguro(valor ?? '');
    const elemento = this.editor?.nativeElement;
    if (elemento && elemento.innerHTML !== this.valor) {
      elemento.innerHTML = this.valor;
    }
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.desabilitado = deshabilitado;
  }

  atualizarValor(): void {
    if (!this.editor) return;
    this.valor = formatarHtmlSeguro(this.editor.nativeElement.innerHTML);
    if (this.editor.nativeElement.innerHTML !== this.valor) {
      this.editor.nativeElement.innerHTML = this.valor;
    }
    this.onChange(this.valor);
  }

  aplicarNegrito(): void {
    const editor = this.editor?.nativeElement;
    const selecao = window.getSelection();
    if (!editor || !selecao?.rangeCount || selecao.isCollapsed) return;

    const intervalo = selecao.getRangeAt(0);
    if (!editor.contains(intervalo.commonAncestorContainer)) return;

    const negrito = document.createElement('strong');
    negrito.append(intervalo.extractContents());
    intervalo.insertNode(negrito);
    selecao.removeAllRanges();
    const novoIntervalo = document.createRange();
    novoIntervalo.selectNodeContents(negrito);
    selecao.addRange(novoIntervalo);
    this.atualizarValor();
  }

  colarTexto(evento: ClipboardEvent): void {
    evento.preventDefault();
    const texto = evento.clipboardData?.getData('text/plain') ?? '';
    const selecao = window.getSelection();
    if (!selecao?.rangeCount) return;

    const intervalo = selecao.getRangeAt(0);
    intervalo.deleteContents();
    const textoInserido = document.createTextNode(texto);
    intervalo.insertNode(textoInserido);
    intervalo.setStartAfter(textoInserido);
    intervalo.collapse(true);
    selecao.removeAllRanges();
    selecao.addRange(intervalo);
    this.atualizarValor();
  }
}
