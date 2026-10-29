import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  form: any;
  mensagem: string = '';
  mostrarSenha: boolean = false; // <-- Adicione esta variável!

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: [''],
      senha: [''],
      lembrar: [false]
    });
  }
  // Método chamado pelo botão "Esqueci minha senha" na linha 30:
  recuperarSenha(): void {
    this.mensagem = 'Instruções de recuperação enviadas para o e-mail.';
    console.log('Recuperar senha acionado');
  }

  // Funções auxiliares caso o botão no HTML chame um método no (click):
  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  onSubmit(): void {
    console.log(this.form.value);
  }
}