import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  form: any;
  mensagem: string = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: [''],
      email: [''],
      senha: [''],
      confirmarSenha: [''],
      aceitarTermos: [false]
    });
  }

  onSubmit(): void {
    console.log(this.form.value);
  }
}