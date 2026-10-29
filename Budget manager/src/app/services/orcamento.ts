import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Orcamento } from '../models/orcamento.model';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoService {
  private firestore: Firestore = inject(Firestore);
  private orcamentosRef = collection(this.firestore, 'orcamentos');

  // Consulta todos os orçamentos no Firestore em tempo real
  obterOrcamentos(): Observable<Orcamento[]> {
    return collectionData(this.orcamentosRef, { idField: 'id_orcamento' }) as Observable<Orcamento[]>;
  }

  // Grava um novo orçamento
  criarOrcamento(orcamento: Orcamento) {
    return addDoc(this.orcamentosRef, orcamento);
  }

  // Remove um orçamento pelo ID
  eliminarOrcamento(id: string) {
    const docRef = doc(this.firestore, `orcamentos/${id}`);
    return deleteDoc(docRef);
  }
}