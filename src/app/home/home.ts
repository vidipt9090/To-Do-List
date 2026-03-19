import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  newText = '';

@Output() close = new EventEmitter<void>();

  closeBox(){
    this.close.emit();
  }
@Output() add = new EventEmitter<string>();
  addTodo() {
    const text = this.newText.trim(); // CHANGED: using newText instead of newTodo signal

    if (text === '') return;

    this.add.emit(text);  // CHANGED: now emitting text to parent (app.ts) instead of adding locally
    this.newText = '';    // CHANGED: clearing newText instead of signal
    this.close.emit();    // CHANGED: closes modal after adding
  }
}

