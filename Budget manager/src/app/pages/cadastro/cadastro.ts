import { Component } from '@angular/core';
<<<<<<< HEAD
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
=======
import { ReactiveFormsModule } from '@angular/forms';
>>>>>>> 72f8949b3cc3c1fc22aec87a91a8d70eee881248
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {}